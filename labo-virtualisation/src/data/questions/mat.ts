import { themeBuilder } from '../build'

const t = themeBuilder('mat')

t.mcq("Combien de bits contient un octet ?", ["8", "4", "16", "32"],
  "Un octet = 8 bits, ce qui donne 256 valeurs possibles (0 à 255). C'est pour cela qu'un nombre d'une adresse IPv4 va de 0 à 255.")
t.mcq("Une carte réseau 1 Gb/s transfère au maximum environ…", ["125 Mo/s", "1 Go/s", "1 000 Mo/s", "12,5 Mo/s"],
  "Le réseau se compte en bits : 1 000 Mb/s ÷ 8 = 125 Mo/s (environ 110 à 118 Mo/s en pratique).")
t.mcq("Pourquoi un disque vendu « 1 To » apparaît-il comme 931 Go sous Windows ?",
  ["Le fabricant compte en puissances de 10, l'OS en puissances de 2", "Des secteurs sont réservés aux pannes", "Le formatage consomme 7 % du disque", "Le disque est en RAID"],
  "10¹² octets ÷ 1 024³ ≈ 931 Gio. Il ne manque rien : c'est la même quantité dans une autre unité.")
t.mcq("La RAM est…", ["Volatile et rapide", "Persistante et lente", "Persistante et rapide", "Volatile et lente"],
  "La RAM perd tout à la coupure de courant, mais elle est environ 100 000 fois plus réactive qu'un disque dur.")
t.mcq("Quel support offre le plus d'IOPS ?", ["SSD NVMe", "SSD SATA", "Disque dur 7 200 tr/min", "Bande LTO"],
  "Un disque dur fait ~100 IOPS, un SSD SATA quelques dizaines de milliers, un NVMe plusieurs centaines de milliers.")
t.mcq("Que fait l'Hyper-Threading (ou SMT) ?",
  ["Il donne 2 fils d'exécution à chaque cœur, qui partagent ses ressources", "Il double réellement la puissance du CPU", "Il ajoute un second socket virtuel", "Il accélère la RAM"],
  "Les threads d'un même cœur se partagent ses unités de calcul : le gain réel est de 15 à 30 %, pas ×2.")
t.mcq("Où active-t-on Intel VT-x ou AMD-V ?", ["Dans le BIOS/UEFI", "Dans /etc/pve", "Dans Windows Update", "Sur le switch"],
  "La virtualisation matérielle est souvent désactivée à la livraison : on l'active dans le firmware (Intel Virtualization Technology / SVM Mode).")
t.mcq("Quel est l'intérêt de la RAM ECC ?", ["Détecter et corriger les erreurs de bits", "Être plus rapide", "Consommer moins", "Permettre l'UEFI"],
  "ECC corrige les erreurs mémoire à la volée : indispensable sur un serveur qui fait tourner des dizaines de VM.")
t.mcq("À quoi sert une carte iDRAC, iLO ou IPMI ?", ["Gérer le serveur à distance, même éteint", "Accélérer le réseau", "Chiffrer les disques", "Remplacer l'hyperviseur"],
  "Elle a sa propre prise réseau : allumage, écran à distance, montage d'ISO, capteurs. Idéal pour installer un hyperviseur sans être devant la machine.")
t.mcq("Quel bus relie les SSD NVMe, les cartes réseau et les cartes graphiques au CPU ?", ["PCI Express", "SATA", "USB", "SAS"],
  "Le PCIe est découpé en lignes (x1, x4, x8, x16). Chaque périphérique a une adresse visible avec [[lspci]].")
t.mcq("Qu'apporte l'UEFI par rapport au BIOS ?", ["Secure Boot et le partitionnement GPT", "Plus de RAM", "L'Hyper-Threading", "Le RAID matériel"],
  "L'UEFI démarre sur des disques GPT de plus de 2 To et peut n'accepter que des systèmes signés (Secure Boot).")
t.mcq("Classez par latence : lequel répond le plus vite ?", ["La RAM", "Un SSD NVMe", "Un disque dur", "Un NAS en NFS"],
  "RAM ≈ 100 ns, SSD ≈ 100 µs, disque dur ≈ 5-10 ms. Si la RAM prenait 1 s, le SSD prendrait 15 min et le disque dur 1 jour.")
t.mcq("Qu'est-ce qu'un socket ?", ["L'emplacement physique d'un processeur sur la carte mère", "Un cœur logique", "Un port réseau", "Une barrette de RAM"],
  "Un serveur peut avoir 1, 2 ou 4 sockets. Certaines licences logicielles sont facturées par socket.")
t.mcq("Un programme compilé pour x86-64 tourne-t-il tel quel sur un CPU ARM ?", ["Non, les jeux d'instructions sont différents", "Oui, toujours", "Oui, si la RAM est suffisante", "Oui, avec l'Hyper-Threading"],
  "Il faudrait l'émuler (QEMU sait le faire), ce qui est très lent. La virtualisation, elle, garde la même architecture que l'hôte.")
t.mcq("Le cache L1/L2/L3 du processeur sert à…", ["Garder près du CPU les données récemment utilisées", "Stocker les fichiers temporaires", "Remplacer la RAM", "Sauvegarder le BIOS"],
  "Le cache évite d'aller chercher en RAM des données déjà utilisées. Il est minuscule mais ultra-rapide.")

export default t.list
