import { BANK, BANK_BY_ID } from '../data/questions'
import { THEMES } from '../data/themes'
import { GENERATOR_BY_ID, GENERATORS } from '../generators'
import { BOSS_QUESTIONS } from './game'
import { pick, shuffle, type Rng } from '../generators/random'
import type { Family, Item, Question, SessionConfig, ThemeId } from '../types'

export const ALL_THEMES: ThemeId[] = THEMES.map((t) => t.id)
export const ALL_FAMILIES: Family[] = ['mcq', 'cmd', 'order', 'calc']

export function itemKey(item: Item): string {
  return `${item.src}:${item.id}`
}

export function keyToItem(key: string): Item | null {
  const [src, ...rest] = key.split(':')
  const id = rest.join(':')
  if (src === 'bank' && BANK_BY_ID.has(id)) return { src, id }
  if (src === 'gen' && GENERATOR_BY_ID.has(id)) return { src, id }
  return null
}

export function materialize(item: Item, rng: Rng = Math.random): Question {
  if (item.src === 'gen') {
    const gen = GENERATOR_BY_ID.get(item.id)
    if (!gen) throw new Error(`Générateur inconnu : ${item.id}`)
    return gen.make(rng)
  }
  const q = BANK_BY_ID.get(item.id)
  if (!q) throw new Error(`Question inconnue : ${item.id}`)
  return q
}

export function countAvailable(themes: ThemeId[], families: Family[]): { bank: number; calc: boolean } {
  const bank = BANK.filter((q) => themes.includes(q.theme) && families.includes(q.kind === 'num' || q.kind === 'text' ? 'calc' : q.kind)).length
  const calc = families.includes('calc') && GENERATORS.some((g) => themes.includes(g.theme))
  return { bank, calc }
}

/**
 * Tire une série de questions : la banque sans doublon, plus des calculs générés
 * (environ un quart de la série, ou toute la série si seuls les calculs sont demandés).
 */
export function buildItems(themes: ThemeId[], families: Family[], count: number, rng: Rng = Math.random): Item[] {
  const bank = shuffle(
    rng,
    BANK.filter((q) => themes.includes(q.theme) && q.kind !== 'num' && q.kind !== 'text' && families.includes(q.kind)),
  )
  const gens = families.includes('calc') ? GENERATORS.filter((g) => themes.includes(g.theme)) : []
  const genShare = bank.length === 0 ? 1 : families.length === 1 ? 1 : 0.25
  const items: Item[] = []
  while (items.length < count) {
    const useGen = gens.length > 0 && (bank.length === 0 || rng() < genShare)
    if (useGen) items.push({ src: 'gen', id: pick(rng, gens).id })
    else {
      const next = bank.pop()
      if (!next) break
      items.push({ src: 'bank', id: next.id })
    }
  }
  return items
}

export function customSession(themes: ThemeId[], families: Family[], count: number): SessionConfig {
  return { mode: 'custom', title: 'Session sur mesure', items: buildItems(themes, families, count) }
}

export function themeSession(theme: ThemeId): SessionConfig {
  const name = THEMES.find((t) => t.id === theme)?.name ?? theme
  return { mode: 'custom', title: name, items: buildItems([theme], ALL_FAMILIES, 10) }
}

export function bossSession(theme: ThemeId): SessionConfig {
  const name = THEMES.find((t) => t.id === theme)?.name ?? theme
  return { mode: 'boss', title: `Épreuve · ${name}`, items: buildItems([theme], ALL_FAMILIES, BOSS_QUESTIONS), chapter: theme }
}

export function examSession(): SessionConfig {
  return { mode: 'exam', title: 'Examen blanc', items: buildItems(ALL_THEMES, ALL_FAMILIES, 30), exam: true, minutes: 30 }
}

export function terminalSession(): SessionConfig {
  return { mode: 'terminal', title: 'Terminal', items: buildItems(ALL_THEMES, ['cmd'], 15) }
}

export function orderSession(): SessionConfig {
  return { mode: 'order', title: 'Remettre dans l’ordre', items: buildItems(ALL_THEMES, ['order'], 50) }
}

export function calcSession(): SessionConfig {
  return { mode: 'calc', title: 'Calculs réseau et stockage', items: [randomGenItem()], endless: true }
}

export function randomGenItem(rng: Rng = Math.random): Item {
  return { src: 'gen', id: pick(rng, GENERATORS).id }
}

export function reviewSession(errors: string[], rng: Rng = Math.random): SessionConfig {
  const items = shuffle(rng, errors.map(keyToItem).filter((i): i is Item => i !== null))
  return { mode: 'review', title: 'Revoir mes erreurs', items }
}

/** Texte de la bonne réponse, pour la correction. */
export function solutionText(q: Question): string {
  switch (q.kind) {
    case 'mcq':
      return q.options[q.answer]
    case 'cmd':
      return q.solution
    case 'order':
      return q.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
    case 'num':
      return `${q.answer.toLocaleString('fr-FR')}${q.unit ? ` ${q.unit}` : ''}`
    case 'text':
      return q.answers[0]
  }
}
