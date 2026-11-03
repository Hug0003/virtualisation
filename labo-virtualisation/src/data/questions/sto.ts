import { themeBuilder } from '../build'

const t = themeBuilder('sto')

t.mcq("En stockage mode bloc, qui gère le système de fichiers ?", ["Le client (il formate lui-même le disque)", "Le serveur de stockage", "Le switch", "Personne"],
  "En bloc on reçoit un disque brut (iSCSI, LVM, disque local). En mode fichier (NFS, SMB), c'est le serveur qui gère les fichiers.")
t.mcq("NFS est un stockage en mode…", ["Fichier", "Bloc", "Objet", "Bande"],
  "NFS partage des dossiers et des fichiers. Il est très utilisé pour les ISO, les sauvegardes et les disques qcow2.")
t.mcq("iSCSI est un stockage en mode…", ["Bloc", "Fichier", "Objet", "Mémoire"],
  "iSCSI transporte des commandes de disque dans TCP/IP : l'hyperviseur voit un disque comme s'il était local.")
t.mcq("Quel est l'avantage de GPT sur MBR ?", ["Plus de 4 partitions et des disques de plus de 2 To", "Il est plus rapide", "Il chiffre le disque", "Il fait du RAID"],
  "MBR est limité à 4 partitions primaires et 2 To. GPT gère 128 partitions et des tailles énormes.")
t.mcq("Quel est le principal risque du provisionnement fin (thin) ?", ["Si le stockage réel se remplit, les VM se figent ou se corrompent", "Les VM sont plus lentes au démarrage", "On ne peut pas faire de snapshot", "Les disques ne sont pas chiffrés"],
  "On peut promettre plus d'espace qu'on n'en a. Surveillez l'espace réel et activez discard/TRIM.")
t.mcq("Combien de pannes de disque tolère un RAID 5 ?", ["1", "0", "2", "La moitié des disques"],
  "Une seule parité : 1 disque. Le RAID 6 (double parité) en tolère 2.")
t.mcq("Combien de disques faut-il au minimum pour un RAID 6 ?", ["4", "2", "3", "5"],
  "Le RAID 6 stocke 2 parités : il faut au moins 4 disques, dont 2 « perdus » pour la parité.")
t.mcq("Pourquoi recommande-t-on le RAID 10 (ou des miroirs ZFS) pour des VM ?", ["Il offre beaucoup d'IOPS et une reconstruction rapide", "Il offre la plus grande capacité", "Il est le moins cher", "Il ne demande que 2 disques"],
  "Les VM font beaucoup de petites écritures aléatoires : les miroirs sont bien plus rapides que la parité pour ça.")
t.mcq("Pourquoi le RAID n'est-il pas une sauvegarde ?", ["Il ne protège ni d'une suppression, ni d'un rançongiciel, ni d'un incendie", "Il est trop lent", "Il ne fonctionne qu'avec des SSD", "Il ne protège pas d'une panne de disque"],
  "Une suppression est appliquée sur tous les disques à la fois. Il faut des sauvegardes séparées, dont une hors site.")
t.mcq("Un snapshot remplace-t-il une sauvegarde ?", ["Non : il est sur le même stockage que la VM", "Oui, toujours", "Oui, s'il inclut la RAM", "Oui, sur ZFS"],
  "Si le stockage meurt, le snapshot meurt avec. C'est un retour arrière à court terme, avant une mise à jour par exemple.")
t.mcq("Que dit la règle 3-2-1 ?", ["3 copies, sur 2 supports différents, dont 1 hors site", "3 serveurs, 2 switches, 1 pare-feu", "3 disques, 2 parités, 1 spare", "3 sauvegardes par jour pendant 21 jours"],
  "On y ajoute souvent une copie immuable ou hors ligne contre les rançongiciels, et zéro erreur aux tests de restauration.")
t.mcq("Quel format de disque virtuel permet les snapshots internes et l'allocation dynamique ?", ["qcow2", "raw", "vhd", "iso"],
  "qcow2 = QEMU Copy-On-Write. Le raw est plus simple et plus rapide ; sur LVM/ZFS/Ceph c'est le stockage qui fait les snapshots.")
t.mcq("Quel est le format de disque de VMware ?", ["vmdk", "qcow2", "vhdx", "vdi"],
  "vhdx = Hyper-V, vdi = VirtualBox. [[qemu-img convert]] passe de l'un à l'autre.")
t.mcq("En iSCSI, comment s'appelle le serveur de stockage qui présente les disques ?", ["La target (cible)", "L'initiator", "Le LUN", "Le portail NFS"],
  "La target présente des LUN (disques logiques) ; l'hyperviseur est l'initiator. Chacun est identifié par un IQN.")
t.mcq("À quoi sert le multipath ?", ["Utiliser plusieurs chemins vers le SAN, pour la redondance et la charge", "Mettre plusieurs VM sur un disque", "Agréger des disques en RAID", "Créer plusieurs partitions"],
  "Deux cartes, deux switches : si un chemin tombe, l'autre prend le relais.")
t.mcq("À quoi sert l'option Discard (TRIM) sur un disque de VM ?", ["Rendre au stockage thin l'espace libéré dans la VM", "Accélérer les lectures", "Chiffrer le disque", "Désactiver le cache"],
  "Sans discard, un fichier supprimé dans la VM continue d'occuper de la place sur le stockage thin.")
t.mcq("Une sauvegarde incrémentale copie…", ["Seulement ce qui a changé depuis la dernière sauvegarde", "Tout, à chaque fois", "Seulement les fichiers système", "Seulement la RAM"],
  "C'est ce que fait Proxmox Backup Server grâce aux dirty bitmaps de QEMU : quelques secondes au lieu d'une heure.")
t.mcq("Qu'est-ce qu'un NAS ?", ["Un serveur de fichiers en réseau (NFS, SMB)", "Une baie qui présente des disques en mode bloc", "Un switch de stockage", "Un disque NVMe"],
  "Le SAN, lui, présente des disques en mode bloc (iSCSI, Fibre Channel).")
t.mcq("Que veut dire « hyperconvergence » (HCI) ?", ["Chaque nœud apporte ses disques, fusionnés en un stockage partagé", "Un seul serveur très puissant", "Un NAS relié en Fibre Channel", "Un cluster sans stockage"],
  "Ceph sous Proxmox, vSAN sous VMware : calcul et stockage sur les mêmes serveurs.")

t.cmd("Listez les disques et partitions, avec leurs systèmes de fichiers.", "lsblk -f",
  /^lsblk( -[a-z]+)?$/, "[[lsblk]] montre l'arbre disque → partitions → points de montage.")
t.cmd("Formatez la partition [[/dev/sdb1]] en ext4.", "mkfs.ext4 /dev/sdb1",
  [/^mkfs\.ext4 \/dev\/sdb1$/, /^mkfs -t ext4 \/dev\/sdb1$/], "Attention : formater efface tout ce qu'il y avait sur la partition.")
t.cmd("Montez [[/dev/sdb1]] sur [[/mnt/data]].", "mount /dev/sdb1 /mnt/data",
  /^mount \/dev\/sdb1 \/mnt\/data\/?$/, "Pour un montage permanent, ajoutez une ligne dans /etc/fstab.")
t.cmd("Convertissez le disque VMware [[serveur.vmdk]] en [[serveur.qcow2]].", "qemu-img convert -f vmdk -O qcow2 serveur.vmdk serveur.qcow2",
  (s) => s.startsWith('qemu-img convert') && /-O qcow2/.test(s) && /serveur\.vmdk .*serveur\.qcow2$/.test(s),
  "[[-f]] = format source (optionnel, détecté), [[-O]] = format de sortie, [[-p]] affiche la progression.")

t.order("Remettez dans l'ordre les couches qui mènent d'un disque à un fichier accessible.",
  ["Le disque physique (une suite de blocs)", "La partition", "Le système de fichiers (ext4, NTFS…)", "Le point de montage dans l'arborescence"],
  "Disque → partition → système de fichiers → montage. Une VM refait exactement ces étapes sur son disque virtuel.")

export default t.list
