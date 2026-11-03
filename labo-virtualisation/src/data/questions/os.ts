import { themeBuilder } from '../build'

const t = themeBuilder('os')

t.mcq("Dans quel anneau de protection tourne le noyau ?", ["Ring 0", "Ring 3", "Ring 1", "Ring 7"],
  "Le noyau tourne en ring 0, avec tous les droits. Les applications tournent en ring 3, sans accès direct au matériel.")
t.mcq("Qu'est-ce qu'un appel système (syscall) ?", ["Une demande d'une application au noyau", "Une mise à jour de l'OS", "Un redémarrage du système", "Un appel VoIP"],
  "Pour lire un fichier ou ouvrir une connexion, l'application demande au noyau ([[open]], [[read]], [[socket]]…). Le CPU passe en ring 0 le temps de l'opération.")
t.mcq("Qu'est-ce qu'un processus ?", ["Un programme en cours d'exécution, avec sa mémoire et son PID", "Un fichier exécutable sur le disque", "Un pilote du noyau", "Un service désactivé"],
  "Le programme est le fichier ; le processus est ce programme lancé. On peut lancer 3 fois le même programme : 3 processus.")
t.mcq("Quel est le rôle de l'ordonnanceur (scheduler) ?", ["Décider quel thread tourne sur quel cœur, et combien de temps", "Ranger les fichiers sur le disque", "Attribuer les adresses IP", "Chiffrer la RAM"],
  "En alternant très vite (quelques millisecondes), il donne l'illusion que tout tourne en même temps. Sous Proxmox, il répartit aussi les vCPU des VM.")
t.mcq("À quoi sert la MMU ?", ["Traduire les adresses mémoire virtuelles en adresses physiques", "Gérer les disques", "Gérer le réseau", "Refroidir le CPU"],
  "Chaque processus croit avoir sa propre mémoire continue ; la MMU, aidée par la table des pages, fait la traduction à chaque accès.")
t.mcq("Quelle est la taille standard d'une page mémoire sur x86 ?", ["4 Kio", "512 octets", "1 Mio", "64 Kio"],
  "Les pages normales font 4 Kio. Les hugepages font 2 Mio ou 1 Gio, ce qui réduit le coût de traduction pour les grosses VM ou bases.")
t.mcq("Qu'est-ce que le swap ?", ["Une zone du disque utilisée quand la RAM manque", "Un type de RAM rapide", "Un échange de VM entre serveurs", "Une sauvegarde"],
  "Le noyau déplace sur disque des pages peu utilisées. C'est très lent : un hyperviseur qui swappe est un hyperviseur sous-dimensionné.")
t.mcq("Qu'est-ce qu'un pilote (driver) ?", ["Du code du noyau qui sait parler à un matériel précis", "Un programme de l'espace utilisateur", "Un fichier de configuration", "Un compte administrateur"],
  "Sans pilote, l'OS ne sait pas utiliser le matériel. Dans une VM, les pilotes VirtIO sont conçus pour le matériel virtuel.")
t.mcq("Que permet le DMA ?", ["Un périphérique écrit directement en RAM sans occuper le CPU", "Le CPU lit le disque plus vite", "La RAM devient persistante", "Le réseau passe en jumbo frames"],
  "Le DMA décharge le CPU pour les gros transferts. L'IOMMU contrôle ces accès, ce qui rend possible le passthrough PCI.")
t.mcq("Pourquoi un OS invité pose-t-il problème sans assistance matérielle ?", ["Il veut tourner en ring 0, déjà occupé par l'hyperviseur", "Il n'a pas de licence", "Il ne voit pas le réseau", "Il manque de RAM"],
  "Un OS est écrit pour contrôler le matériel. VT-x/AMD-V ajoutent un mode invité qui lui fait croire qu'il est en ring 0, sans lui donner les vrais droits.")
t.mcq("Sur quels mécanismes du noyau reposent les conteneurs ?", ["Les namespaces et les cgroups", "VT-x et EPT", "Le BIOS et l'UEFI", "Le RAID et LVM"],
  "Les namespaces isolent (processus, réseau, fichiers, utilisateurs) ; les cgroups limitent (CPU, RAM, E/S).")
t.mcq("Que font EPT (Intel) et NPT (AMD) ?", ["La double traduction mémoire des VM, en matériel", "Le chiffrement des disques", "L'agrégation réseau", "La gestion de l'alimentation"],
  "Dans une VM, l'invité traduit ses adresses, puis l'hyperviseur traduit à nouveau. EPT/NPT font les deux dans le CPU : la RAM virtuelle devient rapide.")
t.mcq("Qu'est-ce qu'une interruption ?", ["Un signal d'un périphérique qui demande l'attention du CPU", "Un plantage du noyau", "Une coupure de courant", "Un arrêt de VM"],
  "« Un paquet est arrivé », « la lecture est finie » : le CPU suspend son travail pour traiter l'événement.")
t.mcq("Quel est le premier programme lancé par le noyau Linux moderne ?", ["systemd", "bash", "GRUB", "cron"],
  "systemd (PID 1) démarre ensuite tous les services : réseau, SSH, Proxmox…")
t.order("Remettez dans l'ordre la séquence de démarrage d'un ordinateur.",
  ["Le firmware (BIOS/UEFI) teste le matériel (POST)", "Le chargeur d'amorçage (GRUB) se lance", "Le noyau est chargé en RAM", "Le noyau lance systemd", "systemd démarre les services"],
  "Firmware → bootloader → noyau → systemd → services. Une VM suit exactement la même séquence, avec un firmware virtuel (SeaBIOS ou OVMF).")

export default t.list
