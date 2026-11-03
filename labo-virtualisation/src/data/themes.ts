import type { ThemeId } from '../types'

export const THEMES: { id: ThemeId; name: string; short: string }[] = [
  { id: 'mat', name: 'Matériel et unités', short: 'Matériel' },
  { id: 'os', name: "Système d'exploitation", short: 'OS' },
  { id: 'lin', name: 'Linux', short: 'Linux' },
  { id: 'sto', name: 'Stockage', short: 'Stockage' },
  { id: 'lvm', name: 'LVM, ZFS et Ceph', short: 'LVM/ZFS/Ceph' },
  { id: 'net', name: 'Réseau', short: 'Réseau' },
  { id: 'vnet', name: 'Réseau virtuel', short: 'Réseau virtuel' },
  { id: 'hyp', name: 'KVM, QEMU et hyperviseurs', short: 'Hyperviseurs' },
  { id: 'pve', name: 'Proxmox VE', short: 'Proxmox' },
  { id: 'clu', name: 'Cluster, HA et sauvegarde', short: 'Cluster/HA' },
  { id: 'vmw', name: 'VMware vSphere', short: 'VMware' },
]

export const THEME_NAME = Object.fromEntries(THEMES.map((t) => [t.id, t.name])) as Record<
  ThemeId,
  string
>
