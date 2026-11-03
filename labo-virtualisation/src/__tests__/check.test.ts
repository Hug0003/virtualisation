import { describe, expect, it } from 'vitest'
import { BANK } from '../data/questions'
import { checkNumber, checkText, normalizeCmd, parseNumber } from '../lib/check'
import type { Cmd } from '../types'

const cmds = BANK.filter((q): q is Cmd & { id: string } => q.kind === 'cmd')

function accepts(fragment: string, input: string): boolean {
  const q = cmds.find((c) => c.q.includes(fragment))
  if (!q) throw new Error(`Question introuvable : ${fragment}`)
  return q.accept(normalizeCmd(input))
}

describe('normalisation', () => {
  it('nettoie espaces, sudo et point-virgule', () => {
    expect(normalizeCmd('  sudo   qm   list ; ')).toBe('qm list')
  })

  it('lit les nombres à la française', () => {
    expect(parseNumber('1 250 Mo/s')).toBe(1250)
    expect(parseNumber('1,5')).toBe(1.5)
    expect(parseNumber('abc')).toBeNull()
  })

  it('compare nombres et textes', () => {
    expect(checkNumber('62', 62, 0)).toBe(true)
    expect(checkNumber('63', 62, 0)).toBe(false)
    expect(checkText(' 192.168.1.0 ', ['192.168.1.0'])).toBe(true)
    expect(checkText('', ['x'])).toBe(false)
  })
})

describe('commandes', () => {
  it('chaque solution officielle est acceptée', () => {
    for (const q of cmds) {
      expect(q.accept(normalizeCmd(q.solution)), q.solution).toBe(true)
    }
  })

  it('accepte les variantes prévues', () => {
    expect(accepts('interfaces réseau avec leurs adresses', 'ip addr show')).toBe(true)
    expect(accepts('Installez le logiciel', 'sudo apt-get install -y htop')).toBe(true)
    expect(accepts('volume logique de 50 Go', 'lvcreate -n lv_vm -L 50G vg_data')).toBe(true)
    expect(accepts('Migrez à chaud', 'qm migrate 100 pve2 --online --with-local-disks')).toBe(true)
    expect(accepts('Mettez Proxmox à jour', 'apt update && apt dist-upgrade')).toBe(true)
    expect(accepts('services qui écoutent', 'ss -tulpn')).toBe(true)
  })

  it('refuse les mauvaises commandes', () => {
    expect(accepts('Démarrez la VM 100', 'qm start 101')).toBe(false)
    expect(accepts('Migrez à chaud', 'qm migrate 100 pve2')).toBe(false)
    expect(accepts('Mettez Proxmox à jour', 'apt update && apt upgrade')).toBe(false)
    expect(accepts('volume logique de 50 Go', 'lvcreate -L 50G vg_data')).toBe(false)
  })
})
