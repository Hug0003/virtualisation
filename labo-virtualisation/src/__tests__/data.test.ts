import { describe, expect, it } from 'vitest'
import { BANK } from '../data/questions'
import { GLOSSARY } from '../data/glossary'
import { THEMES } from '../data/themes'
import { buildItems, keyToItem, materialize, ALL_FAMILIES, ALL_THEMES } from '../lib/session'
import { recordAnswer, emptyProgress } from '../lib/storage'

describe('banque de questions', () => {
  it('a des identifiants uniques', () => {
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length)
  })

  it('couvre chaque thème', () => {
    for (const t of THEMES) {
      expect(BANK.filter((q) => q.theme === t.id).length, t.id).toBeGreaterThanOrEqual(10)
    }
  })

  it('a des questions bien formées', () => {
    for (const q of BANK) {
      expect(q.q.trim().length, q.id).toBeGreaterThan(5)
      expect(q.explain.trim().length, q.id).toBeGreaterThan(10)
      if (q.kind === 'mcq') {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(2)
        expect(new Set(q.options).size, `${q.id} : options en double`).toBe(q.options.length)
        expect(q.answer).toBeLessThan(q.options.length)
      }
      if (q.kind === 'order') {
        expect(q.steps.length, q.id).toBeGreaterThanOrEqual(3)
        expect(new Set(q.steps).size, `${q.id} : étapes en double`).toBe(q.steps.length)
      }
    }
  })

  it('a des termes de glossaire uniques', () => {
    expect(new Set(GLOSSARY.map((t) => t.term)).size).toBe(GLOSSARY.length)
  })
})

describe('sessions', () => {
  it('construit une série sans doublon de la banque', () => {
    const items = buildItems(ALL_THEMES, ALL_FAMILIES, 40)
    expect(items).toHaveLength(40)
    const bankIds = items.filter((i) => i.src === 'bank').map((i) => i.id)
    expect(new Set(bankIds).size).toBe(bankIds.length)
    for (const item of items) expect(() => materialize(item)).not.toThrow()
  })

  it('ne garde que les commandes en mode terminal', () => {
    const items = buildItems(ALL_THEMES, ['cmd'], 15)
    expect(items.length).toBe(15)
    expect(items.every((i) => i.src === 'bank' && materialize(i).kind === 'cmd')).toBe(true)
  })

  it('ne produit que des calculs si seuls les calculs sont demandés', () => {
    const items = buildItems(['net'], ['calc'], 10)
    expect(items).toHaveLength(10)
    expect(items.every((i) => i.src === 'gen')).toBe(true)
  })

  it('retrouve une question depuis sa clé', () => {
    expect(keyToItem(`bank:${BANK[0].id}`)).toEqual({ src: 'bank', id: BANK[0].id })
    expect(keyToItem('gen:subnet')).toEqual({ src: 'gen', id: 'subnet' })
    expect(keyToItem('bank:inexistante')).toBeNull()
  })

  it('met à jour la progression et la liste des erreurs', () => {
    let p = recordAnswer(emptyProgress(), 'net', 'gen:subnet', false)
    expect(p.errors).toEqual(['gen:subnet'])
    p = recordAnswer(p, 'net', 'gen:subnet', true)
    expect(p.errors).toEqual([])
    expect(p.stats.net).toEqual({ ok: 1, n: 2 })
    expect(p.answered).toBe(2)
  })
})
