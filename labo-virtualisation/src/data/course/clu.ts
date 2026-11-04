import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'clu',
  'Cluster, HA et sauvegarde',
  'Plusieurs serveurs qui travaillent ensemble et se remplacent.',

  lesson(
    'Former un cluster',
    6,
    read(
      'Plusieurs nœuds, une seule interface',
      p('Un **cluster** Proxmox regroupe plusieurs serveurs, les **nœuds**. On les gère tous depuis n’importe lequel d’entre eux.'),
      list(
        '**Corosync** fait communiquer les nœuds en permanence, idéalement sur un réseau dédié à faible latence.',
        '**pmxcfs** partage le dossier [[/etc/pve]] sur tous les nœuds : une configuration modifiée sur l’un apparaît partout.',
      ),
      code('pvecm create mon-cluster        # sur le premier nœud\npvecm add 192.168.1.10          # sur chaque nouveau nœud\npvecm status                    # état du cluster et du quorum'),
    ),
    check('Quelle commande ajoute un nœud à un cluster existant ?', ['pvecm add <ip-d-un-membre>', 'pvecm create', 'qm add', 'corosync join'], 'On la lance sur le nouveau nœud, en donnant l’adresse d’un nœud déjà membre.'),
    read(
      'Le quorum',
      p('Pour éviter que deux moitiés du cluster prennent des décisions contradictoires (le **split-brain**), il faut la **majorité** des votes, le **quorum** :'),
      table(['Nœuds', 'Quorum', 'Pannes tolérées'], ['2', '2', '0'], ['3', '2', '1'], ['4', '3', '1'], ['5', '3', '2']),
      key('Quorum = nombre de nœuds ÷ 2, arrondi à l’entier inférieur, + 1. Sans quorum, [[/etc/pve]] passe en lecture seule : plus aucune VM ne démarre ni ne se modifie.'),
      analogy('Un conseil de classe : il faut plus de la moitié des membres présents pour voter une décision.'),
    ),
    check('Un cluster de 5 nœuds : combien de nœuds peuvent tomber sans perdre le quorum ?', ['2', '1', '3', '4'], 'Quorum = 5 ÷ 2 arrondi (2) + 1 = 3. Il reste 3 votes si 2 nœuds tombent.'),
    check('Pourquoi un cluster de 2 nœuds est-il fragile ?', ['La perte d’un seul nœud fait perdre le quorum', 'Corosync ne fonctionne qu’à partir de 3', 'Il ne peut pas utiliser ZFS', 'Les VM ne peuvent pas y migrer'], 'Avec 2 nœuds, le quorum est 2. On ajoute un QDevice (un petit arbitre externe) pour faire un troisième vote.'),
  ),

  lesson(
    'Migration et haute disponibilité',
    6,
    read(
      'La migration à chaud',
      p('La **migration à chaud** (live migration) déplace une VM en marche d’un nœud à l’autre : la RAM est copiée pendant que la VM tourne, puis une pause de quelques millisecondes bascule tout.'),
      list('Avec un **stockage partagé** (Ceph, NFS, iSCSI), seule la RAM voyage : c’est rapide.', 'Avec un stockage **local**, le disque doit aussi être copié : c’est possible, mais long.', 'Une VM avec un périphérique en **passthrough** ne peut pas migrer à chaud.'),
      code('qm migrate 100 pve2 --online'),
    ),
    check('Avec un stockage Ceph partagé, que transfère une migration à chaud ?', ['Essentiellement le contenu de la RAM', 'Le disque complet', 'Rien du tout', 'Uniquement le fichier de configuration'], 'Le disque est déjà accessible depuis le nœud de destination.'),
    read(
      'La haute disponibilité (HA)',
      p('Avec la **HA**, si un nœud tombe, ses VM **redémarrent automatiquement** sur un autre nœud.'),
      list(
        'Il faut un **stockage partagé** (ou de la réplication ZFS) et **au moins 3 nœuds**.',
        'Le nœud en panne est d’abord isolé (**fencing**) par un **watchdog** : il redémarre de force s’il perd le quorum, pour qu’une VM ne tourne jamais à deux endroits à la fois.',
        'Ce n’est pas instantané : il y a une coupure de 1 à 3 minutes, le temps de détecter la panne et de redémarrer.',
      ),
      key('Migration à chaud = déplacement planifié, sans coupure. HA = redémarrage automatique après une panne, avec une courte coupure.'),
    ),
    check('Un nœud tombe brutalement. Que fait la HA pour ses VM ?', ['Elle les redémarre sur un autre nœud', 'Elle les migre à chaud sans coupure', 'Elle attend le retour du nœud', 'Elle les restaure depuis la sauvegarde'], 'La VM a été coupée net avec le nœud : elle redémarre ailleurs, comme après une coupure de courant.'),
  ),

  lesson(
    'La règle 3-2-1',
    4,
    read(
      'Une stratégie de sauvegarde solide',
      p('La règle **3-2-1** est la base de toute stratégie de sauvegarde :'),
      list('**3** copies des données (l’original et deux sauvegardes) ;', 'sur **2** supports différents ;', 'dont **1** hors site (un autre bâtiment, le cloud).'),
      p('On y ajoute souvent une copie **immuable** ou hors ligne, que même un ransomware ne peut pas chiffrer.'),
    ),
    read(
      'Une sauvegarde non testée…',
      key('… n’est pas une sauvegarde. Restaurez régulièrement une VM dans un environnement de test pour vérifier que tout fonctionne vraiment.'),
      p('Pensez aussi à la **rétention** : combien de sauvegardes garder ? Par exemple 7 quotidiennes, 4 hebdomadaires et 6 mensuelles.'),
      analogy('Un extincteur jamais vérifié peut être vide le jour de l’incendie.'),
    ),
    check('Que signifie le « 1 » de la règle 3-2-1 ?', ['Une copie conservée hors site', 'Une seule sauvegarde suffit', 'Une sauvegarde par jour', 'Un seul support de stockage'], 'Un incendie ou un vol dans la salle serveur ne doit pas emporter toutes les copies.'),
    check('Quelle est la seule façon de savoir si une sauvegarde est utilisable ?', ['Faire un test de restauration', 'Vérifier que le fichier existe', 'Regarder sa taille', 'Lire le journal de la tâche'], 'Une tâche « réussie » peut produire une sauvegarde inutilisable : seul un test de restauration le prouve.'),
  ),
)
