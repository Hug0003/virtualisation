import { themeBuilder } from '../build'

const t = themeBuilder('lin')

t.mcq("Dans quel dossier se trouve la configuration du système ?", ["/etc", "/var", "/home", "/boot"],
  "Presque tout se configure en éditant des fichiers texte de /etc : réseau, services, dépôts apt…")
t.mcq("Que désigne [[/]] sous Linux ?", ["La racine de toute l'arborescence", "Le dossier personnel de root", "Le premier disque", "Le dossier des programmes"],
  "Il n'y a pas de C: ou D: : tout part de /, et les disques sont montés quelque part dans cet arbre.")
t.mcq("Quels droits correspondent à [[chmod 644]] ?", ["rw-r--r--", "rwxr--r--", "rw-rw-r--", "r--r--r--"],
  "r = 4, w = 2, x = 1. 6 = rw-, 4 = r--. Donc rw-r--r-- : le propriétaire écrit, les autres lisent.")
t.mcq("Que fait [[apt update]] ?", ["Il récupère la liste à jour des paquets disponibles", "Il installe toutes les mises à jour", "Il redémarre le serveur", "Il supprime les vieux paquets"],
  "C'est [[apt full-upgrade]] (ou [[dist-upgrade]]) qui installe ensuite les mises à jour. Sur Proxmox, jamais [[apt upgrade]] seul.")
t.mcq("Que fait [[systemctl enable --now nginx]] ?", ["Il démarre nginx maintenant et à chaque démarrage", "Il démarre nginx une seule fois", "Il installe nginx", "Il affiche les journaux de nginx"],
  "[[enable]] = démarrage automatique au boot, [[--now]] = démarrer tout de suite.")
t.mcq("Sur quel port écoute SSH par défaut ?", ["22", "21", "23", "443"],
  "21 = FTP, 23 = Telnet (non chiffré), 443 = HTTPS.")
t.mcq("Que représente [[/dev/sda]] ?", ["Le premier disque SATA/SAS/USB", "La première partition", "Le dossier des logs", "La première carte réseau"],
  "Les partitions sont /dev/sda1, /dev/sda2… Un NVMe s'appelle /dev/nvme0n1, un disque VirtIO dans une VM /dev/vda.")
t.mcq("Que fait le symbole [[|]] (pipe) ?", ["Il envoie la sortie d'une commande dans une autre", "Il lance deux commandes en parallèle", "Il redirige vers un fichier", "Il commente la ligne"],
  "Exemple : [[ps aux | grep nginx]] filtre la liste des processus.")
t.mcq("Que se passe-t-il avec [[rm fichier]] ?", ["Le fichier est supprimé définitivement, sans corbeille", "Le fichier va dans la corbeille", "Le fichier est renommé", "Le fichier est déplacé dans /tmp"],
  "Il n'y a pas de corbeille en ligne de commande. Relisez toujours une commande rm avant de valider, surtout en root.")
t.mcq("Que contient [[/proc/cpuinfo]] ?", ["Les infos sur le processeur, fournies par le noyau", "Les logs du CPU", "Le firmware du CPU", "Les réglages du BIOS"],
  "/proc et /sys sont des fichiers virtuels créés par le noyau. On y vérifie par exemple la présence des drapeaux vmx ou svm.")
t.mcq("Quel est le principal avantage des clés SSH sur les mots de passe ?", ["On peut désactiver la connexion par mot de passe, bien plus sûr", "C'est plus rapide pour le réseau", "Ça chiffre le disque", "Ça évite d'ouvrir le port 22"],
  "La clé privée reste sur votre PC. Plus de mot de passe à deviner pour un attaquant.")
t.mcq("Que signifie [[rwxr-x---]] en octal ?", ["750", "755", "640", "770"],
  "rwx = 7, r-x = 5, --- = 0.")
t.mcq("Quel utilisateur a tous les droits sur un système Linux ?", ["root", "admin", "system", "sudo"],
  "Les autres comptes utilisent [[sudo commande]] pour agir ponctuellement en root.")
t.mcq("Sur quelle distribution est basé Proxmox VE 9 ?", ["Debian 13", "Ubuntu 24.04", "Rocky Linux 9", "Alpine"],
  "Proxmox VE 9 repose sur Debian 13 « Trixie ». Tout ce que vous savez de Debian s'applique.")

t.cmd("Installez le logiciel [[htop]] avec le gestionnaire de paquets Debian.", "apt install htop",
  /^apt(-get)? install (-y )?htop$/, "apt va chercher le paquet dans les dépôts déclarés dans /etc/apt/sources.list.d/.")
t.cmd("Donnez les droits [[rw-r-----]] au fichier [[rapport.txt]].", "chmod 640 rapport.txt",
  [/^chmod 640 rapport\.txt$/, /^chmod u=rw,g=r,o= rapport\.txt$/], "rw- = 6, r-- = 4, --- = 0.")
t.cmd("Connectez-vous en SSH, en root, au serveur 192.168.1.10.", "ssh root@192.168.1.10",
  /^ssh root@192\.168\.1\.10$/, "Format : ssh utilisateur@adresse. Ajoutez [[-p 2222]] si le port n'est pas 22.")
t.cmd("Redémarrez le service SSH.", "systemctl restart ssh",
  /^systemctl restart sshd?(\.service)?$/, "Sous Debian le service s'appelle ssh ; sous Red Hat, sshd.")
t.cmd("Suivez en direct les journaux du service [[pveproxy]].", "journalctl -u pveproxy -f",
  (s) => s.startsWith('journalctl') && /(-u|--unit) pveproxy(\.service)?\b/.test(s) && /(^| )(-f|--follow)\b/.test(s),
  "[[-u]] filtre sur un service, [[-f]] suit les nouvelles lignes comme [[tail -f]].")
t.cmd("Affichez l'utilisation de la RAM dans un format lisible.", "free -h",
  /^free( -[hmg])?$/, "[[free -h]] affiche en Gio/Mio. La colonne available est la plus parlante.")
t.cmd("Affichez l'espace libre de chaque système de fichiers, en format lisible.", "df -h",
  /^df -h( .*)?$/, "[[df]] = disk free. [[du -sh dossier]] donne la taille d'un dossier.")

export default t.list
