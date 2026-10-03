# Deploy script for the enginemonitor frontend (build locally, ship to snpdnd).
# Usage:
#   deploy-frontend.ps1              build (cached npm ci) + ship + verify
#   deploy-frontend.ps1 -SkipBuild   ship the existing .\build folder as-is
#   deploy-frontend.ps1 -Rollback    swap www <-> www_prev on the server
#   deploy-frontend.ps1 -DryRun      print the steps without executing
# Build runs in a node:14 container (node-sass cannot compile on Node 17+).
[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$Rollback,
    [switch]$DryRun
)
$ErrorActionPreference = 'Stop'

$Repo      = Split-Path -Parent $PSScriptRoot
$Remote    = 'snpdnd'
$Target    = '/opt/enginemonitor/www'
$Prev      = '/opt/enginemonitor/www_prev'
$Image     = 'node:14'
$Volume    = 'em_front_node_modules'
$Stamp     = Get-Date -Format 'yyyyMMdd-HHmmss'
$TgzLocal  = Join-Path $env:TEMP "em-www-$Stamp.tgz"
$TgzRemote = "em-www-$Stamp.tgz"
$LockPath  = Join-Path $Repo 'package-lock.json'
$StampPath = Join-Path $Repo '.deploy-npmci-stamp'
$BindSrc   = $Repo.Replace('\', '/')

$mountArgs = @(
    '--mount', "type=bind,source=$BindSrc,target=/app",
    '--mount', "type=volume,source=$Volume,target=/app/node_modules"
)

function Invoke-Step {
    param([string]$Description, [scriptblock]$Action)
    if ($DryRun) { Write-Host "DRYRUN: $Description" } else {
        Write-Host "== $Description =="
        & $Action
        if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Step failed: $Description" }
    }
}

if ($Rollback) {
    $script = @"
set -e
if [ ! -d $Prev ]; then echo 'NO_PREV_BUNDLE'; exit 1; fi
sudo rm -rf /opt/enginemonitor/www_tmp
sudo mv $Target /opt/enginemonitor/www_tmp
sudo mv $Prev $Target
sudo mv /opt/enginemonitor/www_tmp $Prev
echo ROLLED_BACK
"@
    Write-Host '== Rollback: swapping www <-> www_prev on snpdnd =='
    if ($DryRun) { Write-Host $script } else { $script | ssh $Remote 'sudo bash -s' }
    return
}

# --- Build (docker node:14, node_modules cached in a named volume) -----------
if (-not $SkipBuild) {
    $lockHash = (Get-FileHash $LockPath -Algorithm MD5).Hash
    $needCi = $true
    if (Test-Path $StampPath) {
        if ((Get-Content $StampPath -Raw).Trim() -eq $lockHash) { $needCi = $false }
    }
    if ($needCi) {
        Invoke-Step 'npm ci in node:14 container (node_modules cached in docker volume)' {
            docker --context desktop-linux run --rm @mountArgs -w /app $Image npm ci --no-audit --no-fund
        }
        if (-not $DryRun) { Set-Content -Path $StampPath -Value $lockHash }
    } else {
        Write-Host 'package-lock.json unchanged -> skipping npm ci (cached node_modules volume)'
    }
    Invoke-Step 'npm run just-build (build without tests)' {
        docker --context desktop-linux run --rm @mountArgs -w /app -e REACT_APP_API_URL_BASE=https://maintenance.ecogium.fr/api/ $Image npm run just-build
    }
    if (-not (Test-Path (Join-Path $Repo 'build\index.html'))) { throw 'build/index.html not found - build failed' }
} else {
    Write-Host 'SkipBuild: shipping existing build folder'
}

# --- Package & upload ---------------------------------------------------------
Invoke-Step "Package build/ -> $TgzLocal" {
    tar czf $TgzLocal -C (Join-Path $Repo 'build') .
}
Invoke-Step "Upload to ${Remote}:/tmp/$TgzRemote" {
    scp -q $TgzLocal "${Remote}:/tmp/$TgzRemote"
}

# --- Swap & verify on the server ----------------------------------------------
$script = @"
set -e
sudo rm -rf $Prev
sudo mv $Target $Prev
sudo mkdir -p $Target
sudo tar xzf /tmp/$TgzRemote -C $Target
sudo chown -R debian:debian $Target
sudo chmod -R a+rX $Target
rm -f /tmp/$TgzRemote
# certbot --redirect makes port 80 return 301: verify over https with --resolve
code=`$(curl -sk -o /dev/null -w '%{http_code}' --resolve maintenance.ecogium.fr:443:127.0.0.1 https://maintenance.ecogium.fr/)
ping=`$(curl -sk --resolve maintenance.ecogium.fr:443:127.0.0.1 https://maintenance.ecogium.fr/api/server/ping)
echo "index:`$code ping:`$ping"
"@
Write-Host '== Swap www -> www_prev and deploy new bundle =='
if ($DryRun) { Write-Host $script } else {
    $result = ($script | ssh $Remote 'sudo bash -s') -join "`n"
    Write-Host $result
    if ($LASTEXITCODE -ne 0) { throw "ssh/remote step failed (exit $LASTEXITCODE) - previous bundle kept in www_prev" }
    if ($result -notmatch 'ping:\{"pong":true\}') { throw 'Post-deploy verification FAILED - see output above (previous bundle kept in www_prev)' }
    Write-Host 'FRONTEND DEPLOY OK'
}
