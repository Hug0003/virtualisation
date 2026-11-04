import type { ThemeId } from '../types'

export interface CourseProgress {
  xp: number
  /** Identifiants des leçons terminées. */
  lessons: string[]
  /** Meilleur taux de réussite à l'épreuve de chaque chapitre, de 0 à 1. */
  boss: Partial<Record<ThemeId, number>>
  /** Jours d'activité consécutifs : dernier jour actif (AAAA-MM-JJ), série en cours, record. */
  streak: { day: string; count: number; best: number }
}

export interface Progress {
  stats: Partial<Record<ThemeId, { ok: number; n: number }>>
  /** Clés des questions ratées : « bank:<id> » ou « gen:<id> ». */
  errors: string[]
  answered: number
  known: string[]
  course: CourseProgress
}

const KEY = 'labo-virtualisation:v1'

export function emptyCourse(): CourseProgress {
  return { xp: 0, lessons: [], boss: {}, streak: { day: '', count: 0, best: 0 } }
}

export function emptyProgress(): Progress {
  return { stats: {}, errors: [], answered: 0, known: [], course: emptyCourse() }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const saved = JSON.parse(raw) as Partial<Progress>
    // Les progressions enregistrées avant l'ajout du cours n'ont pas de champ « course ».
    return { ...emptyProgress(), ...saved, course: { ...emptyCourse(), ...saved.course } }
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
