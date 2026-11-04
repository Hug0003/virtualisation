import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'hyp',
  'Hyperviseurs, KVM et QEMU',
  'Ce qui se passe vraiment sous une machine virtuelle.',

  lesson(
    'Qu’est-ce qu’un hyperviseur ?',
    4,
    read(
      'Le chef des machines virtuelles',
      p('L’**hyperviseur** crée les machines virtuelles et leur partage le matériel réel : temps CPU, RAM, disques, réseau.'),
      table(
        ['', 'Type 1 (bare-metal)', 'Type 2 (hébergé)'],
        ['Installation', 'Directement sur le serveur', 'Comme une appli, dans un OS'],
        ['Exemples', 'Proxmox VE (KVM), VMware ESXi, Hyper-V', 'VirtualBox, VMware Workstation'],
        ['Usage', 'Production, datacenter', 'Tests sur son PC'],
        ['Performances', 'Maximales', 'Correctes, avec un intermédiaire en plus'],
      ),
      analogy('Type 1 : le propriétaire de l’immeuble gère lui-même les appartements. Type 2 : un locataire sous-loue des chambres dans son propre appartement.'),
    ),
    check('VMware ESXi est un hyperviseur de type…', ['1 (bare-metal)', '2 (hébergé)', 'Conteneur', 'Émulateur'], 'ESXi s’installe directement sur le serveur, à la place d’un OS classique.'),
    check('VirtualBox, installé sur votre PC Windows, est un hyperviseur de type…', ['2 (hébergé)', '1 (bare-metal)', '0', 'Paravirtualisé'], 'Il tourne comme une application à l’intérieur de Windows.'),
  ),

  lesson(
    'KVM et QEMU, le duo de Proxmox',
    6,
    read(
      'Deux rôles complémentaires',
      list(
        '**KVM** est un module du noyau Linux. Il utilise VT-x/AMD-V pour exécuter le code de la VM **directement sur le vrai processeur**. Il gère CPU et mémoire.',
        '**QEMU** émule **tout le reste** de la machine : BIOS/UEFI, disques, cartes réseau, écran, USB.',
      ),
      key('KVM = le moteur (CPU et RAM). QEMU = la carrosserie (tous les périphériques). Proxmox = le tableau de bord qui pilote les deux.'),
    ),
    read(
      'Une VM, vue depuis l’hôte',
      p('Sur l’hôte Proxmox, une VM qui tourne n’est qu’un **processus QEMU**, et chacun de ses vCPU est un **thread** de ce processus :'),
      code('ps aux | grep kvm\n# root  2210  ... /usr/bin/kvm -id 101 -name web01 ...'),
      p('Quand la VM fait une action sensible (accès disque, réseau…), le processeur la met en pause et rend la main à l’hyperviseur : c’est un **VM exit**. L’hyperviseur traite la demande, puis relance la VM (**VM entry**).'),
    ),
    check('Sur un hôte Proxmox, qu’est-ce qu’une VM en marche ?', ['Un processus QEMU', 'Un conteneur Docker', 'Un fichier dans /etc/pve', 'Un service systemd par disque'], 'Tuer ce processus revient à débrancher la prise de la VM.'),
    read(
      'VirtIO : aller plus vite',
      p('Émuler une vraie carte réseau Intel (e1000) coûte cher : chaque opération provoque des VM exits. Les pilotes **VirtIO** sont conçus pour les VM : l’invité sait qu’il est virtualisé et dialogue directement avec l’hyperviseur.'),
      p('C’est de la **paravirtualisation**. Sous Windows, il faut installer les pilotes VirtIO depuis un ISO dédié, sinon le disque VirtIO n’est même pas visible pendant l’installation.'),
    ),
    check('Pourquoi choisir une carte réseau VirtIO plutôt qu’une e1000 émulée ?', ['Elle est bien plus rapide, car paravirtualisée', 'Elle est compatible avec plus d’OS anciens', 'Elle n’a pas besoin de pilote', 'Elle donne une IP publique'], 'VirtIO évite d’émuler un vrai matériel : beaucoup moins de VM exits.'),
  ),

  lesson(
    'VM ou conteneur ?',
    5,
    read(
      'Deux façons d’isoler',
      table(
        ['', 'Machine virtuelle', 'Conteneur (LXC, Docker)'],
        ['Noyau', 'Le sien', 'Celui de l’hôte, partagé'],
        ['OS possibles', 'Tous (Windows, Linux, BSD…)', 'Linux uniquement (sur un hôte Linux)'],
        ['Démarrage', '30 s à quelques minutes', '1 à 2 secondes'],
        ['Surcoût', 'Un OS complet par VM', 'Très léger'],
        ['Isolation', 'Très forte', 'Bonne, mais un seul noyau commun'],
      ),
      p('Proxmox gère les deux : des **VM** (KVM/QEMU) et des **conteneurs LXC**, qui se comportent comme de petites machines Linux complètes.'),
    ),
    check('Pourquoi un conteneur LXC ne peut-il pas faire tourner Windows ?', ['Il partage le noyau Linux de l’hôte', 'Il manque de RAM', 'Il n’a pas de carte réseau', 'Il n’a pas d’UEFI'], 'Windows a besoin de son propre noyau Windows : il lui faut une VM.'),
    read(
      'Et Docker sur Windows ?',
      p('Docker utilise des conteneurs, donc le noyau Linux. Mais Windows n’a pas de noyau Linux !'),
      p('**Docker Desktop** contourne le problème avec **WSL 2** : une petite VM Linux très légère, lancée par l’hyperviseur de Windows. Cet hyperviseur s’active avec la **Plateforme de machine virtuelle**.'),
      code('Windows\n └─ hyperviseur (Plateforme de machine virtuelle)\n     └─ mini-VM WSL 2 (noyau Linux)\n         └─ moteur Docker\n             └─ vos conteneurs'),
      key('Pas d’hyperviseur → pas de VM WSL 2 → pas de noyau Linux → pas de conteneurs. Les conteneurs reposent toujours sur un noyau Linux quelque part.'),
    ),
    check(
      'Sur Proxmox, quelle est la méthode recommandée pour utiliser Docker ?',
      ['L’installer dans une VM', 'L’installer directement sur l’hôte Proxmox', 'L’installer dans le BIOS', 'C’est impossible'],
      'Docker dans une VM reste isolé de l’hyperviseur et ne casse pas lors des mises à jour de Proxmox.',
    ),
  ),
)
