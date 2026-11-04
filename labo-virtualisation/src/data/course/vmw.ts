import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'vmw',
  'VMware vSphere',
  'Le leader historique des datacenters, et ses équivalences avec Proxmox.',

  lesson(
    'ESXi et vCenter',
    5,
    read(
      'Deux briques',
      list(
        '**ESXi** est l’hyperviseur de type 1, installé sur chaque serveur.',
        '**vCenter Server** est une appliance (une VM) qui pilote tous les ESXi : c’est lui qui active le cluster, vMotion, DRS et HA.',
      ),
      p('L’ensemble s’appelle **vSphere**. Depuis le rachat par **Broadcom** (2023-2024), les licences ne sont plus vendues qu’en abonnement groupé, souvent bien plus cher : beaucoup d’entreprises étudient Proxmox comme alternative.'),
    ),
    read(
      'La hiérarchie',
      code('vCenter\n └─ Datacenter\n     └─ Cluster\n         ├─ Hôte ESXi 1\n         │   └─ VM\n         └─ Hôte ESXi 2\n             └─ VM'),
      analogy('vCenter est la tour de contrôle d’un aéroport, et chaque ESXi une piste. Les pistes fonctionnent seules, mais la coordination passe par la tour.'),
    ),
    check('Quel composant VMware est indispensable pour utiliser vMotion, DRS et HA ?', ['vCenter Server', 'ESXi seul', 'VMware Workstation', 'vSAN'], 'Un ESXi seul se gère hôte par hôte ; les fonctions de cluster passent par vCenter.'),
    check('Dans la hiérarchie vSphere, qu’est-ce qui contient directement les hôtes ESXi ?', ['Le cluster', 'La VM', 'Le datastore', 'Le port group'], 'vCenter → Datacenter → Cluster → Hôtes → VM.'),
  ),

  lesson(
    'vMotion, DRS et HA',
    5,
    read(
      'Les fonctions de cluster',
      table(
        ['VMware', 'Rôle', 'Équivalent Proxmox'],
        ['vMotion', 'Migrer une VM à chaud', 'Migration à chaud (live migration)'],
        ['Storage vMotion', 'Déplacer les disques d’une VM à chaud', 'Déplacement de disque (Move disk)'],
        ['HA', 'Redémarrer les VM après la panne d’un hôte', 'HA (ha-manager)'],
        ['DRS', 'Équilibrer automatiquement la charge entre hôtes', 'CRS, plus limité'],
        ['Fault Tolerance', 'Une copie de la VM en temps réel, zéro coupure', 'Pas d’équivalent direct'],
      ),
    ),
    check('Quelle fonction VMware répartit automatiquement les VM selon la charge des hôtes ?', ['DRS', 'vMotion', 'HA', 'vSAN'], 'DRS (Distributed Resource Scheduler) utilise vMotion pour équilibrer la charge.'),
    check('Quel est l’équivalent Proxmox de vMotion ?', ['La migration à chaud', 'La sauvegarde vzdump', 'Le snapshot', 'Le clone lié'], 'Même principe : la RAM est copiée pendant que la VM tourne.'),
  ),

  lesson(
    'Réseau, stockage et comparaison',
    6,
    read(
      'Le vocabulaire VMware',
      table(
        ['VMware', 'Équivalent Proxmox'],
        ['vSwitch standard', 'Bridge Linux (vmbr0) sur un nœud'],
        ['vSphere Distributed Switch', 'SDN : même réseau sur tout le cluster'],
        ['Port group', 'VLAN Tag sur la carte de la VM, ou VNet'],
        ['Datastore VMFS', 'Stockage (LVM, ZFS…)'],
        ['vSAN', 'Ceph'],
        ['VMware Tools', 'QEMU Guest Agent + pilotes VirtIO'],
        ['VMXNET3, PVSCSI', 'VirtIO net, VirtIO SCSI'],
        ['Fichier .vmdk', 'Disque .qcow2 ou volume raw'],
      ),
    ),
    check('Quel est l’équivalent Proxmox de vSAN ?', ['Ceph', 'ZFS', 'NFS', 'LVM-thin'], 'Les deux transforment les disques locaux des hôtes en un stockage partagé du cluster.'),
    read(
      'Migrer de VMware vers Proxmox',
      p('Proxmox VE 8 et 9 intègrent un **assistant d’import ESXi** : on ajoute l’ESXi comme stockage, puis on importe les VM en quelques clics.'),
      list('Désinstaller les **VMware Tools** dans la VM.', 'Préparer les **pilotes VirtIO** (surtout sous Windows).', 'Vérifier le type de firmware (BIOS ou UEFI) et la carte réseau après l’import.'),
      key('Les concepts sont les mêmes partout : hyperviseur, stockage partagé, réseau virtuel, cluster, quorum, migration, HA, sauvegarde. Seuls les noms changent.'),
    ),
    check('Avant de migrer une VM Windows de VMware vers Proxmox, que faut-il préparer ?', ['Les pilotes VirtIO', 'Une licence vCenter', 'Un cluster Ceph', 'Un switch distribué'], 'Sans pilote VirtIO, Windows ne voit ni le disque ni la carte réseau VirtIO au démarrage.'),
  ),
)
