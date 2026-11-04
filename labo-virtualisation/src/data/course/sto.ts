import { analogy, chapter, check, key, lesson, list, p, read, table } from './build'

export default chapter(
  'sto',
  'Le stockage',
  'Disques, RAID et stockage partagé : où vivent les VM.',

  lesson(
    'Disques et performances',
    4,
    read(
      'Trois familles de disques',
      table(
        ['Type', 'Fonctionnement', 'IOPS typiques', 'Usage'],
        ['HDD', 'Plateaux qui tournent, tête mécanique', '≈ 100 à 200', 'Gros volumes pas chers, sauvegardes'],
        ['SSD SATA', 'Mémoire flash, interface SATA', '≈ 50 000 à 100 000', 'Système, VM'],
        ['NVMe', 'Mémoire flash, directement sur le PCIe', '≈ 500 000 et plus', 'VM exigeantes, bases de données, Ceph'],
      ),
      p('Les **IOPS** (opérations d’entrée-sortie par seconde) comptent plus que le débit pour des VM : chacune fait plein de petites lectures et écritures au hasard.'),
    ),
    check('Quel type de disque offre le plus d’IOPS ?', ['NVMe', 'SSD SATA', 'HDD 7 200 tr/min', 'HDD 15 000 tr/min'], 'Le NVMe parle directement au bus PCIe, sans le goulot d’étranglement SATA.'),
    check(
      'Pourquoi 20 VM sur un seul disque dur mécanique sont-elles lentes ?',
      ['La tête du disque doit sauter sans arrêt entre les données de chaque VM', 'Le disque est trop petit', 'Le CPU est saturé', 'Le réseau est trop lent'],
      'Chaque VM réclame ses données ailleurs sur le plateau : le disque passe son temps à déplacer sa tête.',
    ),
  ),

  lesson(
    'Le RAID',
    6,
    read(
      'Plusieurs disques, un seul volume',
      p('Le **RAID** combine plusieurs disques pour gagner en **vitesse**, en **tolérance aux pannes**, ou les deux.'),
      table(
        ['Niveau', 'Principe', 'Capacité utile (n disques de taille T)', 'Pannes tolérées'],
        ['RAID 0', 'Répartition (striping)', 'n × T', '0'],
        ['RAID 1', 'Miroir', 'T', 'n − 1'],
        ['RAID 5', 'Parité répartie', '(n − 1) × T', '1'],
        ['RAID 6', 'Double parité', '(n − 2) × T', '2'],
        ['RAID 10', 'Miroirs répartis', 'n × T ÷ 2', '1 par miroir'],
      ),
    ),
    check('Quelle capacité utile donnent 4 disques de 2 To en RAID 5 ?', ['6 To', '8 To', '4 To', '2 To'], '(4 − 1) × 2 To = 6 To : l’équivalent d’un disque sert à la parité.'),
    read(
      'Le piège classique',
      key('**Le RAID n’est pas une sauvegarde.** Si vous supprimez un fichier, ou si un ransomware chiffre tout, le RAID réplique fidèlement la catastrophe sur tous les disques.'),
      p('Le RAID protège contre la **panne d’un disque**. La sauvegarde protège contre **tout le reste** : erreur humaine, virus, incendie, vol.'),
      analogy('Le RAID, c’est la roue de secours : utile pour une crevaison, inutile si la voiture est volée.'),
    ),
    check('Un administrateur supprime par erreur une VM sur un RAID 1. Que se passe-t-il ?', ['Elle est supprimée sur les deux disques', 'Elle reste sur le second disque', 'Le RAID annule la suppression', 'Le RAID passe en mode dégradé'], 'Le miroir recopie chaque écriture, y compris les suppressions. Seule une sauvegarde peut la ramener.'),
  ),

  lesson(
    'Bloc, fichier, local, partagé',
    5,
    read(
      'Bloc ou fichier ?',
      table(
        ['Type', 'Ce qu’on reçoit', 'Exemples'],
        ['Stockage **bloc**', 'Un disque brut, à formater soi-même', 'Disque local, LVM, iSCSI, Ceph RBD'],
        ['Stockage **fichier**', 'Un dossier partagé, déjà formaté', 'NFS, SMB/CIFS, CephFS'],
      ),
      p('Sur Proxmox, les disques de VM vont plutôt sur du stockage bloc, et les ISO et sauvegardes sur du stockage fichier.'),
    ),
    read(
      'Local ou partagé ?',
      list(
        '**Local** : les disques sont dans le serveur. Rapide et simple, mais si le serveur tombe, ses VM sont inaccessibles.',
        '**Partagé** : tous les serveurs du cluster voient le même stockage (NFS, iSCSI, Ceph). Une VM peut redémarrer ou migrer ailleurs sans copier son disque.',
      ),
      key('Stockage partagé = migration à chaud rapide et haute disponibilité possibles.'),
    ),
    check(
      'Quel stockage permet de migrer une VM d’un nœud à l’autre sans copier son disque ?',
      ['Un stockage partagé (NFS, iSCSI, Ceph…)', 'Un disque local en RAID 1', 'Une clé USB', 'Le stockage local-lvm'],
      'Les deux nœuds voient déjà le disque : seule la RAM de la VM doit voyager.',
    ),
    check('NFS fournit un stockage de type…', ['Fichier', 'Bloc', 'Objet', 'Mémoire'], 'NFS partage des dossiers via le réseau, comme un partage Windows (SMB).'),
  ),
)
