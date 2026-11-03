import { themeBuilder } from '../build'

const t = themeBuilder('pve')

t.mcq("Sous quelle licence est distribué Proxmox VE ?", ["AGPLv3, gratuit, avec un abonnement optionnel", "Propriétaire, payant par cœur", "Freemium limité à 3 nœuds", "Licence étudiante uniquement"],
  "Toutes les fonctions sont gratuites. L'abonnement donne le dépôt « enterprise » et le support.")
t.mcq("Où se trouve la configuration de la VM 100 ?", ["/etc/pve/qemu-server/100.conf", "/var/lib/vz/100.conf", "/etc/qemu/100.xml", "/root/vm100.cfg"],
  "Un simple fichier texte, répliqué sur tout le cluster.")
t.mcq("Où se trouve la configuration du conteneur 200 ?", ["/etc/pve/lxc/200.conf", "/etc/lxc/200.conf", "/var/lib/lxc/200/config", "/etc/pve/ct/200.conf"],
  "Les VM sont dans qemu-server/, les conteneurs dans lxc/.")
t.mcq("Qu'est-ce que [[/etc/pve]] ?", ["Le système de fichiers de cluster pmxcfs, répliqué sur tous les nœuds", "Un dossier local classique", "Le dossier des ISO", "Un point de montage NFS"],
  "Une modification sur un nœud est visible immédiatement sur tous les autres.")
t.mcq("Quelle commande utiliser pour mettre à jour Proxmox ?", ["apt full-upgrade (ou dist-upgrade)", "apt upgrade", "pveupdate", "yum update"],
  "[[apt upgrade]] seul peut laisser le système dans un état incohérent.")
t.mcq("Pourquoi laisser cochée l'option « Unprivileged container » ?", ["Le root du conteneur n'a aucun droit sur l'hôte", "Le conteneur est plus rapide", "Il peut faire tourner Windows", "Il peut migrer à chaud"],
  "Les identifiants sont décalés : c'est beaucoup plus sûr.")
t.mcq("Qu'est-ce qu'un linked clone ?", ["Un clone qui partage les données du template et n'enregistre que les différences", "Une copie complète", "Une sauvegarde", "Une VM en HA"],
  "Instantané et économe, mais le template doit rester présent.")
t.mcq("Que devient une VM convertie en template ?", ["Elle ne peut plus démarrer : elle sert de modèle à cloner", "Elle est sauvegardée", "Elle est supprimée", "Elle passe en HA"],
  "Combinée à cloud-init, elle permet de déployer une VM en quelques secondes.")
t.mcq("À quoi sert cloud-init ?", ["Personnaliser une VM au premier démarrage (utilisateur, clé SSH, IP…)", "Sauvegarder dans le cloud", "Migrer vers AWS", "Créer un cluster"],
  "On part d'une image « cloud » officielle (Debian, Ubuntu) ; Proxmox fournit les paramètres par un petit lecteur virtuel.")
t.mcq("Quel contrôleur de disque recommander pour une VM ?", ["VirtIO SCSI single, avec IO thread", "IDE", "SATA", "LSI 53C895A"],
  "Un thread d'E/S dédié par disque. Cochez aussi Discard.")
t.mcq("Que contient le type de contenu [[vztmpl]] d'un stockage ?", ["Les templates de conteneurs LXC", "Les disques de VM", "Les sauvegardes", "Les ISO"],
  "images = disques de VM, rootdir = disques de CT, iso, backup, snippets (cloud-init, hookscripts).")
t.mcq("Dans quel fichier sont déclarés les stockages Proxmox ?", ["/etc/pve/storage.cfg", "/etc/fstab", "/etc/pve/disks.conf", "/etc/lvm/lvm.conf"],
  "Il est commun à tout le cluster.")
t.mcq("Quelle est la différence entre « Stop » et « Shutdown » ?", ["Stop coupe net (la prise) ; Shutdown demande à l'OS de s'éteindre proprement", "Aucune", "Stop met en pause", "Shutdown supprime la VM"],
  "Shutdown envoie un signal ACPI (ou passe par le guest agent).")
t.mcq("Quel service fournit l'interface web et l'API sur le port 8006 ?", ["pveproxy", "pvedaemon", "corosync", "pvestatd"],
  "pvedaemon exécute les actions de l'API, pvestatd collecte les statistiques.")
t.mcq("Le VMID d'une VM doit être unique…", ["Dans tout le cluster", "Sur le nœud seulement", "Dans le stockage", "Nulle part"],
  "Deux nœuds d'un même cluster ne peuvent pas avoir chacun une VM 100.")
t.mcq("Sans abonnement, quel dépôt activer ?", ["pve-no-subscription", "pve-enterprise", "debian-security uniquement", "aucun"],
  "Le dépôt enterprise renvoie une erreur 401 sans abonnement. Réglage : Node > Updates > Repositories.")
t.mcq("Quel produit Proxmox fait des sauvegardes incrémentales et dédupliquées ?", ["Proxmox Backup Server", "Proxmox Mail Gateway", "Proxmox Datacenter Manager", "vzdump seul"],
  "PBS s'installe de préférence sur une autre machine que les hyperviseurs.")

t.cmd("Listez les VM du nœud.", "qm list",
  /^qm list$/, "[[qm]] gère les VM KVM, [[pct]] les conteneurs LXC.")
t.cmd("Démarrez la VM 100.", "qm start 100",
  /^qm start 100$/, "[[qm stop]] la coupe net, [[qm shutdown]] l'éteint proprement.")
t.cmd("Éteignez proprement la VM 100.", "qm shutdown 100",
  /^qm shutdown 100( .*)?$/, "Envoie un signal ACPI, ou passe par le guest agent s'il est actif.")
t.cmd("Prenez un snapshot nommé [[avant-maj]] de la VM 100.", "qm snapshot 100 avant-maj",
  /^qm snapshot 100 avant-maj( .*)?$/, "Ajoutez [[--vmstate 1]] pour inclure la RAM.")
t.cmd("Revenez au snapshot [[avant-maj]] de la VM 100.", "qm rollback 100 avant-maj",
  /^qm rollback 100 avant-maj$/, "Tout ce qui a changé depuis le snapshot est perdu.")
t.cmd("La VM 105 est restée verrouillée après une tâche interrompue. Déverrouillez-la.", "qm unlock 105",
  /^qm unlock 105$/, "Le message était « VM is locked ».")
t.cmd("Ouvrez un shell dans le conteneur 200.", "pct enter 200",
  /^pct enter 200$/, "[[pct console 200]] ouvre la console, [[pct exec]] lance une seule commande.")
t.cmd("Affichez l'état et le remplissage de tous les stockages.", "pvesm status",
  /^pvesm status$/, "pvesm = Proxmox VE Storage Manager.")
t.cmd("Mettez à jour la liste des templates LXC disponibles.", "pveam update",
  /^pveam update$/, "Puis [[pveam available]] et [[pveam download local <template>]].")
t.cmd("Clonez le template 9000 en une VM 120 complète (full clone).", "qm clone 9000 120 --full",
  (s) => s.startsWith('qm clone 9000 120') && /--full( 1| true)?\b/.test(s),
  "Sans [[--full]], le clone d'un template est un linked clone.")
t.cmd("Donnez 4096 Mo de RAM à la VM 100.", "qm set 100 --memory 4096",
  /^qm set 100 --?memory 4096$/, "[[qm set]] modifie n'importe quelle option de la configuration.")
t.cmd("Mettez Proxmox à jour (liste des paquets puis mise à niveau).", "apt update && apt full-upgrade",
  (s) => /apt(-get)? update/.test(s) && /apt(-get)? (full-upgrade|dist-upgrade)/.test(s),
  "Toujours full-upgrade ou dist-upgrade sur Proxmox.")

t.order("Remettez dans l'ordre la création d'une VM depuis une ISO.",
  ["Envoyer l'ISO sur un stockage (Upload)", "Create VM : nœud, VMID, nom et ISO", "Régler System, Disks, CPU, Memory, Network", "Démarrer la VM et installer l'OS dans la console", "Installer le qemu-guest-agent dans l'invité"],
  "Pensez au contrôleur VirtIO SCSI single, au réseau VirtIO et à la case QEMU Agent.")

export default t.list
