import type { ThemeId } from '../types'

export interface Progress {
  stats: Partial<Record<ThemeId, { ok: number; n: number }>>
  /** Clés des questions ratées : « bank:<id> » ou « gen:<id> ». */
  errors: string[]
  answered: number
  known: string[]
}

const KEY = 'labo-virtualisation:v1'

export function emptyProgress(): Progress {
  return { stats: {}, errors: [], answered: 0, known: [] }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    return { ...emptyProgress(), ...(JSON.parse(raw) as Partial<Progress>) }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // Stockage indisponible (navigation privée) : la progression reste en mémoire.
  }
}

export function recordAnswer(p: Progress, theme: ThemeId, key: string, correct: boolean): Progress {
  const prev = p.stats[theme] ?? { ok: 0, n: 0 }
  const errors = p.errors.filter((e) => e !== key)
  if (!correct) errors.push(key)
  return {
    ...p,
    answered: p.answered + 1,
    stats: { ...p.stats, [theme]: { ok: prev.ok + (correct ? 1 : 0), n: prev.n + 1 } },
    errors,
  }
}
