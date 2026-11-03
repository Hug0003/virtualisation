import { themeBuilder } from '../build'

const t = themeBuilder('vmw')

t.mcq("Quel est le rôle de vCenter ?", ["La gestion centralisée des hôtes ESXi (cluster, vMotion, DRS, VDS)", "L'hyperviseur lui-même", "Le stockage hyperconvergé", "Le pare-feu distribué"],
  "Il est livré sous forme de VM (VCSA). Sans lui, chaque ESXi se gère seul.")
t.mcq("Qu'est-ce que VMFS ?", ["Le système de fichiers en cluster de VMware", "Un format de sauvegarde", "Un protocole réseau", "Le BIOS des VM"],
  "Plusieurs hôtes ESXi y accèdent en même temps, sur disque local, iSCSI ou Fibre Channel.")
t.mcq("Qu'est-ce que vMotion ?", ["La migration à chaud d'une VM entre hôtes", "Le déplacement des disques", "La sauvegarde", "L'équilibrage du stockage"],
  "Storage vMotion, lui, déplace les disques entre datastores sans arrêter la VM.")
t.mcq("Que fait DRS ?", ["Il place et équilibre automatiquement les VM par vMotion", "Il redémarre les VM après une panne", "Il réplique les disques", "Il chiffre les VM"],
  "C'est la HA qui redémarre les VM après une panne.")
t.mcq("Quelle fonction VMware évite TOUTE interruption en cas de panne d'hôte ?", ["Fault Tolerance (FT)", "vSphere HA", "DRS", "vMotion"],
  "Une copie fantôme de la VM tourne en permanence sur un autre hôte. Elle exige des disques Thick Eager Zeroed.")
t.mcq("À quoi sert EVC ?", ["Rendre les CPU de générations différentes compatibles pour vMotion", "Chiffrer les VM", "Gérer les licences", "Accélérer le réseau"],
  "Équivalent Proxmox : choisir un type de CPU générique.")
t.mcq("Sur un vSwitch, qu'est-ce qu'un port group ?", ["Un groupe de ports avec ses réglages, dont l'ID de VLAN", "Une agrégation de cartes", "Une interface IP de l'hôte", "Un câble"],
  "Les VM se branchent sur un port group, par exemple « VM Network ».")
t.mcq("Qu'est-ce qu'un adaptateur VMkernel (vmk0) ?", ["Une interface IP de l'hôte ESXi (gestion, vMotion, vSAN…)", "Une carte réseau de VM", "Un disque", "Un switch distribué"],
  "On y coche un rôle : Management, vMotion, vSAN, iSCSI…")
t.mcq("Comment ESXi nomme-t-il les cartes réseau physiques ?", ["vmnic0, vmnic1…", "eth0, eth1…", "vmbr0, vmbr1…", "vmk0, vmk1…"],
  "vmk = VMkernel (IP de l'hôte), vmbr = bridge Proxmox.")
t.mcq("Qu'est-ce qu'un vSphere Distributed Switch (VDS) ?", ["Un switch géré par vCenter et partagé par tous les hôtes", "Un switch physique", "Un vSwitch par VM", "Un routeur"],
  "Configuration identique partout, plus LACP, NetFlow, mise en miroir de ports.")
t.mcq("Quel fichier contient la configuration d'une VM VMware ?", [".vmx", ".vmdk", ".nvram", ".vswp"],
  ".vmdk = descripteur du disque (+ -flat.vmdk pour les données), .nvram = BIOS, .vswp = fichier d'échange.")
t.mcq("Quel format de disque VMware est exigé par la Fault Tolerance ?", ["Thick Eager Zeroed", "Thin", "Thick Lazy Zeroed", "qcow2"],
  "L'espace est réservé ET mis à zéro dès la création.")
t.mcq("Que faut-il installer dans les VM VMware ?", ["Les VMware Tools (ou open-vm-tools sous Linux)", "Les pilotes VirtIO", "Le QEMU Guest Agent", "Rien"],
  "Pilotes VMXNET3/PVSCSI, arrêt propre, heartbeat pour la HA, quiescing pour les sauvegardes.")
t.mcq("Quel est l'équivalent VMware de Ceph ?", ["vSAN", "VMFS", "NSX", "vVols"],
  "vSAN agrège les disques locaux des hôtes en un stockage partagé.")
t.mcq("À quoi sert NSX ?", ["La virtualisation réseau avancée et le pare-feu distribué", "Le stockage", "La sauvegarde", "La gestion des licences"],
  "Overlay Geneve, routage distribué, micro-segmentation au niveau de chaque carte de VM.")
t.mcq("Qu'a changé le rachat de VMware par Broadcom ?", ["Fin des licences perpétuelles, passage aux abonnements par cœur", "VMware est devenu open source", "ESXi a été abandonné", "Rien"],
  "Beaucoup d'entreprises étudient depuis Proxmox comme alternative.")
t.mcq("Si vCenter tombe, que deviennent les VM ?", ["Elles continuent de tourner ; la HA marche, mais plus de vMotion ni de DRS", "Elles s'arrêtent toutes", "Elles migrent", "Elles redémarrent"],
  "vCenter gère, il n'exécute pas les VM.")
t.mcq("Dans Proxmox, comment importer directement des VM d'un ESXi ?", ["Datacenter > Storage > Add > ESXi, puis Import", "Copier le .vmx dans /etc/pve", "Avec vMotion", "C'est impossible"],
  "L'assistant existe depuis Proxmox VE 8.2, avec un import « live » possible.")
t.mcq("Avant de migrer une VM Windows de VMware vers Proxmox, que faire ?", ["Installer les pilotes VirtIO et désinstaller les VMware Tools", "Passer la VM en Thin", "Activer la FT", "Convertir en RAID 5"],
  "Supprimez aussi les snapshots et notez la configuration IP.")
t.mcq("Après migration, Windows affiche INACCESSIBLE_BOOT_DEVICE. Que faire ?", ["Démarrer avec le disque en SATA, installer VirtIO, puis repasser en VirtIO SCSI", "Réinstaller Windows", "Passer en SeaBIOS", "Ajouter de la RAM"],
  "Windows n'a pas encore le pilote du contrôleur VirtIO au démarrage.")

t.cmd("Sur un ESXi en SSH, listez toutes les VM avec leur ID.", "vim-cmd vmsvc/getallvms",
  /^vim-cmd vmsvc\/getallvms$/, "Puis [[vim-cmd vmsvc/power.on <id>]] pour en démarrer une.")
t.cmd("Sur un ESXi, listez les cartes réseau physiques.", "esxcli network nic list",
  /^esxcli network nic list$/, "Elles s'appellent vmnic0, vmnic1…")
t.cmd("Passez l'hôte ESXi en mode maintenance.", "esxcli system maintenanceMode set --enable true",
  /^esxcli system maintenanceMode set (--enable|-e) (true|1|yes)$/, "Les VM doivent être migrées ou éteintes avant.")

t.order("Remettez dans l'ordre la hiérarchie de vCenter, du plus grand au plus petit.",
  ["Datacenter", "Cluster", "Hôte ESXi", "Machine virtuelle"],
  "Proxmox a l'équivalent : Datacenter → nœuds → VM/CT.")

export default t.list
