import { analogy, chapter, check, key, lesson, list, p, read, table } from './build'

export default chapter(
  'net',
  'Les bases du réseau',
  'Adresses, masques, switchs et routeurs : de quoi relier les VM au monde.',

  lesson(
    'Adresses IP et masques',
    6,
    read(
      'Une adresse en deux parties',
      p('Une adresse **IPv4** fait 32 bits, écrits en 4 nombres de 0 à 255 : [[192.168.1.25]].'),
      p('Elle se découpe en deux : la partie **réseau** (le quartier) et la partie **hôte** (le numéro de la maison). Le **masque** indique où est la frontière.'),
      table(['Notation CIDR', 'Masque', 'Adresses d’hôtes'], ['/24', '255.255.255.0', '254'], ['/25', '255.255.255.128', '126'], ['/26', '255.255.255.192', '62'], ['/16', '255.255.0.0', '65 534']),
    ),
    read(
      'Deux adresses réservées',
      p('Dans chaque réseau, deux adresses ne peuvent pas être données à une machine :'),
      list('la **première**, l’adresse du réseau lui-même : [[192.168.1.0]] ;', 'la **dernière**, le **broadcast**, qui touche tout le monde : [[192.168.1.255]].'),
      key('Nombre d’hôtes = 2^(32 − CIDR) − 2. Pour un /24 : 2⁸ − 2 = 254.'),
    ),
    check('Combien d’hôtes peut-on adresser dans un réseau /24 ?', ['254', '256', '255', '24'], '2⁸ = 256 adresses, moins le réseau et le broadcast.'),
    check(
      'Les machines 192.168.1.10/24 et 192.168.2.10/24 sont-elles dans le même réseau ?',
      ['Non : le troisième octet diffère', 'Oui : elles commencent par 192.168', 'Oui : le masque est le même', 'On ne peut pas savoir'],
      'Avec un /24, les trois premiers octets forment le réseau : 192.168.1 et 192.168.2 sont deux réseaux différents. Il faut un routeur entre eux.',
    ),
  ),

  lesson(
    'Switch, routeur, passerelle',
    5,
    read(
      'Deux étages',
      table(
        ['Équipement', 'Couche', 'Il regarde…', 'Rôle'],
        ['Switch', '2 (liaison)', 'L’adresse **MAC**', 'Relier les machines d’un même réseau'],
        ['Routeur', '3 (réseau)', 'L’adresse **IP**', 'Relier des réseaux différents'],
      ),
      p('L’adresse **MAC** est gravée dans la carte réseau (ex. [[bc:24:11:5e:3a:01]]). Le protocole **ARP** fait le lien entre une IP et une MAC.'),
      analogy('Le switch est le facteur d’un immeuble : il connaît chaque boîte aux lettres. Le routeur est la poste centrale : il envoie le courrier vers les autres villes.'),
    ),
    check('Sur quelle information un switch se base-t-il pour transmettre une trame ?', ['L’adresse MAC de destination', 'L’adresse IP de destination', 'Le nom DNS', 'Le port TCP'], 'Le switch travaille en couche 2 et tient une table MAC → port.'),
    read(
      'Passerelle, DNS et DHCP',
      list(
        'La **passerelle par défaut** est le routeur à qui on confie tout ce qui sort de son réseau.',
        'Le **DNS** traduit un nom ([[proxmox.com]]) en adresse IP.',
        'Le **DHCP** distribue automatiquement une IP, un masque, une passerelle et un DNS aux machines qui arrivent.',
      ),
      key('Un serveur comme Proxmox a toujours une **IP fixe**, configurée à la main : on doit pouvoir le retrouver à la même adresse.'),
    ),
    check('Une VM ping sa voisine mais pas Internet. Quel réglage est le premier suspect ?', ['La passerelle par défaut', 'L’adresse MAC', 'Le nom d’hôte', 'Le nombre de vCPU'], 'Sans passerelle (ou avec une mauvaise), les paquets ne quittent jamais le réseau local.'),
  ),

  lesson(
    'VLAN et ports',
    5,
    read(
      'Les VLAN',
      p('Un **VLAN** découpe un switch physique en plusieurs réseaux isolés. Chaque VLAN a un numéro de 1 à 4094.'),
      list('Un port **access** appartient à un seul VLAN : la machine branchée ne voit rien d’autre.', 'Un port **trunk** transporte plusieurs VLAN : chaque trame porte une étiquette **802.1Q** avec son numéro.'),
      p('Entre le switch et un serveur Proxmox, on utilise un **trunk** : les VM de différents VLAN partagent le même câble.'),
    ),
    check('Quel type de port relie un switch à un hyperviseur qui héberge des VM de plusieurs VLAN ?', ['Un port trunk (802.1Q)', 'Un port access', 'Un port console', 'Un port USB'], 'Le trunk transporte plusieurs VLAN étiquetés sur un même lien.'),
    read(
      'Les ports à connaître',
      p('Une IP désigne une machine ; un **port** désigne un service sur cette machine.'),
      table(['Port', 'Service'], ['22', 'SSH'], ['80 / 443', 'HTTP / HTTPS'], ['8006', 'Interface web de Proxmox VE'], ['3128', 'Proxy SPICE de Proxmox'], ['5405-5412 (UDP)', 'Corosync, le cluster Proxmox'], ['8007', 'Proxmox Backup Server']),
    ),
    check('Sur quel port se connecte-t-on à l’interface web de Proxmox VE ?', ['8006', '443', '8080', '22'], 'https://<ip-du-serveur>:8006, avec un certificat auto-signé au départ.'),
  ),
)
