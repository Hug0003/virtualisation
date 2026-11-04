import { analogy, chapter, check, code, key, lesson, list, p, read, table } from './build'

export default chapter(
  'pve',
  'Proxmox VE',
  'L’hyperviseur open source qui assemble tout ce que vous avez appris.',

  lesson(
    'Découvrir Proxmox VE',
    5,
    read(
      'Ce qu’il y a dans la boîte',
      p('**Proxmox VE** est une distribution **Debian** qui embarque :'),
      list('**KVM/QEMU** pour les machines virtuelles ;', '**LXC** pour les conteneurs ;', 'une **interface web** sur le port **8006** ;', 'le **cluster**, la haute disponibilité, Ceph, ZFS, les sauvegardes et un pare-feu.'),
      p('Il est gratuit et open source. L’abonnement payant donne accès au dépôt **enterprise**, plus testé, et au support.'),
    ),
    read(
      'L’interface web',
      p('L’arbre de gauche suit une hiérarchie simple :'),
      code('Datacenter\n └─ pve1 (nœud)\n     ├─ 100 (debian-web)   ← VM\n     ├─ 101 (ct-dns)       ← conteneur\n     ├─ local              ← ISO, modèles, sauvegardes\n     └─ local-lvm          ← disques des VM'),
      key('Après l’installation, on remplace le dépôt enterprise par le dépôt **no-subscription** (sinon [[apt update]] échoue), puis on fait [[apt full-upgrade]].'),
    ),
    check('Sur quelle distribution Linux Proxmox VE est-il basé ?', ['Debian', 'Ubuntu', 'Red Hat', 'Arch Linux'], 'Proxmox VE 9 repose sur Debian 13 « Trixie ».'),
    check('Que contient le stockage « local » d’une installation par défaut ?', ['Les ISO, les modèles de conteneurs et les sauvegardes', 'Les disques des VM', 'La configuration du cluster', 'Les journaux système'], 'Les disques des VM vont sur local-lvm (ou local-zfs).'),
  ),

  lesson(
    'Créer une VM et un conteneur',
    6,
    read(
      'Les identifiants',
      p('Chaque VM ou conteneur reçoit un **VMID** unique dans le cluster, à partir de **100**. Sa configuration est un simple fichier texte :'),
      table(['Type', 'Fichier de configuration', 'Commande'], ['VM', '[[/etc/pve/qemu-server/100.conf]]', '[[qm]]'], ['Conteneur LXC', '[[/etc/pve/lxc/101.conf]]', '[[pct]]']),
    ),
    read(
      'Piloter en ligne de commande',
      code('qm list            # lister les VM\nqm start 100       # démarrer la VM 100\nqm shutdown 100    # arrêt propre\nqm stop 100        # arrêt brutal (prise débranchée)\npct enter 101      # ouvrir un shell dans le conteneur 101'),
      p('Dans chaque VM, installez le **QEMU Guest Agent** : Proxmox pourra alors afficher son IP, l’éteindre proprement et figer les disques pendant les sauvegardes.'),
    ),
    check('Quelle commande démarre la VM 101 ?', ['qm start 101', 'pct start 101', 'vm start 101', 'systemctl start 101'], 'qm pilote les VM (QEMU), pct les conteneurs LXC.'),
    read(
      'Modèles et clones',
      p('Une VM bien préparée peut être transformée en **modèle** (template). On en tire ensuite des **clones** :'),
      list('**Clone lié** : instantané et léger, mais dépend du modèle.', '**Clone complet** : copie indépendante, plus longue à créer.'),
      analogy('Le modèle est un moule à gâteau : on ne le mange pas, on s’en sert pour en faire d’autres.'),
    ),
    check('Quel type de clone est créé presque instantanément, mais dépend de son modèle ?', ['Le clone lié', 'Le clone complet', 'Le snapshot', 'La sauvegarde'], 'Le clone lié ne stocke que les différences avec le modèle.'),
  ),

  lesson(
    'Snapshots, sauvegardes et mises à jour',
    5,
    read(
      'Snapshot ou sauvegarde ?',
      table(
        ['', 'Snapshot', 'Sauvegarde (vzdump)'],
        ['Où ?', 'Sur le même stockage que la VM', 'Sur un autre stockage, idéalement un autre serveur'],
        ['Vitesse', 'Instantané', 'Plusieurs minutes'],
        ['Protège contre…', 'Une mise à jour ratée', 'La perte du serveur, du disque, une erreur humaine'],
        ['Durée de vie', 'Quelques heures ou jours', 'Des semaines, des mois'],
      ),
      key('Un snapshot n’est **pas** une sauvegarde : si le disque meurt, la VM et ses snapshots disparaissent ensemble.'),
    ),
    read(
      'Sauvegarder avec Proxmox',
      p('La commande **vzdump** sauvegarde une VM en mode **snapshot**, sans l’arrêter. On planifie des tâches dans **Datacenter → Sauvegarde**.'),
      p('**Proxmox Backup Server** (PBS) va plus loin : sauvegardes **incrémentales** et **dédupliquées**, chiffrement, vérification. Seuls les blocs modifiés voyagent.'),
      code('vzdump 100 --mode snapshot --storage pbs1'),
    ),
    check('Le disque du serveur meurt. Quels éléments permettent encore de récupérer la VM ?', ['Une sauvegarde stockée ailleurs', 'Un snapshot de la VM', 'Le fichier 100.conf', 'Le clone lié'], 'Le snapshot était sur le disque mort ; seule une copie externe survit.'),
    check('Quel est le grand avantage de Proxmox Backup Server ?', ['Des sauvegardes incrémentales et dédupliquées', 'Il remplace le RAID', 'Il fait migrer les VM', 'Il gère le quorum'], 'Après la première sauvegarde complète, seuls les blocs nouveaux sont envoyés et stockés.'),
  ),
)
