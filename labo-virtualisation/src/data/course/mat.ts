import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'mat',
  'Le matériel et les unités',
  'Ce qu’il y a dans un serveur, et comment on mesure tout ça.',

  lesson(
    'Ce qu’il y a dans un serveur',
    4,
    read(
      'Quatre pièces essentielles',
      p('Un serveur est un ordinateur comme le vôtre, en plus robuste. Quatre pièces font tout le travail :'),
      list(
        '**Le processeur (CPU)** exécute les instructions des programmes.',
        '**La mémoire vive (RAM)** garde les données en cours d’utilisation. Elle est très rapide, mais elle s’efface à l’extinction.',
        '**Le stockage** (disque dur, SSD, NVMe) conserve les données durablement.',
        '**La carte réseau (NIC)** relie le serveur aux autres machines.',
      ),
      analogy(
        'Une cuisine de restaurant : le CPU est le cuisinier, la RAM le plan de travail, le disque le garde-manger, et la carte réseau le passe-plat vers la salle.',
      ),
    ),
    check(
      'On éteint brutalement le serveur. Quelle pièce perd tout son contenu ?',
      ['La RAM', 'Le SSD', 'Le disque dur', 'Le BIOS'],
      'La RAM est volatile : sans courant, elle s’efface. C’est pour ça qu’on enregistre son travail sur disque.',
    ),
    read(
      'Cœurs et threads',
      p('Un processeur moderne contient plusieurs **cœurs** : chacun est un petit processeur capable de travailler seul.'),
      p(
        'Avec l’**Hyper-Threading** (Intel) ou le **SMT** (AMD), chaque cœur gère deux fils d’exécution, les **threads**. Le système voit alors deux fois plus de processeurs logiques.',
      ),
      table(['Processeur', 'Cœurs', 'Threads'], ['4 cœurs avec HT', '4', '8'], ['8 cœurs avec SMT', '8', '16'], ['2 sockets × 12 cœurs avec HT', '24', '48']),
      key('En virtualisation, on distribue ces threads aux machines virtuelles sous forme de **vCPU**.'),
    ),
    check(
      'Un serveur a 2 processeurs de 10 cœurs, avec Hyper-Threading. Combien de threads voit-il ?',
      ['40', '20', '10', '80'],
      '2 sockets × 10 cœurs = 20 cœurs ; avec Hyper-Threading, 2 threads par cœur : 40.',
    ),
  ),

  lesson(
    'Bits, octets et unités',
    5,
    read(
      'Le bit et l’octet',
      p('Le **bit** vaut 0 ou 1. Un **octet** (byte en anglais) regroupe **8 bits**.'),
      list('La taille des fichiers et des disques se compte en **octets** : Ko, Mo, Go, To.', 'Les débits réseau se comptent en **bits** par seconde : Mb/s, Gb/s.'),
      key('Un **o** minuscule ou un **B** majuscule : octets. Un **b** minuscule : bits. 1 Gb/s n’est pas 1 Go/s.'),
    ),
    read(
      'Deux façons de compter',
      p('Il existe deux systèmes d’unités, et c’est une source classique de confusion :'),
      table(['Système', 'Préfixes', 'Facteur'], ['Décimal (fabricants)', 'Ko, Mo, Go, To', '× 1 000'], ['Binaire (systèmes)', 'Kio, Mio, Gio, Tio', '× 1 024']),
      p('Un disque vendu « 1 To » contient 1 000 000 000 000 octets, soit environ **931 Gio**. Windows affiche « 931 Go » mais compte en réalité en Gio.'),
    ),
    check(
      'Pourquoi un disque de 1 To n’affiche-t-il que 931 Go dans Windows ?',
      ['Le fabricant compte en puissances de 1 000, Windows en puissances de 1 024', 'Le formatage prend 69 Go', 'Une partie du disque est défectueuse', 'Windows réserve de la place pour la mise en veille'],
      '10¹² octets ÷ 1 024³ ≈ 931 Gio. Rien n’est perdu, c’est juste une autre unité.',
    ),
    read(
      'Convertir un débit',
      p('Pour passer des bits aux octets, on divise par 8 :'),
      table(['Débit réseau', 'En octets', 'Usage typique'], ['1 Gb/s', '≈ 125 Mo/s', 'Réseau de bureau'], ['10 Gb/s', '≈ 1,25 Go/s', 'Lien entre serveurs'], ['25 Gb/s', '≈ 3,1 Go/s', 'Ceph, stockage']),
      analogy('Migrer une VM de 40 Go sur un lien 1 Gb/s prend au moins 40 000 ÷ 125 = 320 secondes, un peu plus de 5 minutes.'),
    ),
    check('Combien de mégaoctets par seconde transfère un lien de 1 Gb/s, au maximum ?', ['Environ 125 Mo/s', '1 000 Mo/s', '1 024 Mo/s', '8 Mo/s'], '1 000 Mb/s ÷ 8 = 125 Mo/s. En pratique, on obtient un peu moins.'),
  ),

  lesson(
    'La virtualisation dans le processeur',
    4,
    read(
      'VT-x, AMD-V et IOMMU',
      p('Pour faire tourner des machines virtuelles efficacement, le processeur doit proposer des **instructions de virtualisation** :'),
      list('**Intel VT-x** ou **AMD-V** (SVM) : indispensables pour KVM, Hyper-V, VMware.', '**VT-d** (Intel) ou **AMD-Vi** : l’**IOMMU**, qui permet de donner un périphérique physique (carte graphique, carte réseau) à une seule VM.'),
      p('Ces options s’activent dans le **BIOS/UEFI** de la carte mère. Sur certains PC, elles sont désactivées par défaut.'),
    ),
    read(
      'Vérifier sur son propre PC',
      p('Sous Windows : **Gestionnaire des tâches → Performance → Processeur**, ligne « Virtualisation ». Sous Linux :'),
      code('grep -E -c "vmx|svm" /proc/cpuinfo'),
      p('Un résultat supérieur à 0 signifie que le processeur sait virtualiser.'),
      key('Le processeur doit savoir virtualiser (BIOS), **et** le système doit avoir un hyperviseur actif. Sous Windows, c’est la « Plateforme de machine virtuelle » qui l’active : sans elle, ni WSL 2 ni Docker Desktop ne démarrent.'),
    ),
    check('Quelle technologie Intel faut-il activer dans le BIOS pour faire tourner des VM avec KVM ?', ['VT-x', 'Turbo Boost', 'SpeedStep', 'Secure Boot'], 'VT-x (ou AMD-V chez AMD) donne au CPU les instructions de virtualisation.'),
    check(
      'À quoi sert l’IOMMU (VT-d / AMD-Vi) ?',
      ['À donner un périphérique physique en exclusivité à une VM', 'À accélérer la RAM', 'À chiffrer les disques', 'À créer des VLAN'],
      'C’est ce qui permet le PCI passthrough, par exemple une carte graphique dédiée à une VM.',
    ),
  ),
)
