import React from 'react';
import {
  ModalBody,
  Table,
} from 'reactstrap';

import ArticleCollapsable from './ArticleCollapsable';

type Props = {
visible?: boolean;
className?: string;
toggle?: ()=>void;
}

const PrivacyPolicyModalBodyFr = () => (
  <ModalBody>

    <ArticleCollapsable className="level-1" title="Préambule">
      <span>La présente politique de confidentialité a pour but d'exposer aux utilisateurs du site :</span>
      <ul>
        <li>
          La manière dont sont collectées et traitées leurs données à caractère personnel. Il s'agit notamment du prénom et du nom, l'adresse mail, la localisation de l'utilisateur ou encore son adresse IP, mais aussi toutes les données relatives a la maintenance de son bien et des équipements rattachés a ce bien ;
        </li>
        <li>
          Quels sont les droits des utilisateurs concernant ces données ;
        </li>
        <li>
          Qui est responsable du traitement des données à caractère personnel collectées et traitées ;
        </li>
        <li>
          A qui ces données sont transmises ;
        </li>
        <li>
          Eventuellement, la politique du site en matière de fichiers "cookies".
        </li>
      </ul>
    </ArticleCollapsable>
    <ArticleCollapsable className="level-1" title="Principes généraux sur la collecte et le traitement de données">
      <span>Conformément aux dispositions de l'article 5 du Règlement européen 2016/679, la collecte et le traitement des données des utilisateurs du site respectent les principes suivants :</span>
      <ul>
        <li>
          Licéité, loyauté et transparence : les données ne peuvent être collectées et traitées qu'avec le consentement de l'utilisateur propriétaire des données. A chaque fois que des données à caractère personnel seront collectées, il sera indiqué à l'utilisateur que ses données sont collectées, et pour quelles raisons ses données sont collectées ;
        </li>
        <li>
          Finalités limitées : la collecte et le traitement des données sont exécutés pour répondre à un ou plusieurs objectifs déterminés dans les présentes conditions générales d'utilisation ;
        </li>
        <li>
          Minimisation de la collecte et du traitement des données : seules les données nécessaires à la bonne exécution des objectifs poursuivis par le site sont collectées ;
        </li>
        <li>
          Conservation des données réduites dans le temps : les données sont conservées pour une durée limitée, dont l'utilisateur est informé. Lorsque cette information ne peut pas être communiquée, l'utilisateur est informé des critères utilisés pour déterminer la durée de conservation ;
        </li>
        <li>
          Intégrité et confidentialité des données collectées et traitées : le responsable du traitement des données s'engage à garantir l'intégrité et la confidentialité des données collectées.
        </li>
      </ul>
      <br />
      <span>Afin d'être licites, et ce conformément aux exigences de l'article 6 du règlement européen 2016/679, la collecte et le traitement des données à caractère personnel ne pourront intervenir que s'ils respectent au moins l'une des conditions ci-après énumérées :</span>
      <ul>
        <li>
          L'utilisateur a expressément consenti au traitement ;
        </li>
        <li>
          Le traitement est nécessaire à la bonne exécution d'un contrat ;
        </li>
        <li>
          Le traitement répond à une obligation légale ;
        </li>
        <li>
          Le traitement s'explique par une nécessité liée à la sauvegarde des intérêts vitaux de la personne concernée ou d'une autre personne physique ;
        </li>
        <li>
          Le traitement peut s'expliquer par une nécessité liée à l'exécution d'une mission d'intérêt public ou qui relève de l'exercice de l'autorité publique ;
        </li>
        <li>
          Le traitement et la collecte des données à caractère personnel sont nécessaires aux fins des intérêts légitimes et privés poursuivis par le responsable du traitement ou par un tiers.
        </li>
      </ul>
    </ArticleCollapsable>
    <ArticleCollapsable className="level-1" title="Les données personnelles collectées et traitées dans Equipment Maintenance">
      <ArticleCollapsable className="level-2" title="Données collectées et traitées et mode de collecte">
        <span>
          Sur le site web
          {' '}
          <strong>https://maintenance.ecogium.fr</strong>
          , il y a 2 types de données susceptibles d’être recueillies : les données transmises directement et les données collectées automatiquement.
        </span>
        <br />
        <br />
        <ArticleCollapsable className="level-3" title="Les données transmises directement">
          <span>Ces données sont celles que vous nous transmettez directement via les formulaires de saisie du site web : Le formulaire d’inscription mais aussi les formulaires de saisie permettant d’acquérir les données nécessaires pour remplir la principale mission du site web à savoir : assister l’utilisateur dans la gestion de la maintenance de son bien.</span>
          <br />
          <br />
          <span>Pour pouvoir authentifier l’utilisateur et lui offrir un espace membre, les champs « prénom et nom », « email » et « mot de passe » du formulaire d’inscription sont obligatoires lors de l’inscription de l’utilisateur.</span>
          <br />
          <br />
          <span>Ces données transmises directement sont conservées dans le navigateur de l’utilisateur pour une utilisation hors ligne mais aussi dans une base de données administrée par Ecogium sur un serveur OVH.</span>
        </ArticleCollapsable>
        <ArticleCollapsable className="level-3" title="Les données collectées automatiquement">
          <ul>
            <li>Lors de vos visites, une fois votre consentement donné, nous pouvons recueillir des informations de type « web analytics » relatives à votre navigation, la durée de votre consultation, votre adresse IP, votre type et version de navigateur, la préférence linguistique. La technologie utilisée est le cookie.</li>
            <li>
              Les données transmises directement par l’utilisateur sont encryptées grâce à un certificat SSL Let’s Encrypt. Par conséquent, lors de la navigation sur le site Equipment Maintenance,  le navigateur contactera automatiquement le serveur Let’s Encrypt afin de vérifier la validité du certificat. La politique de confidentialité de Let’s Encrypt est consultable à cette adresse :
              {' '}
              <a href="https://letsencrypt.org/privacy/#relying-party">https://letsencrypt.org/privacy/#relying-party</a>
            </li>
          </ul>
        </ArticleCollapsable>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Utilisation des données">
        <span>Les données que vous nous transmettez directement sont utilisées dans le but d’authentifier l’utilisateur et de l’assister dans la gestion de la maintenance de son bien et des équipements rattachés de façon sécurisé et confidentielle.</span>
        <br />
        <br />
        <span>Les données « web analytics » sont collectées de forme anonyme (en enregistrant des adresses IP anonymes) par Google Analytics, et nous permettent de mesurer l'audience du site web, les consultations et les éventuelles erreurs afin d’améliorer constamment l’expérience des utilisateurs.</span>
        <br />
        <br />
        <span><strong>Ces données sont utilisées uniquement par Ecogium et ne seront jamais cédées à un tiers ni utilisées à d’autres fins que celles détaillées ci-dessus.</strong></span>
        <br />
        <br />
        <span>Les données transmises aux serveurs Let’s Encrypt sont nécessaires afin de garantir l’encryptions des données directement transmises entre le navigateur de l’utilisateur et le serveur OVH administré par Ecogium dans le cadre de l’application Maintenance Equipment.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Base légale">
        <span>Les données personnelles ne sont collectées qu’après consentement obligatoire de l’utilisateur. Ce consentement est obtenu lors de l’inscription de l’utilisateur.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Durée de conservation">
        <span>Le responsable du traitement conservera dans ses systèmes informatiques du site et dans des conditions raisonnables de sécurité l'ensemble des données collectées aussi longtemps que l'utilisateur sera inscrit dans l'application.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Transmission des données à des tiers">
        <span>Les données à caractère personnel collectées par le site ne sont transmises à aucun tiers, et ne sont traitées que par Ecogium, l'éditeur du site.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Hébergement des données">
        <span>Le site Equipment Maintenance est hébergé par OVH, dont le siège est situé à l'adresse ci-après :</span>
        <br />
        <br />
        <span>2 rue Kellermann - 59100 Roubaix – France</span>
        <br />
        <br />
        <span>L'hébergeur peut être contacté au numéro de téléphone suivant : 1007</span>
        <br />
        <br />
        <span>Les données collectées et traitées par le site sont exclusivement hébergées et traitées en France.</span>
      </ArticleCollapsable>
    </ArticleCollapsable>
    <ArticleCollapsable className="level-1" title="Les responsables des données personnelles">
      <ArticleCollapsable className="level-2" title="Le responsable du traitement des données et le délégué à la protection des données">
        <span>
          Le responsable du traitement des données et le délégué à la protection des données à caractère personnel est
          {' '}
          <strong>Paul Torruella</strong>
          . Il peut être contacté de la manière suivante :
        </span>
        <ul>
          <li>
            Par téléphone : +33 6 07 71 27 94
          </li>
          <li>
            Par email : paul.torruella@gmail.com
          </li>
        </ul>
        <br />
        <span>Le responsable du traitement des données est chargé de déterminer les finalités et les moyens mis au service du traitement des données à caractère personnel.</span>
        <br />
        <br />
        <span>Le rôle du Délégué à la Protection des Données et de s'assurer la bonne mise en œuvre des dispositions nationales et supranationales relatives à la collecte et au traitement des données à caractère personnel. Il peut également être nommé DPO (pour Data Protection Officer).</span>

      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Obligations du responsable du traitement des données">
        <span>Le responsable du traitement s'engage à protéger les données à caractère personnel collectées, à ne pas les transmettre à des tiers sans que l'utilisateur n'en ait été informé et à respecter les finalités pour lesquelles ces données ont été collectées.</span>
        <br />
        <br />
        <span>Le site dispose d'un certificat SSL afin de garantir que les informations et le transfert des données transitant par le site sont sécurisés.</span>
        <br />
        <span>Un certificat SSL ("Secure Socket Layer" Certificate) a pour but de sécuriser les données échangées entre l'utilisateur et le site.</span>
        <br />
        <br />
        <span>De plus, le responsable du traitement des données s'engage à notifier l'utilisateur en cas de rectification ou de suppression des données, à moins que cela n'entraîne pour lui des formalités, coûts et démarches disproportionnés.</span>
        <br />
        <br />
        <span>Dans le cas où l'intégrité, la confidentialité ou la sécurité des données à caractère personnel de l'utilisateur est compromise, le responsable du traitement s'engage à informer l'utilisateur par tout moyen.</span>
      </ArticleCollapsable>
    </ArticleCollapsable>
    <ArticleCollapsable className="level-1" title="Droits de l'utilisateur">
      <span>Conformément à la réglementation concernant le traitement des données à caractère personnel, l'utilisateur possède les droits ci-après énumérés.</span>
      <br />
      <span>Afin que le responsable du traitement des données fasse droit à sa demande, l'utilisateur est tenu de lui communiquer : ses prénom et nom ainsi que son adresse e-mail.</span>
      <br />
      <span>Le responsable du traitement des données est tenu de répondre à l'utilisateur dans un délai de 30 (trente) jours maximum.</span>
      <br />
      <br />
      <ArticleCollapsable className="level-2" title="Droit d'accès, de rectification et droit à l'effacement">
        <span>
          L'utilisateur peut prendre connaissance, mettre à jour, modifier les données le concernant en utilisant les moyens mis à disposition sur le site en se connectant à son espace personnel.
          <br />
          <br />
          Il peut aussi demander la suppression des données le concernant, en envoyant un email au responsable de traitement des données personnelles, en précisant:
          <ul>
            <li>
              son nom
            </li>
            <li>
              prénom
            </li>
            <li>
              email
            </li>
            <li>
              l'objet de sa demande
            </li>
          </ul>
        </span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Droit à la portabilité des données">
        <span>
          L'utilisateur a le droit de demander la portabilité de ses données personnelles, détenues par le site, vers un autre site, en se conformant à la procédure ci-après :
          <br />
          <br />
          L'utilisateur doit faire sa demande de portabilité de ses données personnelles par e-mail au responsable de traitement des données personnelles en utilisant l'email mentionné plus haut.
          <br />
          <br />
          Le responsable de traitement des données effectuera une extraction des données personnelles de l'utilisateur au format json puis enverra par email ou tout autre moyen electronique une archive contenant l'extraction json et les photos que l'utilisateur aurait pu uploader dans le site.
        </span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Droit à la limitation et à l'opposition du traitement des données">
        <span>
          L'utilisateur a le droit de demander la limitation ou de s'opposer au traitement de ses données par le site, sans que le site ne puisse refuser, sauf à démontrer l'existence de motifs légitimes et impérieux, pouvant prévaloir sur les intérêts et les droits et libertés de l'utilisateur.
          <br />
          Afin de demander la limitation du traitement de ses données ou de formuler une opposition au traitement de ses données, l'utilisateur doit suivre la procédure suivante :
          <br />
          <br />
          L'utilisateur doit faire sa demande de limitation de traitement de ses données personnelles par e-mail au responsable de traitement des données personnelles en utilisant l'e-mail mentionné plus haut.
        </span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Droit de ne pas faire l'objet d'une décision fondée exclusivement sur un procédé automatisé">
        <span>Conformément aux dispositions du règlement 2016/679, l'utilisateur a le droit de ne pas faire l'objet d'une décision fondée exclusivement sur un procédé automatisé si la décision produit des effets juridiques le concernant, ou l'affecte de manière significative de façon similaire.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Droit de déterminer le sort des données après la mort">
        <span>Il est rappelé à l'utilisateur qu'il peut organiser quel doit être le devenir de ses données collectées et traitées s'il décède, conformément à la loi n°2016-1321 du 7 octobre 2016.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Droit de saisir l'autorité de contrôle compétente">
        <span>Dans le cas où le responsable du traitement des données décide de ne pas répondre à la demande de l'utilisateur, et que l'utilisateur souhaite contester cette décision, ou, s'il pense qu'il est porté atteinte à l'un des droits énumérés ci-dessus, il est en droit de saisir la CNIL (Commission Nationale de l'Informatique et des Libertés, https://www.cnil.fr) ou tout juge compétent.</span>
      </ArticleCollapsable>
    </ArticleCollapsable>
    <ArticleCollapsable className="level-1" title='Utilisation des fichiers "Cookies"'>
      <span>
        Le site a éventuellement recours aux techniques de "cookies".
        <br />
        Un "cookie" est un fichier de petite taille (moins de 4 ko), stocké par le site sur le disque dur de l'utilisateur, contenant des informations relatives aux habitudes de navigation de l'utilisateur.
        <br />
        Ces fichiers lui permettent de traiter des statistiques et des informations sur le trafic, de faciliter la navigation et d'améliorer le service pour le confort de l'utilisateur.
        <br />
        Pour l'utilisation de fichiers "cookies" impliquant la sauvegarde et l'analyse de données à caractère personnel, le consentement de l'utilisateur est nécessairement demandé.
        <br />
        Ce consentement de l'utilisateur est considéré comme valide pour une durée de 13 (treize) mois maximum. A l'issue de cette période, le site demandera à nouveau l'autorisation de l'utilisateur pour enregistrer des fichiers "cookies" sur son disque dur.
      </span>
      <br />
      <br />
      <ArticleCollapsable className="level-2" title="Opposition de l'utilisateur à l'utilisation de fichiers cookies par le site">
        <span>
          Il est porté à la connaissance de l'utilisateur qu'il peut s'opposer à l'enregistrement de ces fichiers "cookies" en configurant son logiciel de navigation.
          <br />
          Pour information, l'utilisateur peut trouver aux adresses suivantes les démarches à suivre afin de configurer son logiciel de navigation pour s'opposer à l'enregistrement des fichiers "cookies" :
        </span>
        <ul>
          <li>
            <strong>Chrome</strong>
            {' '}
            <a href="https://support.google.com/accounts/answer/61416?hl=fr">https://support.google.com/accounts/answer/61416?hl=fr</a>
          </li>
          <li>
            <strong>Firefox </strong>
            {' '}
            <a href="https://support.mozilla.org/fr/kb/enable-and-disable-cookies-website-preferences">https://support.mozilla.org/fr/kb/enable-and-disable-cookies-website-preferences</a>
          </li>
          <li>
            <strong>Safari </strong>
            {' '}
            <a href="http://www.apple.com/legal/privacy/fr-ww/">http://www.apple.com/legal/privacy/fr-ww/</a>
          </li>
          <li>
            <strong>Internet Explorer </strong>
            {' '}
            <a href="https://support.microsoft.com/fr-fr/help/17442/windows-internet-explorer-delete-manage-cookies">https://support.microsoft.com/fr-fr/help/17442/windows-internet-explorer-delete-manage-cookies</a>
          </li>
          <li>
            <strong>Opera </strong>
            {' '}
            <a href="http://www.opera.com/help/tutorials/security/cookies/">http://www.opera.com/help/tutorials/security/cookies/</a>
          </li>
        </ul>
        <span>Dans le cas où l'utilisateur décide de désactiver les fichiers "cookies", il pourra poursuivre sa navigation sur le site. Toutefois, tout dysfonctionnement du site provoqué par cette manipulation ne pourrait être considéré comme étant du fait de l'éditeur du site.</span>
      </ArticleCollapsable>
      <ArticleCollapsable className="level-2" title="Description des fichiers cookies utilisés par le site">
        <span>L'éditeur du site attire l'attention de l'utilisateur sur le fait que les cookies suivants sont utilisés lors de sa navigation :</span>
        <Table size="sm" responsive>
          <thead>
            <tr>
              <th>Nom du cookie</th>
              <th>Emetteur</th>
              <th>Finalités</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">_ga</th>
              <td>google analytics</td>
              <td>Analyse du comportement de l'utilisateur et du trafic</td>
            </tr>
            <tr>
              <th scope="row">authUser</th>
              <td>Equipment Maintenance (interne)</td>
              <td>Permet de récupérer l’utilisateur authentifié en utilisant l’authentification Google. </td>
            </tr>
          </tbody>
        </Table>
        <span>En naviguant sur le site, il est porté à connaissance de l'utilisateur que des fichiers "cookies" peuvent être enregistrés.</span>
      </ArticleCollapsable>
    </ArticleCollapsable>
    <ArticleCollapsable className="level-1" title="Conditions de modification de la politique de confidentialité">
      <span>La présente politique de confidentialité peut être consultée à tout moment à l'adresse ci-après indiquée :</span>
      <br />
      <br />
      <a href="https://maintenance.ecogium.fr/privacypolicy">https://maintenance.ecogium.fr/privacypolicy</a>
      <br />
      <br />
      <span>
        L'éditeur du site se réserve le droit de la modifier afin de garantir sa conformité avec le droit en vigueur.
        <br />
        Par conséquent, l'utilisateur est invité à venir consulter régulièrement cette politique de confidentialité afin de se tenir informé des derniers changements qui lui seront apportés.
        <br />
        Toutefois, en cas de modification substantielle de cette politique, l'utilisateur en sera informé par notification "push" lors de la prochaine visite de l'utilisateur.
        <br />
        Il est porté à la connaissance de l'utilisateur que la dernière mise à jour de la présente politique de confidentialité est intervenue le : 23/05/2020
      </span>
    </ArticleCollapsable>
  </ModalBody>
);

export default PrivacyPolicyModalBodyFr;
