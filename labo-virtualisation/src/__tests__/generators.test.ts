import { describe, expect, it } from 'vitest'
import { GENERATORS } from '../generators'
import { cidrFromMask, intToIp, ipToInt, sameNetwork, subnetInfo } from '../generators/ip'
import { checkNumber, checkText } from '../lib/check'

/** Générateur pseudo-aléatoire déterministe (mulberry32) pour des tests reproductibles. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('calculs IP', () => {
  it('convertit les adresses dans les deux sens', () => {
    expect(ipToInt('192.168.1.1')).toBe(3232235777)
    expect(intToIp(3232235777)).toBe('192.168.1.1')
    expect(intToIp(ipToInt('255.255.255.255'))).toBe('255.255.255.255')
  })

  it('calcule un /24', () => {
    expect(subnetInfo('192.168.1.25', 24)).toEqual({
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      mask: '255.255.255.0',
      first: '192.168.1.1',
      last: '192.168.1.254',
      size: 256,
      hosts: 254,
    })
  })

  it('calcule un /26 au milieu du bloc', () => {
    const s = subnetInfo('192.168.1.70', 26)
    expect(s.network).toBe('192.168.1.64')
    expect(s.broadcast).toBe('192.168.1.127')
    expect(s.mask).toBe('255.255.255.192')
    expect(s.hosts).toBe(62)
  })

  it('calcule un /20 qui déborde sur le troisième octet', () => {
    const s = subnetInfo('10.20.37.4', 20)
    expect(s.network).toBe('10.20.32.0')
    expect(s.broadcast).toBe('10.20.47.255')
    expect(s.hosts).toBe(4094)
  })

  it('reconnaît deux machines du même réseau', () => {
    expect(sameNetwork('192.168.1.10', '192.168.1.200', 24)).toBe(true)
    expect(sameNetwork('192.168.1.40', '192.168.2.40', 24)).toBe(false)
    expect(sameNetwork('192.168.1.10', '192.168.1.70', 26)).toBe(false)
  })

  it('retrouve le CIDR depuis un masque', () => {
    expect(cidrFromMask('255.255.255.0')).toBe(24)
    expect(cidrFromMask('255.255.240.0')).toBe(20)
  })
})

describe('générateurs', () => {
  it('produisent des questions complètes et cohérentes', () => {
    for (const gen of GENERATORS) {
      const rng = seeded(42)
      for (let i = 0; i < 200; i++) {
        const q = gen.make(rng)
        expect(q.theme).toBe(gen.theme)
        expect(q.q.length).toBeGreaterThan(10)
        expect(q.explain.length).toBeGreaterThan(10)
        if (q.kind === 'num') {
          expect(Number.isFinite(q.answer)).toBe(true)
          expect(q.answer).toBeGreaterThanOrEqual(0)
          expect(checkNumber(String(q.answer), q.answer, q.tolerance)).toBe(true)
        }
        if (q.kind === 'text') {
          expect(checkText(q.answers[0], q.answers)).toBe(true)
        }
        if (q.kind === 'mcq') {
          expect(q.answer).toBeLessThan(q.options.length)
        }
      }
    }
  })

  it('le générateur de sous-réseau donne une réponse vérifiée par le calcul', () => {
    const rng = seeded(7)
    const subnet = GENERATORS.find((g) => g.id === 'subnet')!
    for (let i = 0; i < 100; i++) {
      const q = subnet.make(rng)
      const [, ip, cidr] = q.q.match(/\[\[(\d+\.\d+\.\d+\.\d+)\/(\d+)\]\]/)!
      const s = subnetInfo(ip, Number(cidr))
      if (q.kind === 'num') expect(q.answer).toBe(s.hosts)
      else if (q.kind === 'text') expect([s.network, s.broadcast, s.first, s.last]).toContain(q.answers[0])
    }
  })
})
