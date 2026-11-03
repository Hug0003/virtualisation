import { themeBuilder } from '../build'

const t = themeBuilder('net')

t.mcq("Sur quelle adresse un switch se base-t-il pour envoyer une trame ?", ["L'adresse MAC (couche 2)", "L'adresse IP (couche 3)", "Le port TCP (couche 4)", "Le nom DNS"],
  "Le switch apprend quelle MAC se trouve derrière quel port (sa table MAC).")
t.mcq("Sur quelle adresse un routeur se base-t-il ?", ["L'adresse IP (couche 3)", "L'adresse MAC", "Le port TCP", "Le VLAN"],
  "Le routeur relie des réseaux différents et transfère les paquets selon l'IP de destination.")
t.mcq("Qu'identifie un numéro de port (22, 443…) ?", ["Le service, l'application, sur la machine", "La machine", "La carte réseau", "Le VLAN"],
  "IP = l'immeuble, port = l'appartement. Couche 4 (TCP/UDP).")
t.mcq("À quoi sert ARP ?", ["Trouver l'adresse MAC qui correspond à une IP", "Traduire un nom en IP", "Distribuer des IP", "Chiffrer les trames"],
  "« Qui a 192.168.1.10 ? » en broadcast, et la machine répond avec sa MAC.")
t.mcq("À quoi sert le DNS ?", ["Traduire un nom (proxmox.com) en adresse IP", "Distribuer des adresses IP", "Router les paquets", "Chiffrer le trafic"],
  "Si [[ping 8.8.8.8]] marche mais pas [[ping debian.org]], c'est le DNS.")
t.mcq("À quoi sert le DHCP ?", ["Distribuer automatiquement la configuration IP", "Traduire les noms", "Filtrer le trafic", "Créer des VLAN"],
  "Il donne IP, masque, passerelle et DNS. Les serveurs ont plutôt une IP fixe.")
t.mcq("Laquelle de ces plages n'est PAS privée ?", ["8.8.8.0/24", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  "Les trois plages privées sont 10/8, 172.16/12 et 192.168/16. 8.8.8.8 est le DNS public de Google.")
t.mcq("Que désigne 127.0.0.1 ?", ["La machine elle-même (localhost)", "La passerelle", "Le serveur DNS", "Le broadcast"],
  "Toute la plage 127.0.0.0/8 est réservée au bouclage local.")
t.mcq("Qu'est-ce que la passerelle par défaut ?", ["Le routeur par lequel on sort de son réseau", "Le serveur DHCP", "Le switch principal", "Le pare-feu de l'hyperviseur"],
  "Une machine ne parle directement qu'à son réseau ; tout le reste passe par la passerelle.")
t.mcq("Quelle est la différence entre TCP et UDP ?", ["TCP garantit la livraison dans l'ordre, UDP non", "UDP est chiffré, TCP non", "TCP est pour le local, UDP pour Internet", "Aucune"],
  "Web et SSH en TCP ; DNS, VoIP et Corosync en UDP.")
t.mcq("Que fait le NAT ?", ["Il remplace les IP privées par une IP publique en sortie", "Il crée des VLAN", "Il chiffre le trafic", "Il agrège des cartes réseau"],
  "De l'extérieur, une machine derrière le NAT n'est joignable qu'avec une redirection de port.")
t.mcq("Quelle est la différence entre un port access et un port trunk ?", ["Access = un seul VLAN ; trunk = plusieurs VLAN étiquetés", "Access = Wi-Fi ; trunk = câble", "Access = 1 Gb/s ; trunk = 10 Gb/s", "Access = entrant ; trunk = sortant"],
  "Un hyperviseur est presque toujours relié à un port trunk, pour placer chaque VM dans son VLAN.")
t.mcq("Quelle norme définit les VLAN ?", ["802.1Q", "802.3ad", "802.11ac", "802.1X"],
  "802.3ad = LACP, 802.11 = Wi-Fi, 802.1X = authentification réseau.")
t.mcq("Quel est le plus grand numéro de VLAN utilisable ?", ["4094", "255", "1024", "65535"],
  "Le tag fait 12 bits (0 à 4095), mais 0 et 4095 sont réservés.")
t.mcq("Comment deux VLAN différents peuvent-ils communiquer ?", ["En passant par un routeur ou un pare-feu", "Directement par le switch", "Avec un câble croisé", "Ils ne peuvent jamais"],
  "C'est tout l'intérêt : le pare-feu filtre ce qui passe d'un VLAN à l'autre.")
t.mcq("Quelle est la MTU Ethernet par défaut ?", ["1 500 octets", "9 000 octets", "64 octets", "65 535 octets"],
  "Les jumbo frames (MTU 9000) servent souvent au réseau de stockage. La MTU doit être identique de bout en bout.")
t.mcq("Quelle est l'adresse MAC de broadcast ?", ["ff:ff:ff:ff:ff:ff", "00:00:00:00:00:00", "01:00:5e:00:00:01", "fe:fe:fe:fe:fe:fe"],
  "Une trame broadcast est reçue par toutes les machines du réseau local (le domaine de broadcast).")
t.mcq("Quel port utilise l'interface web de Proxmox VE ?", ["8006", "443", "8080", "22"],
  "https://IP-du-serveur:8006. VMware ESXi et vCenter utilisent le 443.")
t.mcq("Quel port utilise iSCSI ?", ["3260", "2049", "445", "8006"],
  "2049 = NFS, 445 = SMB.")
t.mcq("Le ping de la passerelle marche, le ping de 8.8.8.8 marche, mais pas [[ping debian.org]]. Quel est le problème ?", ["Le DNS", "Le câble", "La passerelle", "Le masque"],
  "Le réseau et Internet fonctionnent : seule la résolution de nom échoue. Vérifiez /etc/resolv.conf.")
t.mcq("Une machine en 192.168.1.40/24 peut-elle joindre 192.168.2.40/24 sans routeur ?", ["Non, ce sont deux réseaux différents", "Oui, elles sont proches", "Oui, si le switch est récent", "Oui, en IPv6"],
  "Avec /24, les trois premiers nombres forment la partie réseau : 192.168.1 ≠ 192.168.2.")

t.cmd("Affichez les interfaces réseau avec leurs adresses MAC et IP.", "ip a",
  /^ip (a|addr|address)( show| s)?$/, "On y lit aussi l'état du lien (state UP / DOWN).")
t.cmd("Affichez la table de routage (dont la passerelle par défaut).", "ip r",
  /^ip (r|route|ro)( show| s)?$/, "La ligne [[default via …]] donne la passerelle.")
t.cmd("Affichez les services qui écoutent sur des ports TCP, avec leur processus.", "ss -tlnp",
  (s) => /^(ss|netstat) -[tulnpa]{2,6}$/.test(s) && s.includes('t') && /-[a-z]*l/.test(s),
  "t = TCP, l = en écoute, n = numérique, p = processus.")
t.cmd("Testez si la passerelle 192.168.1.1 répond.", "ping 192.168.1.1",
  /^ping( -c ?\d+)? 192\.168\.1\.1$/, "Sous Linux, ping tourne jusqu'à Ctrl+C ; [[-c 4]] limite à 4 paquets.")

t.order("Remettez dans l'ordre la méthode de dépannage réseau, de bas en haut.",
  ["Le câble est branché et le lien est UP", "L'IP et le masque sont corrects", "Je ping ma passerelle", "Je ping une IP sur Internet (8.8.8.8)", "Je ping un nom de domaine (DNS)", "Le port du service est ouvert et non filtré"],
  "On remonte les couches : physique → IP locale → routage → DNS → service.")

export default t.list
