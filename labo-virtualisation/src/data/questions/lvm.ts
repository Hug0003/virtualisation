import { themeBuilder } from '../build'

const t = themeBuilder('lvm')

t.mcq("Dans LVM, quel est l'ordre des couches, du disque au volume ?", ["PV → VG → LV", "VG → PV → LV", "LV → VG → PV", "PV → LV → VG"],
  "Physical Volume (le disque préparé) → Volume Group (la réserve commune) → Logical Volume (le volume découpé).")
t.mcq("Quel est l'avantage de LVM-thin ?", ["Allocation à la demande et snapshots rapides", "Il est partageable entre nœuds", "Il chiffre les données", "Il remplace le RAID"],
  "C'est le stockage [[local-lvm]] créé par défaut à l'installation de Proxmox.")
t.mcq("Le stockage [[local-lvm]] créé par l'installateur Proxmox est de type…", ["LVM-thin", "LVM classique", "ZFS", "Directory"],
  "Le stockage [[local]], lui, est un dossier (/var/lib/vz) pour les ISO, templates et sauvegardes.")
t.mcq("Quand un LVM classique (thick) est-il partageable entre plusieurs nœuds Proxmox ?", ["Quand il est sur un LUN partagé iSCSI ou Fibre Channel", "Jamais", "Toujours", "Seulement avec ZFS"],
  "Un LVM-thin, lui, n'est jamais partageable : il reste local.")
t.mcq("Sur quoi ne faut-il JAMAIS installer ZFS ?", ["Un contrôleur RAID matériel", "Des SSD", "Des disques SATA", "Un HBA en mode IT"],
  "ZFS doit voir les disques directement pour gérer redondance et checksums. Utilisez un HBA ou le mode JBOD.")
t.mcq("Qu'est-ce que l'ARC de ZFS ?", ["Son cache en RAM", "Son niveau de RAID", "Son format de snapshot", "Son protocole réseau"],
  "Règle simple : 2 Go + 1 Go par To de stockage. Proxmox le limite par défaut à 10 % de la RAM sur les nouvelles installations.")
t.mcq("Un vdev raidz2 équivaut à quel RAID ?", ["RAID 6", "RAID 5", "RAID 1", "RAID 10"],
  "raidz1 ≈ RAID 5, raidz2 ≈ RAID 6, raidz3 = triple parité. Plusieurs vdev miroirs ≈ RAID 10.")
t.mcq("Sous ZFS, qu'est-ce qu'un zvol ?", ["Un volume en mode bloc, utilisé pour les disques de VM", "Un système de fichiers pour les conteneurs", "Un snapshot", "Un pool de disques"],
  "Les datasets (systèmes de fichiers) servent aux conteneurs LXC ; les zvols aux disques de VM.")
t.mcq("Que fait un [[zpool scrub]] ?", ["Il relit toutes les données, vérifie les checksums et répare", "Il défragmente le pool", "Il supprime les snapshots", "Il agrandit le pool"],
  "ZFS détecte ainsi la corruption silencieuse et la répare grâce à la redondance. À planifier régulièrement.")
t.mcq("Pourquoi les snapshots ZFS sont-ils instantanés ?", ["ZFS est Copy-on-Write : il n'écrase jamais une donnée en place", "Ils sont stockés en RAM", "Ils sont compressés", "Ils ne copient que les métadonnées du BIOS"],
  "Un snapshot fige simplement l'état ; seules les écritures suivantes consomment de la place.")
t.mcq("Que signifie [[ashift=12]] à la création d'un pool ZFS ?", ["Des secteurs de 4 Kio (2¹²)", "12 disques", "Une compression de niveau 12", "12 Go d'ARC"],
  "Un mauvais ashift dégrade fortement les performances et ne se change plus après création.")
t.mcq("Pourquoi utiliser [[/dev/disk/by-id/…]] plutôt que [[/dev/sdb]] ?", ["Les noms sdX peuvent changer au redémarrage", "C'est plus rapide", "C'est obligatoire pour LVM", "Cela active le chiffrement"],
  "Les identifiants by-id sont liés au numéro de série du disque : ils ne bougent pas.")
t.mcq("Ceph avec [[size=3, min_size=2]] signifie…", ["3 copies de chaque donnée, accessible tant qu'il en reste 2", "3 nœuds, 2 moniteurs", "3 Go de RAM, 2 OSD", "3 pools, 2 disques"],
  "Avec 3 copies, l'espace utile vaut environ le tiers de l'espace brut.")
t.mcq("Combien de moniteurs (MON) Ceph prévoit-on en général ?", ["3 (un nombre impair)", "1", "2", "Un par disque"],
  "Les MON tiennent la carte du cluster et votent : nombre impair, comme pour un quorum.")
t.mcq("Qu'est-ce qu'un OSD dans Ceph ?", ["Le service qui stocke les données, un par disque", "Le tableau de bord", "Le moniteur du cluster", "Le système de fichiers partagé"],
  "OSD = Object Storage Daemon. MGR = gestionnaire, MDS = métadonnées pour CephFS.")
t.mcq("Pour des disques de VM, on utilise dans Ceph…", ["RBD", "CephFS", "RGW (S3)", "NFS"],
  "RBD = RADOS Block Device, du stockage bloc. CephFS est un système de fichiers partagé (ISO, sauvegardes).")
t.mcq("Combien de nœuds faut-il au minimum pour un Ceph raisonnable ?", ["3", "1", "2", "10"],
  "Avec 3 copies sur 3 serveurs différents. 5 nœuds ou plus est plus confortable, avec un réseau dédié de 10 Gb/s minimum.")
t.mcq("Sur quoi repose la réplication de VM intégrée à Proxmox ?", ["ZFS send/receive", "Ceph RBD", "rsync", "NFS"],
  "Proxmox envoie des snapshots ZFS incrémentaux vers un autre nœud toutes les x minutes. Le pool doit avoir le même nom des deux côtés.")

t.cmd("Préparez le disque [[/dev/sdb]] pour LVM.", "pvcreate /dev/sdb",
  /^pvcreate \/dev\/sdb$/, "C'est la première couche : le Physical Volume.")
t.cmd("Créez le groupe de volumes [[vg_data]] avec [[/dev/sdb]].", "vgcreate vg_data /dev/sdb",
  /^vgcreate vg_data \/dev\/sdb$/, "Pour l'agrandir plus tard : [[vgextend vg_data /dev/sdc]].")
t.cmd("Créez un volume logique de 50 Go nommé [[lv_vm]] dans [[vg_data]].", "lvcreate -L 50G -n lv_vm vg_data",
  (s) => s.startsWith('lvcreate ') && /(-L ?|--size[ =])50G\b/i.test(s) && /(-n ?|--name[ =])lv_vm\b/.test(s) && /\bvg_data$/.test(s),
  "[[-L]] = taille, [[-n]] = nom. Pour tout l'espace libre : [[-l 100%FREE]].")
t.cmd("Affichez la liste des groupes de volumes.", "vgs",
  /^(vgs|vgdisplay)$/, "De même : [[pvs]] pour les PV, [[lvs]] pour les LV.")
t.cmd("Créez un pool ZFS miroir nommé [[tank]] avec [[/dev/sdb]] et [[/dev/sdc]].", "zpool create tank mirror /dev/sdb /dev/sdc",
  (s) => s.startsWith('zpool create') && / tank mirror \/dev\/sdb \/dev\/sdc$/.test(s),
  "En vrai, ajoutez [[-o ashift=12]] et utilisez les chemins /dev/disk/by-id/.")
t.cmd("Affichez l'état du pool ZFS [[tank]].", "zpool status tank",
  /^zpool status( -v)?( tank)?$/, "On y voit l'état de chaque disque (ONLINE, DEGRADED…) et le résultat du dernier scrub.")
t.cmd("Prenez un snapshot ZFS nommé [[avant]] du dataset [[tank/vm]].", "zfs snapshot tank/vm@avant",
  /^zfs snapshot tank\/vm@avant$/, "Le @ sépare le dataset du nom du snapshot. Retour : [[zfs rollback tank/vm@avant]].")
t.cmd("Affichez l'état global du cluster Ceph.", "ceph -s",
  /^ceph (-s|status)$/, "On attend HEALTH_OK.")

t.order("Remettez dans l'ordre la création d'un volume LVM utilisable.",
  ["pvcreate /dev/sdb", "vgcreate vg_data /dev/sdb", "lvcreate -L 50G -n lv_vm vg_data", "mkfs.ext4 /dev/vg_data/lv_vm", "mount /dev/vg_data/lv_vm /mnt/vm"],
  "PV → VG → LV, puis un système de fichiers et un montage, comme sur un disque classique.")

export default t.list
