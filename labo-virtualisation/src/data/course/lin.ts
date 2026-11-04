import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'lin',
  'Linux, l’outil de l’admin',
  'Proxmox est une Debian : le terminal sera votre meilleur ami.',

  lesson(
    'Le terminal et l’arborescence',
    5,
    read(
      'Un seul arbre',
      p('Sous Linux, il n’y a pas de C: ou D: : tout part d’une racine unique, **/**. Les disques viennent se « monter » dans cet arbre.'),
      table(
        ['Dossier', 'Contenu'],
        ['[[/etc]]', 'Les fichiers de configuration'],
        ['[[/var/log]]', 'Les journaux'],
        ['[[/home]]', 'Les dossiers des utilisateurs'],
        ['[[/root]]', 'Le dossier de l’administrateur'],
        ['[[/dev]]', 'Les périphériques (disques : [[/dev/sda]], [[/dev/nvme0n1]])'],
        ['[[/etc/pve]]', 'La configuration de Proxmox, partagée dans le cluster'],
      ),
    ),
    check('Dans quel dossier trouve-t-on les fichiers de configuration du système ?', ['/etc', '/var', '/home', '/bin'], '/etc contient la configuration : réseau, services, utilisateurs…'),
    read(
      'Se déplacer et lire',
      p('Les premières commandes à connaître :'),
      code('pwd              # où suis-je ?\nls -l            # lister le dossier\ncd /etc          # aller dans /etc\ncat hostname     # afficher un fichier\nnano interfaces  # modifier un fichier'),
      key('Tab complète les noms, et la flèche du haut rappelle les commandes précédentes. Ça fait gagner un temps fou.'),
    ),
    check('Quelle commande affiche le contenu d’un fichier texte ?', ['cat', 'cd', 'pwd', 'mkdir'], 'cat affiche le fichier en entier ; less permet de le parcourir page par page.'),
  ),

  lesson(
    'Utilisateurs et droits',
    5,
    read(
      'root et sudo',
      p('**root** est l’administrateur : il a tous les droits. Sur un serveur, on évite de travailler en root en permanence : une faute de frappe peut tout casser.'),
      p('La commande **sudo** exécute une seule commande avec les droits de root : [[sudo apt update]]. Sur Proxmox, on se connecte généralement directement en root.'),
    ),
    read(
      'Lire les droits rwx',
      p('Chaque fichier a trois droits, pour trois catégories de personnes :'),
      table(['Lettre', 'Droit', 'Valeur'], ['r', 'Lire', '4'], ['w', 'Écrire', '2'], ['x', 'Exécuter', '1']),
      p('On additionne les valeurs pour le **propriétaire**, le **groupe**, puis les **autres** :'),
      code('chmod 754 script.sh\n# 7 = 4+2+1 → rwx pour le propriétaire\n# 5 = 4+1   → r-x pour le groupe\n# 4         → r-- pour les autres'),
    ),
    check('Que donne chmod 640 sur un fichier ?', ['Propriétaire : lecture et écriture ; groupe : lecture ; autres : rien', 'Tout le monde peut tout faire', 'Propriétaire : tout ; les autres : lecture', 'Personne ne peut le lire'], '6 = 4+2 (rw-), 4 = r--, 0 = ---.'),
    check('Quelle valeur octale correspond à rwxr-xr-x ?', ['755', '777', '644', '711'], 'rwx = 7, r-x = 5, r-x = 5.'),
  ),

  lesson(
    'Services, paquets et journaux',
    5,
    read(
      'Gérer les services avec systemctl',
      p('Un **service** est un programme qui tourne en arrière-plan : le serveur SSH, l’interface web de Proxmox (**pveproxy**)…'),
      code('systemctl status pveproxy    # état du service\nsystemctl restart pveproxy   # le redémarrer\nsystemctl enable ssh         # le lancer au démarrage'),
    ),
    check('Quelle commande redémarre le service pveproxy ?', ['systemctl restart pveproxy', 'service pveproxy --reload-all', 'reboot pveproxy', 'apt restart pveproxy'], 'systemctl pilote les services gérés par systemd.'),
    read(
      'Installer et mettre à jour',
      p('Debian, donc Proxmox, utilise le gestionnaire de paquets **apt** :'),
      code('apt update          # rafraîchir la liste des paquets\napt full-upgrade    # tout mettre à jour\napt install htop    # installer un outil'),
      p('Pour comprendre une panne, on lit les **journaux** :'),
      code('journalctl -u pveproxy -e   # journal d’un service, à la fin\njournalctl -f               # suivre en direct'),
      analogy('apt est un magasin d’applications en ligne de commande, et journalctl la boîte noire du serveur.'),
      key('Sur Proxmox, on met à jour avec [[apt full-upgrade]] (ou [[apt dist-upgrade]]), jamais avec un simple [[apt upgrade]], qui peut laisser des paquets bloqués.'),
    ),
    check('Avant d’installer un paquet, quelle commande rafraîchit la liste des paquets disponibles ?', ['apt update', 'apt upgrade', 'apt refresh', 'apt list'], 'apt update télécharge la liste à jour ; apt upgrade installe ensuite les nouvelles versions.'),
    read(
      'Le réseau en ligne de commande',
      list('[[ip a]] : les interfaces et leurs adresses IP.', '[[ip r]] : la table de routage (la passerelle par défaut).', '[[ping 8.8.8.8]] : tester la connectivité.', '[[ss -tlnp]] : les ports en écoute.'),
    ),
    check('Quelle commande affiche les adresses IP des interfaces ?', ['ip a', 'ip r', 'ss -tlnp', 'route print'], 'ip a (ou ip addr) liste chaque interface avec ses adresses.'),
  ),
)
