import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'lvm',
  'LVM, ZFS et Ceph',
  'Trois façons d’organiser les disques, du serveur seul au cluster entier.',

  lesson(
    'LVM, des disques en pâte à modeler',
    6,
    read(
      'Trois couches',
      p('**LVM** (Logical Volume Manager) assemble des disques et les redécoupe librement :'),
      list(
        '**PV** (Physical Volume) : un disque ou une partition préparé pour LVM.',
        '**VG** (Volume Group) : un réservoir qui regroupe un ou plusieurs PV.',
        '**LV** (Logical Volume) : une « partition » taillée dans le VG, redimensionnable à chaud.',
      ),
      analogy('Les PV sont des pains de pâte à modeler, le VG la grosse boule qu’on en fait, et les LV les morceaux qu’on découpe dedans, de la taille voulue.'),
      code('pvcreate /dev/sdb\nvgcreate vg_data /dev/sdb\nlvcreate -L 50G -n vm-disk vg_data'),
    ),
    check('Dans quel ordre crée-t-on les éléments LVM ?', ['PV, puis VG, puis LV', 'VG, puis PV, puis LV', 'LV, puis VG, puis PV', 'PV, puis LV, puis VG'], 'On prépare les disques (PV), on les regroupe (VG), puis on découpe (LV).'),
    read(
      'LVM-thin',
      p('Avec un **thin pool**, un disque de VM de 100 Go n’occupe que la place **réellement écrite**. On peut même promettre plus d’espace qu’il n’en existe : c’est le **surprovisionnement**.'),
      p('Proxmox l’utilise par défaut : c’est le stockage **local-lvm**. Il permet aussi des snapshots rapides.'),
      key('Surprovisionner, c’est pratique, mais il faut surveiller le remplissage du pool : s’il atteint 100 %, toutes les VM qui écrivent dessus se bloquent.'),
    ),
    check('Quel est le risque principal d’un thin pool surprovisionné ?', ['Qu’il se remplisse à 100 % et bloque les VM', 'Qu’il soit plus lent qu’un HDD', 'Qu’il empêche les snapshots', 'Qu’il efface les données au redémarrage'], 'Les VM croient avoir de la place, mais le pool réel est plein : les écritures échouent.'),
  ),

  lesson(
    'ZFS, le système de fichiers qui vérifie tout',
    6,
    read(
      'Tout-en-un',
      p('**ZFS** est à la fois un gestionnaire de volumes (comme LVM), un RAID logiciel et un système de fichiers.'),
      list(
        '**Sommes de contrôle** sur chaque bloc : ZFS détecte les données corrompues et les répare depuis la copie saine.',
        '**Copy-on-write** : il n’écrase jamais un bloc en place. Les snapshots sont instantanés et ne coûtent presque rien.',
        '**Compression** à la volée (lz4) : souvent plus rapide que sans.',
        '**Réplication** : [[zfs send]] / [[zfs receive]] envoie un disque de VM vers un autre serveur.',
      ),
    ),
    read(
      'Les niveaux de RAID de ZFS',
      table(['ZFS', 'Équivalent', 'Pannes tolérées'], ['mirror', 'RAID 1', '1 (par miroir)'], ['RAIDZ1', 'RAID 5', '1'], ['RAIDZ2', 'RAID 6', '2'], ['RAIDZ3', '—', '3']),
      key('ZFS aime la RAM : il s’en sert comme cache (l’**ARC**). Comptez au moins 8 Go, plus environ 1 Go par To de stockage. Et ne le mettez jamais derrière un contrôleur RAID matériel : il veut voir les disques directement (mode HBA).'),
    ),
    check('Quel est l’équivalent ZFS d’un RAID 6 ?', ['RAIDZ2', 'RAIDZ1', 'mirror', 'stripe'], 'RAIDZ2 utilise deux disques de parité et tolère deux pannes.'),
    check(
      'Pourquoi les snapshots ZFS sont-ils quasi instantanés ?',
      ['Grâce au copy-on-write : rien n’est copié au moment du snapshot', 'Parce que ZFS compresse tout', 'Parce qu’ils sont stockés en RAM', 'Parce qu’ils ignorent les fichiers ouverts'],
      'ZFS garde simplement les anciens blocs au lieu de les libérer.',
    ),
  ),

  lesson(
    'Ceph, le stockage distribué',
    6,
    read(
      'Un stockage réparti sur tout le cluster',
      p('**Ceph** transforme les disques de plusieurs serveurs en **un seul stockage partagé**, sans baie de stockage dédiée.'),
      list(
        '**OSD** : un démon par disque, qui stocke les données.',
        '**MON** (moniteurs) : ils tiennent la carte du cluster. Il en faut une majorité (un quorum) pour fonctionner : 3 au minimum.',
        '**Réplication** : chaque donnée est copiée sur plusieurs serveurs. Par défaut, **size = 3** (trois copies) et **min_size = 2**.',
      ),
      analogy('Ceph, c’est un document important photocopié trois fois et rangé dans trois bureaux différents : un bureau peut brûler sans que rien ne soit perdu.'),
    ),
    read(
      'Faire le calcul',
      p('Avec trois copies, l’espace utile est le tiers de l’espace brut :'),
      code('3 nœuds × 4 To = 12 To bruts\n12 To ÷ 3 copies = 4 To utiles\n(en pratique, on vise au plus 70-80 % de remplissage)'),
      key('Ceph veut un réseau rapide et dédié : 10 Gb/s au minimum, 25 Gb/s conseillés. Chaque écriture voyage vers deux autres serveurs.'),
    ),
    check('3 nœuds avec chacun 4 To de disques, Ceph en size = 3. Quel espace utile, en théorie ?', ['4 To', '12 To', '8 To', '36 To'], '12 To bruts ÷ 3 copies = 4 To utiles.'),
    check('Combien de serveurs faut-il au minimum pour un cluster Ceph correct ?', ['3', '1', '2', '5'], 'Trois MON pour le quorum, et trois serveurs pour placer les trois copies.'),
  ),
)
