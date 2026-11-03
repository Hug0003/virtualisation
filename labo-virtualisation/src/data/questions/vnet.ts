import { themeBuilder } from '../build'

const t = themeBuilder('vnet')

t.mcq("Sous Linux et Proxmox, qu'est-ce qu'un bridge ?", ["Un switch virtuel logiciel", "Un routeur", "Un pare-feu", "Une carte réseau physique"],
  "Les cartes des VM se branchent sur le bridge, lui-même relié à une vraie carte (l'uplink).")
t.mcq("Comment s'appelle le bridge créé par défaut à l'installation de Proxmox ?", ["vmbr0", "br0", "vSwitch0", "eth0"],
  "Les suivants s'appellent vmbr1, vmbr2…")
t.mcq("Dans quel fichier Proxmox stocke-t-il la configuration réseau de l'hôte ?", ["/etc/network/interfaces", "/etc/pve/network.cfg", "/etc/netplan/01.yaml", "/etc/sysconfig/network"],
  "Il est appliqué par ifupdown2, sans redémarrage, avec [[ifreload -a]].")
t.mcq("Que permet l'option [[bridge-vlan-aware yes]] ?", ["Mettre un tag VLAN différent sur chaque VM", "Créer un bond", "Activer le NAT", "Doubler le débit"],
  "On indique le VLAN Tag dans la carte réseau de la VM, et le port du switch physique doit être en trunk.")
t.mcq("Quel mode de bond ne demande aucune configuration du switch, mais n'utilise qu'une carte à la fois ?", ["active-backup", "802.3ad", "balance-rr", "balance-xor"],
  "L'autre carte prend le relais en cas de panne. C'est le mode le plus simple.")
t.mcq("Que faut-il configurer sur le switch pour un bond en mode 802.3ad ?", ["LACP (un port-channel)", "Rien", "Un VLAN natif", "Le spanning tree"],
  "802.3ad est négocié avec le switch : sans LACP en face, le lien ne monte pas correctement.")
t.mcq("Un bond LACP 2 × 10 Gb/s : quel débit pour UNE seule copie de fichier ?", ["10 Gb/s au maximum", "20 Gb/s", "5 Gb/s", "40 Gb/s"],
  "La répartition se fait par flux. Le gain apparaît quand il y a beaucoup de flux en parallèle.")
t.mcq("Dans Open vSwitch, à quoi sert un OVSIntPort ?", ["Donner une IP à l'hôte sur le bridge OVS, éventuellement dans un VLAN", "Agréger des cartes", "Créer un tunnel VXLAN", "Brancher une VM"],
  "Exemple : l'IP de gestion dans le VLAN 10, avec [[ovs_options tag=10]].")
t.mcq("Quelle erreur faut-il éviter avec Open vSwitch ?", ["Mélanger un bond Linux avec un bridge OVS", "Utiliser des VLAN", "Utiliser LACP", "Mettre une IP sur l'hôte"],
  "Restez cohérent : tout en Linux ou tout en OVS.")
t.mcq("Une VM en mode NAT…", ["Sort sur Internet, mais n'est pas joignable de l'extérieur sans redirection", "Est directement sur le réseau local", "N'a aucun accès réseau", "A sa propre IP publique"],
  "Utile sur un serveur loué avec une seule IP publique.")
t.mcq("Un bridge sans carte physique ([[bridge-ports none]]) crée…", ["Un réseau interne isolé entre VM", "Un réseau public", "Un bond", "Un VLAN trunk"],
  "Parfait pour un lab : un pare-feu virtuel (OPNsense) route entre ce réseau et vmbr0.")
t.mcq("Que fait VXLAN ?", ["Il transporte un réseau de niveau 2 dans de l'UDP, à travers du niveau 3", "Il chiffre les VLAN", "Il agrège des cartes", "Il remplace le DNS"],
  "Utilisé par le SDN de Proxmox (zones VXLAN, EVPN) et, sous un autre nom (Geneve), par NSX.")
t.mcq("Dans le SDN de Proxmox, qu'est-ce qu'un VNet ?", ["Le réseau virtuel auquel on branche les VM", "Le type de réseau (VLAN, VXLAN…)", "Un sous-réseau IP", "Un pare-feu"],
  "Zone = le type, VNet = le réseau, Subnet = l'adressage IP du VNet.")
t.mcq("Avant d'activer le pare-feu au niveau Datacenter, que faut-il autoriser ?", ["Les ports 8006 et 22 depuis le réseau d'administration", "Tout le trafic sortant", "Le port 80", "Rien"],
  "Sinon, on risque de s'enfermer dehors et de devoir passer par la console physique.")
t.mcq("De quoi le réseau Corosync a-t-il surtout besoin ?", ["D'une latence faible et stable", "D'un gros débit", "De jumbo frames", "D'une IP publique"],
  "Moins de 2 à 5 ms. Donnez-lui une carte dédiée et un second lien de secours.")
t.mcq("Côté hôte Proxmox, que représente l'interface [[tap100i0]] ?", ["La carte réseau 0 de la VM 100", "Le bridge 100", "Le VLAN 100", "Le bond 0"],
  "Cette interface est branchée sur le bridge (vmbr0) : c'est le « câble » de la VM.")
t.mcq("Pourquoi faut-il le mode promiscuité « Allow All » dans VirtualBox pour un lab Proxmox imbriqué ?", ["Pour laisser passer les trames des MAC des VM imbriquées", "Pour accélérer le CPU", "Pour activer VT-x", "Pour le DHCP"],
  "Sinon VirtualBox ne laisse passer que la MAC de la VM Proxmox, et les VM imbriquées n'ont pas de réseau.")

t.cmd("Appliquez la nouvelle configuration réseau sans redémarrer.", "ifreload -a",
  /^ifreload -a$/, "C'est ce que fait le bouton « Apply Configuration » de l'interface web.")
t.cmd("Affichez la topologie Open vSwitch.", "ovs-vsctl show",
  /^ovs-vsctl show$/, "[[ovs-appctl bond/show]] et [[ovs-appctl lacp/show]] détaillent les bonds.")

t.order("Remettez dans l'ordre le trajet d'un paquet qui sort d'une VM Proxmox.",
  ["L'application de la VM envoie des données", "Le pilote VirtIO de la VM les passe à sa carte virtuelle", "L'interface tap100i0 sur l'hôte", "Le bridge vmbr0", "La carte physique eno1", "Le switch physique"],
  "Pour le reste du réseau, la VM est une machine comme une autre, avec sa MAC et son IP.")

export default t.list
