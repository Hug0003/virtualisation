import { describe, expect, it } from 'vitest'
import { COURSE } from '../data/course'
import { BANK } from '../data/questions'
import { THEMES } from '../data/themes'
import {
  BOSS_QUESTIONS,
  LEVELS,
  XP,
  chapterState,
  completeLesson,
  currentStreak,
  levelOf,
  nextLesson,
  recordBoss,
  starsFor,
  touchStreak,
} from '../lib/game'
import { emptyProgress } from '../lib/storage'

describe('contenu du cours', () => {
  it('a un chapitre par thème, sans doublon', () => {
    expect(COURSE.map((c) => c.id).sort()).toEqual(THEMES.map((t) => t.id).sort())
  })

  it('a des leçons aux identifiants uniques', () => {
    const ids = COURSE.flatMap((c) => c.lessons.map((l) => l.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('a des leçons bien formées', () => {
    for (const ch of COURSE) {
      expect(ch.lessons.length, ch.id).toBeGreaterThanOrEqual(2)
      for (const l of ch.lessons) {
        expect(l.steps.some((s) => s.kind === 'read'), l.id).toBe(true)
        expect(l.steps.some((s) => s.kind === 'check'), l.id).toBe(true)
        expect(l.steps.at(-1)?.kind, `${l.id} : une leçon se termine par une question`).toBe('check')
        for (const s of l.steps) {
          if (s.kind === 'read') expect(s.blocks.length, `${l.id} : ${s.title}`).toBeGreaterThan(0)
          else {
            expect(s.check.options.length, s.check.q).toBeGreaterThanOrEqual(3)
            expect(new Set(s.check.options).size, `${s.check.q} : options en double`).toBe(s.check.options.length)
            expect(s.check.explain.length, s.check.q).toBeGreaterThan(10)
          }
        }
      }
    }
  })

  it('a des tableaux réguliers', () => {
    for (const l of COURSE.flatMap((c) => c.lessons)) {
      for (const s of l.steps) {
        if (s.kind !== 'read') continue
        for (const b of s.blocks) if (b.t === 'table') for (const row of b.rows) expect(row.length, `${l.id} : ${s.title}`).toBe(b.head.length)
      }
    }
  })

  it('a assez de questions en banque pour chaque épreuve', () => {
    for (const ch of COURSE) expect(BANK.filter((q) => q.theme === ch.id).length, ch.id).toBeGreaterThanOrEqual(BOSS_QUESTIONS)
  })
})

describe('niveaux et étoiles', () => {
  it('calcule le niveau à partir de l’XP', () => {
    expect(levelOf(0)).toMatchObject({ level: 1, next: 100, ratio: 0 })
    expect(levelOf(150)).toMatchObject({ level: 2, min: 100, next: 300, ratio: 0.25 })
    expect(levelOf(99_999)).toMatchObject({ level: LEVELS.length, next: null, ratio: 1 })
  })

  it('donne les étoiles selon le score', () => {
    expect(starsFor(0.6)).toBe(0)
    expect(starsFor(0.7)).toBe(1)
    expect(starsFor(0.9)).toBe(2)
    expect(starsFor(1)).toBe(3)
  })
})

describe('série de jours', () => {
  const empty = { day: '', count: 0, best: 0 }

  it('démarre, continue et repart à 1 après un trou', () => {
    const d1 = touchStreak(empty, '2026-11-03')
    expect(d1).toEqual({ day: '2026-11-03', count: 1, best: 1 })
    expect(touchStreak(d1, '2026-11-03')).toBe(d1)
    const d2 = touchStreak(d1, '2026-11-04')
    expect(d2).toEqual({ day: '2026-11-04', count: 2, best: 2 })
    expect(touchStreak(d2, '2026-11-07')).toEqual({ day: '2026-11-07', count: 1, best: 2 })
  })

  it('passe les changements de mois', () => {
    expect(touchStreak({ day: '2026-10-31', count: 4, best: 4 }, '2026-11-01').count).toBe(5)
  })

  it('affiche 0 si la série est rompue', () => {
    expect(currentStreak({ day: '2026-11-01', count: 5, best: 5 }, '2026-11-04')).toBe(0)
    expect(currentStreak({ day: '2026-11-03', count: 5, best: 5 }, '2026-11-04')).toBe(5)
  })
})

describe('progression dans le parcours', () => {
  it('donne l’XP d’une leçon une seule fois', () => {
    const once = completeLesson(emptyProgress(), 'mat-1', 2)
    expect(once.course.xp).toBe(XP.lesson + 2 * XP.check)
    expect(completeLesson(once, 'mat-1', 2).course.xp).toBe(once.course.xp)
  })

  it('débloque le chapitre suivant quand l’épreuve est réussie', () => {
    let p = emptyProgress()
    expect(chapterState(p, 0)).toBe('open')
    expect(chapterState(p, 1)).toBe('locked')
    p = recordBoss(p, COURSE[0].id, 0.5).progress
    expect(chapterState(p, 1)).toBe('locked')
    p = recordBoss(p, COURSE[0].id, 0.8).progress
    expect(chapterState(p, 0)).toBe('done')
    expect(chapterState(p, 1)).toBe('open')
  })

  it('ne paie que les nouvelles étoiles', () => {
    const first = recordBoss(emptyProgress(), 'mat', 0.8)
    expect(first.gained).toBe(XP.bossPass + XP.star)
    const again = recordBoss(first.progress, 'mat', 0.8)
    expect(again.gained).toBe(0)
    const better = recordBoss(again.progress, 'mat', 1)
    expect(better.gained).toBe(2 * XP.star)
    expect(recordBoss(better.progress, 'mat', 0.5).progress.course.boss.mat).toBe(1)
  })

  it('propose la prochaine leçon', () => {
    let p = emptyProgress()
    expect(nextLesson(p)).toEqual({ chapter: 0, lesson: 0 })
    for (const l of COURSE[0].lessons) p = completeLesson(p, l.id, 0)
    // Toutes les leçons du chapitre 1 sont faites, mais l'épreuve n'est pas passée.
    expect(nextLesson(p)).toBeNull()
    p = recordBoss(p, COURSE[0].id, 1).progress
    expect(nextLesson(p)).toEqual({ chapter: 1, lesson: 0 })
  })
})
