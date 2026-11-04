import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'vnet',
  'Le réseau virtuel',
  'Des switchs qui n’existent que dans le logiciel.',

  lesson(
    'Le bridge Linux vmbr0',
    6,
    read(
      'Un switch virtuel',
      p('Un **bridge** Linux est un switch logiciel. Proxmox en crée un à l’installation : **vmbr0**.'),
      list(
        'La carte réseau physique (ex. [[enp3s0]]) est branchée dessus, comme un câble vers le switch du bureau.',
        'Chaque carte réseau de VM y est reliée par une interface virtuelle ([[tap101i0]]).',
        'L’**IP de l’hôte** Proxmox est portée par le bridge, pas par la carte physique.',
      ),
      analogy('vmbr0 est une multiprise réseau à l’intérieur du serveur : la carte physique y est branchée d’un côté, et toutes les VM de l’autre.'),
    ),
    read(
      'Le fichier de configuration',
      code('# /etc/network/interfaces\nauto vmbr0\niface vmbr0 inet static\n    address 192.168.1.10/24\n    gateway 192.168.1.1\n    bridge-ports enp3s0\n    bridge-stp off\n    bridge-fd 0'),
      p('Après une modification, on applique sans redémarrer avec [[ifreload -a]].'),
      key('Les VM reliées à vmbr0 sont sur le même réseau que l’hôte : elles reçoivent une IP de la box ou du DHCP du réseau, comme un vrai PC.'),
    ),
    check('Sur un Proxmox standard, quelle interface porte l’adresse IP de l’hôte ?', ['vmbr0, le bridge', 'La carte physique enp3s0', 'lo', 'tap100i0'], 'La carte physique est un simple « port » du bridge ; l’IP est sur vmbr0.'),
    check('Quelle commande applique une nouvelle configuration réseau sans redémarrer ?', ['ifreload -a', 'systemctl restart vmbr0', 'ip reload', 'pvecm reload'], 'ifreload vient du paquet ifupdown2, installé par défaut sur Proxmox.'),
  ),

  lesson(
    'VLAN et agrégation de liens',
    6,
    read(
      'Un bridge VLAN-aware',
      p('En cochant **VLAN aware** sur vmbr0, un seul bridge transporte tous les VLAN. On choisit ensuite le VLAN dans la carte réseau de chaque VM (champ **VLAN Tag**).'),
      code('auto vmbr0\niface vmbr0 inet manual\n    bridge-ports enp3s0\n    bridge-vlan-aware yes\n    bridge-vids 2-4094'),
      p('Le port du switch physique en face doit être en **trunk**.'),
    ),
    check('Comment place-t-on une VM dans le VLAN 20 avec un bridge VLAN-aware ?', ['On met 20 dans le champ VLAN Tag de sa carte réseau', 'On crée un bridge vmbr20', 'On change l’IP de l’hôte', 'On redémarre le switch'], 'Le bridge étiquette alors le trafic de cette VM avec le VLAN 20.'),
    read(
      'Le bonding',
      p('Un **bond** regroupe plusieurs cartes physiques en une seule interface logique :'),
      table(['Mode', 'Principe', 'Config du switch'], ['active-backup', 'Une carte active, l’autre en secours', 'Aucune'], ['802.3ad (LACP)', 'Les cartes travaillent ensemble, débit cumulé', 'LACP à configurer sur le switch'], ['balance-alb', 'Répartition adaptative', 'Aucune']),
      p('On place ensuite le bond sous le bridge : [[bridge-ports bond0]].'),
    ),
    check('Quel mode de bonding fonctionne sans rien configurer sur le switch, juste pour la redondance ?', ['active-backup', '802.3ad (LACP)', 'balance-xor', 'broadcast'], 'Une seule carte travaille ; si elle tombe, l’autre prend le relais.'),
  ),

  lesson(
    'Open vSwitch, NAT et SDN',
    5,
    read(
      'Open vSwitch',
      p('**Open vSwitch (OVS)** est un switch virtuel plus avancé que le bridge Linux : VLAN, tunnels, règles de flux, sondes… Proxmox le propose en option (paquet [[openvswitch-switch]]).'),
      p('Pour la plupart des installations, le **bridge Linux** suffit et reste le choix par défaut.'),
    ),
    read(
      'Bridgé ou NAT ?',
      table(['Mode', 'La VM…', 'Quand l’utiliser'], ['Bridgé', 'a une IP du réseau physique, visible de tous', 'Serveurs, cas général'], ['NAT', 'est cachée derrière l’IP de l’hôte', 'Labo, hébergeur qui ne donne qu’une seule IP']),
      p('Le **SDN** de Proxmox (Datacenter → SDN) crée des réseaux virtuels (**zones** et **VNets**) identiques sur tous les nœuds du cluster, y compris des réseaux qui traversent les serveurs (VXLAN).'),
      key('Retenez l’ordre : la VM → sa carte virtuelle → le bridge (vmbr0) → la carte physique → le switch → le routeur.'),
    ),
    check('En mode NAT, comment le reste du réseau voit-il la VM ?', ['Avec l’adresse IP de l’hôte', 'Avec sa propre IP publique', 'Il ne la voit pas du tout, même en sortie', 'Avec l’adresse MAC de la VM'], 'La VM sort sous l’IP de l’hôte, qui traduit les adresses.'),
    check('À quoi sert le SDN de Proxmox ?', ['Créer des réseaux virtuels identiques sur tous les nœuds du cluster', 'Remplacer le pare-feu', 'Sauvegarder les VM', 'Gérer les disques Ceph'], 'Zones et VNets sont définis une fois au niveau du datacenter.'),
  ),
)
