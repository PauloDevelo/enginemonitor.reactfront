import packageJson from '../package.json';

export interface Global{
  getAppVersion(): string;
}

class EquipmentMaintenanceGlobal implements Global {
  getAppVersion = () => packageJson.version
}

const appVersion:Global = new EquipmentMaintenanceGlobal();

export default appVersion;
