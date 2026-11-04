import { analogy, chapter, check, key, lesson, list, p, read, table } from './build'

export default chapter(
  'os',
  'Le système d’exploitation',
  'Le chef d’orchestre entre le matériel et les programmes.',

  lesson(
    'Le noyau et l’espace utilisateur',
    4,
    read(
      'À quoi sert un système d’exploitation ?',
      p('Les programmes ne parlent pas directement au matériel. Ils passent par le **système d’exploitation** (OS) : Windows, Linux, macOS…'),
      p('Son cœur s’appelle le **noyau** (kernel). Il gère :'),
      list('le partage du **CPU** entre les programmes ;', 'la **mémoire** de chacun ;', 'l’accès aux **disques** et au **réseau** ;', 'la **sécurité** : qui a le droit de faire quoi.'),
    ),
    read(
      'Deux mondes séparés',
      p('Le processeur distingue deux niveaux de privilèges :'),
      table(['Niveau', 'Qui y tourne', 'Droits'], ['Mode noyau (ring 0)', 'Le noyau, les pilotes', 'Accès total au matériel'], ['Mode utilisateur (ring 3)', 'Vos applications', 'Doivent demander au noyau']),
      p('Quand une application veut lire un fichier, elle fait un **appel système** (syscall) : elle demande poliment au noyau de le faire pour elle.'),
      analogy('Le noyau est le guichetier d’une banque : les clients (les programmes) ne vont jamais dans le coffre eux-mêmes, ils font une demande au guichet.'),
    ),
    check('Quelle partie de l’OS accède directement au matériel ?', ['Le noyau', 'Le navigateur web', 'L’explorateur de fichiers', 'Le terminal'], 'Seul le noyau (et ses pilotes) tourne avec les pleins privilèges du processeur.'),
    read(
      'Et la virtualisation dans tout ça ?',
      p('Une machine virtuelle contient **son propre OS complet**, avec son propre noyau. Ce noyau croit parler à du vrai matériel.'),
      p('L’**hyperviseur** s’intercale en dessous : il fait croire à chaque noyau invité qu’il est seul maître de la machine.'),
      key('Un hyperviseur, c’est un « noyau des noyaux » : il partage le matériel entre plusieurs systèmes d’exploitation.'),
    ),
    check(
      'Dans une VM Windows qui tourne sur Proxmox, combien de noyaux sont en jeu ?',
      ['Deux : celui de Proxmox (Linux) et celui de Windows', 'Un seul, partagé', 'Aucun', 'Trois'],
      'L’hôte a son noyau Linux (avec KVM), et la VM a son propre noyau Windows.',
    ),
  ),

  lesson(
    'Processus, mémoire et démarrage',
    5,
    read(
      'Les processus',
      p('Un **processus** est un programme en cours d’exécution. Chacun a un numéro, le **PID**, et sa propre zone de mémoire.'),
      p('Un processus peut contenir plusieurs **threads** qui travaillent en parallèle. Le noyau répartit tous ces threads sur les cœurs du CPU : c’est l’**ordonnanceur**.'),
      key('Sous Proxmox, chaque VM est un processus QEMU, et chaque vCPU de la VM est un thread de ce processus.'),
    ),
    read(
      'La mémoire virtuelle et le swap',
      p('Chaque processus croit disposer de toute la mémoire pour lui seul : c’est la **mémoire virtuelle**. Le noyau traduit ses adresses vers la vraie RAM.'),
      p('Quand la RAM manque, le noyau déplace des pages peu utilisées sur le disque, dans le **swap**. Ça évite le plantage, mais c’est des milliers de fois plus lent.'),
    ),
    check('Que se passe-t-il quand un serveur commence à beaucoup utiliser son swap ?', ['Il ralentit fortement', 'Il accélère', 'Il redémarre aussitôt', 'Il libère de l’espace disque'], 'Le disque est bien plus lent que la RAM : un serveur qui « swappe » devient poussif.'),
    read(
      'La séquence de démarrage',
      p('Quand on allume un serveur Linux, les étapes s’enchaînent toujours dans le même ordre :'),
      list('**Firmware** (BIOS ou UEFI) : teste le matériel et cherche un disque de démarrage.', '**Chargeur d’amorçage** (GRUB) : charge le noyau en mémoire.', '**Noyau** : détecte le matériel et monte le disque système.', '**systemd** (PID 1) : lance tous les services (réseau, SSH, interface web…).'),
    ),
    check('Quel est le tout premier processus lancé par le noyau sur un Linux moderne ?', ['systemd', 'GRUB', 'bash', 'sshd'], 'systemd porte le PID 1 et démarre tous les autres services.'),
  ),

  lesson(
    'Pourquoi virtualiser ?',
    3,
    read(
      'Le problème d’avant',
      p('Pendant longtemps, la règle était : **une application = un serveur physique**. Pour éviter qu’une appli en dérange une autre.'),
      p('Résultat : des salles pleines de serveurs utilisés à **10 ou 15 %** de leur capacité, qui consomment de l’électricité, de la place et de la climatisation.'),
    ),
    read(
      'Ce que la virtualisation apporte',
      list(
        '**Consolidation** : 20 VM sur un seul serveur bien rempli.',
        '**Isolation** : une VM qui plante n’emporte pas les autres.',
        '**Snapshots** : une photo de la VM avant une mise à jour risquée.',
        '**Migration** : déplacer une VM d’un serveur à un autre, parfois sans l’éteindre.',
        '**Rapidité** : une nouvelle machine en deux minutes, sans commander de matériel.',
      ),
      analogy('Avant, chaque famille avait sa maison avec sa propre chaudière à moitié éteinte. La virtualisation, c’est l’immeuble : chacun son appartement fermé à clé, mais une seule chaufferie bien utilisée.'),
    ),
    check(
      'Quel est le principal gain économique de la virtualisation ?',
      ['Faire tourner beaucoup de serveurs logiques sur peu de machines physiques', 'Rendre chaque application plus rapide', 'Supprimer le besoin de sauvegardes', 'Ne plus avoir besoin de réseau'],
      'C’est la consolidation : moins de matériel, d’énergie et de place pour le même service.',
    ),
    check(
      'Pourquoi prend-on un snapshot avant une mise à jour risquée ?',
      ['Pour pouvoir revenir instantanément à l’état d’avant', 'Pour accélérer la mise à jour', 'Pour remplacer une sauvegarde', 'Pour libérer de la RAM'],
      'Un snapshot fige l’état de la VM. Attention : il reste sur le même stockage, ce n’est pas une sauvegarde.',
    ),
  ),
)
