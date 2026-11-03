import { themeBuilder } from '../build'

const t = themeBuilder('hyp')

t.mcq("VirtualBox est un hyperviseur de type…", ["2 (hébergé)", "1 (bare-metal)", "0", "3"],
  "Il s'installe comme une application dans Windows, macOS ou Linux.")
t.mcq("VMware ESXi est un hyperviseur de type…", ["1 (bare-metal)", "2 (hébergé)", "Conteneur", "Émulateur"],
  "Il s'installe directement sur le serveur, à la place d'un OS.")
t.mcq("Qu'est-ce que KVM ?", ["Un module du noyau Linux qui en fait un hyperviseur", "Un émulateur de matériel", "Une interface web", "Un format de disque"],
  "KVM exécute le code du CPU invité directement sur le vrai processeur, grâce à VT-x/AMD-V.")
t.mcq("Quel est le rôle de QEMU quand il est utilisé avec KVM ?", ["Émuler le reste de la machine : disques, réseau, BIOS, écran", "Exécuter le CPU de la VM", "Gérer le cluster", "Stocker les sauvegardes"],
  "KVM s'occupe du CPU et de la mémoire, QEMU de tout le matériel autour.")
t.mcq("Sous Proxmox, une VM qui tourne correspond à…", ["Un processus QEMU sur l'hôte", "Un conteneur Docker", "Un service systemd par vCPU", "Un fichier dans /etc/pve"],
  "On le voit avec [[ps aux | grep kvm]]. Le tuer revient à débrancher la prise de la VM.")
t.mcq("Et chaque vCPU de cette VM correspond à…", ["Un thread du processus QEMU", "Un cœur physique réservé", "Un processus séparé", "Un socket"],
  "C'est l'ordonnanceur normal de Linux qui répartit ces threads sur les cœurs réels.")
t.mcq("Que se passe-t-il lors d'une « VM exit » ?", ["Le CPU arrête l'invité et rend la main à l'hyperviseur pour une action sensible", "La VM s'éteint", "La VM migre", "La VM est supprimée"],
  "L'hyperviseur traite la demande (accès disque, réseau…), puis relance l'invité (VM entry).")
t.mcq("Que sont les pilotes VirtIO ?", ["Des pilotes paravirtualisés, rapides, conçus pour les VM", "Des pilotes de cartes graphiques", "Un antivirus", "Le firmware UEFI"],
  "Émuler une vraie carte (e1000) coûte cher ; VirtIO dialogue directement avec l'hyperviseur.")
t.mcq("En paravirtualisation, l'OS invité…", ["Sait qu'il est virtualisé et dialogue avec l'hyperviseur", "Ne sait pas qu'il est virtualisé", "Tourne sans noyau", "Tourne sur une autre architecture"],
  "Aujourd'hui elle sert surtout aux pilotes d'E/S : VirtIO (KVM), VMXNET3 et PVSCSI (VMware).")
t.mcq("Pourquoi un conteneur LXC ne peut-il pas faire tourner Windows ?", ["Il partage le noyau Linux de l'hôte", "Il manque de RAM", "Il n'a pas de réseau", "Il n'a pas d'UEFI"],
  "Windows a besoin de son propre noyau : il lui faut une VM.")
t.mcq("Quelle est la méthode recommandée pour utiliser Docker sur Proxmox ?", ["L'installer dans une VM", "L'installer sur l'hôte Proxmox", "L'installer dans un LXC privilégié", "Ce n'est pas possible"],
  "Docker dans un LXC fonctionne, mais casse parfois lors des mises à jour.")
t.mcq("Que faut-il pour faire du PCI passthrough ?", ["Un CPU et une carte mère avec IOMMU (VT-d / AMD-Vi) activé", "Un SSD NVMe", "Un cluster de 3 nœuds", "Ceph"],
  "L'IOMMU permet de donner un périphérique physique en exclusivité à une VM.")
t.mcq("Une VM avec une carte graphique en passthrough peut-elle migrer à chaud ?", ["Non", "Oui, toujours", "Oui, avec Ceph", "Oui, avec la HA"],
  "Le périphérique est physiquement attaché à un serveur.")
t.mcq("Que fait le ballooning ?", ["Un pilote dans la VM rend à l'hôte la RAM qu'elle n'utilise pas", "Il compresse le disque", "Il ajoute des vCPU", "Il gonfle le cache ZFS"],
  "Sous Proxmox, on règle une mémoire minimale et une maximale.")
t.mcq("Que fait KSM ?", ["Il fusionne les pages mémoire identiques entre VM", "Il chiffre la RAM", "Il réserve la RAM", "Il gère le swap"],
  "Très efficace avec 10 VM Windows identiques, par exemple.")
t.mcq("Pourquoi 16 vCPU peuvent-ils rendre une VM plus lente qu'avec 2 ?", ["L'hyperviseur doit trouver beaucoup de cœurs libres en même temps", "Le BIOS ne gère que 8 vCPU", "La RAM est divisée par 16", "Les licences bloquent"],
  "Commencez petit (2 vCPU) et augmentez si la supervision le justifie.")
t.mcq("Pourquoi choisir un type de CPU générique (x86-64-v2-AES) plutôt que [[host]] dans un cluster ?", ["Pour pouvoir migrer à chaud entre des CPU de générations différentes", "Pour aller plus vite", "Pour économiser de la RAM", "Pour activer le TPM"],
  "[[host]] expose toutes les instructions du CPU réel, donc la VM ne peut migrer que vers un CPU identique. VMware a l'équivalent avec EVC.")
t.mcq("Que permet le QEMU Guest Agent ?", ["Un arrêt propre, l'IP visible dans l'interface et le gel du FS pendant les sauvegardes", "Le passthrough GPU", "La compression des disques", "Le chiffrement du réseau"],
  "À installer dans chaque VM ([[qemu-guest-agent]]) et à cocher dans les options.")
t.mcq("Quel firmware faut-il pour Windows 11 dans une VM ?", ["OVMF (UEFI), avec Secure Boot et un vTPM", "SeaBIOS", "Aucun", "Le BIOS de l'hôte"],
  "Sous Proxmox, on ajoute aussi un EFI disk et un TPM state.")
t.mcq("Quel type de machine choisir pour une VM moderne sous Proxmox ?", ["q35", "i440fx", "isapc", "virt"],
  "q35 est un chipset moderne avec PCIe natif. i440fx est l'ancien.")
t.mcq("L'installateur Windows ne trouve aucun disque dans une VM VirtIO. Que faire ?", ["Charger le pilote vioscsi depuis l'ISO virtio-win", "Passer en IDE définitivement", "Réinstaller Proxmox", "Ajouter de la RAM"],
  "Montez l'ISO virtio-win en second lecteur CD pendant l'installation.")
t.mcq("Que permet l'émulation pure (QEMU sans KVM) que la virtualisation ne permet pas ?", ["Exécuter une autre architecture (ARM sur x86)", "Aller plus vite", "Consommer moins de RAM", "Faire de la HA"],
  "Le prix à payer : c'est 10 à 100 fois plus lent.")

t.cmd("Vérifiez que le processeur supporte la virtualisation matérielle.", "egrep -c '(vmx|svm)' /proc/cpuinfo",
  (s) => (/vmx/.test(s) && /svm/.test(s) && s.includes('/proc/cpuinfo')) || /^lscpu( \| grep .*)?$/.test(s),
  "Le résultat doit être supérieur à 0. [[lscpu]] affiche aussi une ligne « Virtualization ».")
t.cmd("Affichez la commande QEMU complète que Proxmox génère pour la VM 100.", "qm showcmd 100",
  /^qm showcmd 100( --pretty( 1)?)?$/, "Très instructif : chaque réglage de l'interface y devient une option QEMU.")

export default t.list
