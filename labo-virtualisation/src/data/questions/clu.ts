import { themeBuilder } from '../build'

const t = themeBuilder('clu')

t.mcq("Qu'est-ce que le quorum d'un cluster ?", ["Plus de la moitié des votes présents", "Tous les nœuds en ligne", "Au moins 2 nœuds", "Le nœud maître"],
  "Sans majorité stricte, le cluster s'interdit d'agir pour éviter le split-brain.")
t.mcq("Avec 2 nœuds seulement, que faut-il ajouter pour survivre à la perte d'un nœud ?", ["Un QDevice (un vote d'arbitrage externe)", "Un troisième disque", "Un switch", "Rien"],
  "Le QDevice tourne sur une petite machine (Raspberry Pi, VM sur un NAS, PBS) avec corosync-qnetd.")
t.mcq("Que devient [[/etc/pve]] sur un nœud qui a perdu le quorum ?", ["Il passe en lecture seule", "Il est effacé", "Il est copié ailleurs", "Rien ne change"],
  "On ne peut plus démarrer ni modifier de VM sur ce nœud.")
t.mcq("Qu'est-ce que le split-brain ?", ["Deux moitiés du cluster qui se croient seules et agissent chacune", "Un disque coupé en deux", "Une VM avec deux vCPU", "Un réseau en deux VLAN"],
  "La même VM pourrait tourner deux fois et corrompre ses disques. Le quorum l'empêche.")
t.mcq("La haute disponibilité (HA) de Proxmox, c'est…", ["Le redémarrage automatique de la VM sur un autre nœud (1 à 3 minutes de coupure)", "Zéro interruption", "Une sauvegarde automatique", "Une migration à chaud permanente"],
  "Pour zéro coupure, il faut de la redondance applicative ou la Fault Tolerance de VMware.")
t.mcq("Qu'est-ce que le fencing ?", ["Isoler de force un nœud défaillant avant de relancer ses VM ailleurs", "Un pare-feu", "Un type de RAID", "Une sauvegarde"],
  "Sous Proxmox, un nœud qui perd le quorum se redémarre lui-même grâce au watchdog.")
t.mcq("Quels sont les prérequis de la HA ?", ["Au moins 3 votes et un stockage partagé (ou la réplication)", "Un seul nœud et ZFS", "VMware vCenter", "Un abonnement"],
  "Sans stockage partagé, la réplication ZFS fait l'affaire, avec la perte des dernières minutes.")
t.mcq("Que faut-il vérifier avant d'ajouter un nœud à un cluster ?", ["Qu'il n'a aucune VM ni aucun conteneur", "Qu'il a plus de RAM que les autres", "Qu'il a un abonnement", "Qu'il est en DHCP"],
  "Sa configuration est remplacée par celle du cluster : des VMID pourraient entrer en conflit.")
t.mcq("Comment fonctionne une migration à chaud ?", ["La RAM est copiée pendant que la VM tourne, puis une très courte pause bascule l'exécution", "La VM est éteinte puis redémarrée", "Le disque est copié en premier, VM éteinte", "La VM est clonée"],
  "Immédiat avec du stockage partagé. Avec du stockage local, les disques sont aussi copiés.")
t.mcq("Comment migre un conteneur LXC ?", ["Par une restart migration : arrêt, déplacement, redémarrage", "À chaud, comme une VM", "Il ne peut pas migrer", "Par réplication uniquement"],
  "Les conteneurs n'ont pas de migration à chaud dans Proxmox.")
t.mcq("Quel mode de vzdump sauvegarde sans interrompre la VM ?", ["snapshot", "stop", "suspend", "offline"],
  "Avec le QEMU Guest Agent, le système de fichiers est figé un instant (fs-freeze) pour la cohérence.")
t.mcq("Quels sont les deux grands atouts de Proxmox Backup Server ?", ["Les sauvegardes incrémentales et la déduplication", "La HA et la migration", "Le RAID et le chiffrement disque", "Le SDN et le pare-feu"],
  "En plus : chiffrement côté client, vérification, restauration fichier par fichier, live-restore.")
t.mcq("Que signifie une rétention [[keep-daily=7, keep-weekly=4]] ?", ["Garder 7 sauvegardes quotidiennes et 4 hebdomadaires", "Sauvegarder 7 fois par jour", "Garder 7 VM pendant 4 semaines", "Supprimer après 7 jours"],
  "Les sauvegardes plus anciennes sont élaguées (prune) automatiquement.")
t.mcq("Pour la réplication ZFS entre deux nœuds, que faut-il ?", ["Un pool ZFS portant le même nom sur les deux nœuds", "Un stockage Ceph", "Un NAS", "Un QDevice"],
  "Proxmox envoie les snapshots incrémentaux vers le pool du même nom.")
t.mcq("Quel realm correspond aux comptes Linux de l'hôte, dont root ?", ["pam", "pve", "ldap", "ad"],
  "Le realm pve contient les comptes internes de Proxmox. LDAP, AD et OpenID se branchent sur un annuaire existant.")
t.mcq("Une permission (ACL) dans Proxmox associe…", ["Un utilisateur ou groupe, un rôle et un chemin", "Une IP et un port", "Un VLAN et une VM", "Un disque et un nœud"],
  "Exemple : groupe stagiaires, rôle PVEVMUser, chemin /pool/labo.")
t.mcq("Pour un script ou Terraform, que vaut-il mieux utiliser ?", ["Un token d'API", "Le mot de passe root", "Une clé SSH root", "Le compte d'un collègue"],
  "Un token a ses propres droits et se révoque sans toucher au compte.")
t.mcq("Que dit la règle N+1 ?", ["Si un nœud tombe, les autres doivent pouvoir absorber toutes ses VM", "Toujours un nœud de plus que de VM", "Une sauvegarde de plus que nécessaire", "Un vCPU de plus par VM"],
  "Avec 3 nœuds, ne dépassez pas environ 66 % de RAM utilisée sur chacun.")
t.mcq("Pourquoi éviter de faire passer la sauvegarde sur le lien Corosync ?", ["La latence monte et les nœuds peuvent se croire morts", "Ça ralentit le CPU", "Ça casse les VLAN", "C'est interdit par la licence"],
  "La HA pourrait alors redémarrer des nœuds sans raison.")

t.cmd("Créez un cluster nommé [[labo]].", "pvecm create labo",
  /^pvecm create labo$/, "À lancer sur le premier nœud.")
t.cmd("Depuis un nouveau nœud, rejoignez le cluster dont le premier nœud est 192.168.1.10.", "pvecm add 192.168.1.10",
  /^pvecm add 192\.168\.1\.10( .*)?$/, "Le nœud qui rejoint ne doit avoir aucune VM.")
t.cmd("Affichez l'état du cluster et du quorum.", "pvecm status",
  /^pvecm (status|nodes)$/, "[[pvecm nodes]] liste les nœuds ; [[pvecm status]] montre aussi les votes.")
t.cmd("Migrez à chaud la VM 100 vers le nœud [[pve2]].", "qm migrate 100 pve2 --online",
  (s) => s.startsWith('qm migrate 100 ') && / pve2\b/.test(s) && /--online( 1| true)?\b/.test(s),
  "Ajoutez [[--with-local-disks]] si les disques sont sur un stockage local.")
t.cmd("Ajoutez la VM 100 à la haute disponibilité.", "ha-manager add vm:100",
  /^ha-manager add vm:100( .*)?$/, "Option courante : [[--state started]].")
t.cmd("Sauvegardez la VM 100 à chaud (mode snapshot).", "vzdump 100 --mode snapshot",
  (s) => s.startsWith('vzdump 100') && /--mode snapshot\b/.test(s),
  "Ajoutez [[--storage]] pour choisir la destination et [[--compress zstd]].")

t.order("Remettez dans l'ordre la mise en place d'un cluster avec HA.",
  ["Installer les nœuds avec une IP fixe", "pvecm create sur le premier nœud", "pvecm add sur les autres nœuds", "Vérifier le quorum avec pvecm status", "Ajouter un stockage partagé", "Mettre les VM critiques en HA"],
  "Le stockage partagé (ou la réplication) est indispensable avant d'activer la HA.")

export default t.list
