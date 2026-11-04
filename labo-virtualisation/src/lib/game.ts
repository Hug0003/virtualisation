import { COURSE } from '../data/course'
import type { ThemeId } from '../types'
import type { Progress } from './storage'

export const XP = {
  /** Leçon terminée pour la première fois. */
  lesson: 30,
  /** Mini-question de leçon réussie du premier coup (première fois seulement). */
  check: 5,
  /** Bonne réponse dans n'importe quel mode d'entraînement. */
  answer: 2,
  /** Première épreuve de chapitre réussie. */
  bossPass: 30,
  /** Chaque nouvelle étoile gagnée sur une épreuve. */
  star: 40,
} as const

export const BOSS_QUESTIONS = 10
/** Taux de réussite minimal pour valider un chapitre. */
export const PASS_RATIO = 0.7

export const LEVELS = [
  { min: 0, name: 'Stagiaire' },
  { min: 100, name: 'Technicien support' },
  { min: 300, name: 'Technicien systèmes' },
  { min: 600, name: 'Admin junior' },
  { min: 1000, name: 'Administrateur système' },
  { min: 1600, name: 'Ingénieur virtualisation' },
  { min: 2400, name: 'Architecte infrastructure' },
  { min: 3500, name: 'Gourou du datacenter' },
]

export interface LevelInfo {
  /** Numéro affiché, à partir de 1. */
  level: number
  name: string
  min: number
  /** XP du niveau suivant, ou null au niveau maximal. */
  next: number | null
  /** Avancement vers le niveau suivant, de 0 à 1. */
  ratio: number
}

export function levelOf(xp: number): LevelInfo {
  let i = 0
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++
  const cur = LEVELS[i]
  const next = LEVELS[i + 1]?.min ?? null
  const ratio = next === null ? 1 : (xp - cur.min) / (next - cur.min)
  return { level: i + 1, name: cur.name, min: cur.min, next, ratio }
}

export function starsFor(ratio: number): number {
  if (ratio >= 1) return 3
  if (ratio >= 0.85) return 2
  if (ratio >= PASS_RATIO) return 1
  return 0
}

/** Date locale au format AAAA-MM-JJ. */
export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function previousDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d - 1))
}

/** Met à jour la série de jours d'activité consécutifs. */
export function touchStreak(streak: Progress['course']['streak'], today: string = dayKey()): Progress['course']['streak'] {
  if (streak.day === today) return streak
  const count = streak.day === previousDay(today) ? streak.count + 1 : 1
  return { day: today, count, best: Math.max(streak.best, count) }
}

/** Série affichée : elle tombe à 0 si le dernier jour actif date d'avant-hier ou plus. */
export function currentStreak(streak: Progress['course']['streak'], today: string = dayKey()): number {
  return streak.day === today || streak.day === previousDay(today) ? streak.count : 0
}

export function addXp(p: Progress, amount: number, today: string = dayKey()): Progress {
  if (amount <= 0) return p
  return { ...p, course: { ...p.course, xp: p.course.xp + amount, streak: touchStreak(p.course.streak, today) } }
}

export function completeLesson(p: Progress, lessonId: string, checksFirstTry: number): Progress {
  if (p.course.lessons.includes(lessonId)) return addXp(p, 0)
  const withLesson = { ...p, course: { ...p.course, lessons: [...p.course.lessons, lessonId] } }
  return addXp(withLesson, XP.lesson + XP.check * checksFirstTry)
}

/** Enregistre le résultat d'une épreuve et donne l'XP des nouvelles étoiles. */
export function recordBoss(p: Progress, chapter: ThemeId, ratio: number): { progress: Progress; gained: number } {
  const best = p.course.boss[chapter] ?? 0
  const oldStars = starsFor(best)
  const newStars = starsFor(ratio)
  let gained = 0
  if (newStars > oldStars) gained += XP.star * (newStars - oldStars)
  if (oldStars === 0 && newStars > 0) gained += XP.bossPass
  const withBoss = { ...p, course: { ...p.course, boss: { ...p.course.boss, [chapter]: Math.max(best, ratio) } } }
  return { progress: addXp(withBoss, gained), gained }
}

export type ChapterState = 'locked' | 'open' | 'done'

export function chapterState(p: Progress, index: number): ChapterState {
  const ch = COURSE[index]
  if (starsFor(p.course.boss[ch.id] ?? 0) > 0) return 'done'
  if (index === 0) return 'open'
  return starsFor(p.course.boss[COURSE[index - 1].id] ?? 0) > 0 ? 'open' : 'locked'
}

export function lessonsDone(p: Progress, chapterIndex: number): number {
  return COURSE[chapterIndex].lessons.filter((l) => p.course.lessons.includes(l.id)).length
}

/** Prochaine leçon à suivre dans tout le parcours, ou null si tout est fait. */
export function nextLesson(p: Progress): { chapter: number; lesson: number } | null {
  for (let c = 0; c < COURSE.length; c++) {
    if (chapterState(p, c) === 'locked') return null
    const l = COURSE[c].lessons.findIndex((x) => !p.course.lessons.includes(x.id))
    if (l !== -1) return { chapter: c, lesson: l }
    if (chapterState(p, c) !== 'done') return null
  }
  return null
}

export interface Badge {
  id: string
  name: string
  desc: string
  earned: (p: Progress) => boolean
}

const totalStars = (p: Progress) => COURSE.reduce((s, ch) => s + starsFor(p.course.boss[ch.id] ?? 0), 0)

export const BADGES: Badge[] = [
  { id: 'first-lesson', name: 'Premier boot', desc: 'Terminer une première leçon.', earned: (p) => p.course.lessons.length >= 1 },
  { id: 'first-chapter', name: 'Chapitre validé', desc: 'Réussir une première épreuve de chapitre.', earned: (p) => totalStars(p) >= 1 },
  { id: 'perfect', name: 'Sans faute', desc: 'Obtenir 3 étoiles à une épreuve.', earned: (p) => Object.values(p.course.boss).some((r) => (r ?? 0) >= 1) },
  { id: 'half', name: 'Mi-parcours', desc: 'Valider la moitié des chapitres.', earned: (p) => COURSE.filter((ch) => starsFor(p.course.boss[ch.id] ?? 0) > 0).length >= Math.ceil(COURSE.length / 2) },
  { id: 'all', name: 'Diplômé du labo', desc: 'Valider tous les chapitres.', earned: (p) => COURSE.every((ch) => starsFor(p.course.boss[ch.id] ?? 0) > 0) },
  { id: 'stars', name: 'Constellation', desc: 'Réunir 20 étoiles.', earned: (p) => totalStars(p) >= 20 },
  { id: 'streak3', name: 'En rythme', desc: 'Être actif 3 jours de suite.', earned: (p) => p.course.streak.best >= 3 },
  { id: 'streak7', name: 'Semaine complète', desc: 'Être actif 7 jours de suite.', earned: (p) => p.course.streak.best >= 7 },
  { id: 'answers100', name: 'Centurion', desc: 'Répondre à 100 questions d’entraînement.', earned: (p) => p.answered >= 100 },
  { id: 'answers500', name: 'Marathonien', desc: 'Répondre à 500 questions d’entraînement.', earned: (p) => p.answered >= 500 },
  { id: 'flash', name: 'Vocabulaire solide', desc: 'Marquer 30 termes comme connus en flashcards.', earned: (p) => p.known.length >= 30 },
  { id: 'xp1000', name: 'Mille XP', desc: 'Atteindre 1 000 XP.', earned: (p) => p.course.xp >= 1000 },
]

export function earnedBadges(p: Progress): string[] {
  return BADGES.filter((b) => b.earned(p)).map((b) => b.id)
}
