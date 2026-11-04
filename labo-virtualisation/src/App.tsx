import { useCallback, useEffect, useRef, useState } from 'react'
import ChapterView from './components/ChapterView'
import CourseMap from './components/CourseMap'
import Flashcards from './components/Flashcards'
import Home from './components/Home'
import LessonView from './components/LessonView'
import SessionView from './components/SessionView'
import Toasts, { type Toast } from './components/Toasts'
import { COURSE } from './data/course'
import { BADGES, XP, addXp, completeLesson, currentStreak, earnedBadges, levelOf, recordBoss } from './lib/game'
import { bossSession, themeSession } from './lib/session'
import { emptyProgress, loadProgress, recordAnswer, saveProgress } from './lib/storage'
import type { Answered, SessionConfig, ThemeId } from './types'

type View =
  | { name: 'home' }
  | { name: 'flash' }
  | { name: 'course' }
  | { name: 'chapter'; index: number }
  | { name: 'lesson'; chapter: number; lesson: number; run: number }
  | { name: 'session'; config: SessionConfig; rebuild: () => SessionConfig; run: number; back: View }

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [view, setView] = useState<View>({ name: 'course' })
  const [toasts, setToasts] = useState<Toast[]>([])
  const seen = useRef({ level: levelOf(progress.course.xp).level, badges: earnedBadges(progress) })

  const progressRef = useRef(progress)

  useEffect(() => {
    progressRef.current = progress
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  const toast = useCallback((title: string, text: string) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, title, text }])
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4500)
  }, [])

  // Annonce les niveaux et les badges gagnés, quelle que soit l'action qui les a débloqués.
  // Les notifications sont un effet de bord voulu du changement de progression.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    const level = levelOf(progress.course.xp)
    if (level.level > seen.current.level) toast(`Niveau ${level.level} atteint`, level.name)
    const badges = earnedBadges(progress)
    for (const id of badges) {
      if (seen.current.badges.includes(id)) continue
      const badge = BADGES.find((b) => b.id === id)
      if (badge) toast(`Badge obtenu : ${badge.name}`, badge.desc)
    }
    seen.current = { level: Math.max(level.level, seen.current.level), badges }
  }, [progress, toast])
  /* oxlint-enable react/set-state-in-effect */

  function record(theme: ThemeId, key: string, correct: boolean) {
    setProgress((p) => {
      const next = recordAnswer(p, theme, key, correct)
      return correct ? addXp(next, XP.answer) : next
    })
  }

  function markTerm(term: string, known: boolean) {
    setProgress((p) => ({ ...p, known: known ? [...new Set([...p.known, term])] : p.known.filter((t) => t !== term) }))
  }

  function startSession(build: () => SessionConfig, back: View) {
    setView({ name: 'session', config: build(), rebuild: build, run: Date.now(), back })
  }

  function openLesson(chapter: number, lesson: number) {
    setView({ name: 'lesson', chapter, lesson, run: Date.now() })
  }

  function startBoss(chapter: number) {
    const id = COURSE[chapter].id
    startSession(() => bossSession(id), { name: 'chapter', index: chapter })
  }

  const finishLesson = useCallback(
    (lessonId: string, firstTry: number, wasDone: boolean) => {
      setProgress((p) => completeLesson(p, lessonId, firstTry))
      if (!wasDone) toast(`+${XP.lesson + XP.check * firstTry} XP`, 'Leçon validée')
    },
    [toast],
  )

  const finishBoss = useCallback(
    (chapter: ThemeId, answered: Answered[], total: number) => {
      const ratio = total ? answered.filter((a) => a.correct).length / total : 0
      // Calculé hors de setProgress pour connaître l'XP gagnée tout de suite. Les réponses de l'épreuve
      // sont déjà enregistrées : progressRef reflète le dernier rendu.
      const res = recordBoss(progressRef.current, chapter, ratio)
      setProgress(res.progress)
      if (res.gained > 0) toast(`+${res.gained} XP`, 'Nouvelles étoiles sur l’épreuve')
    },
    [toast],
  )

  const lvl = levelOf(progress.course.xp)
  const streak = currentStreak(progress.course.streak)
  const inCourse = view.name === 'course' || view.name === 'chapter' || view.name === 'lesson' || (view.name === 'session' && view.config.mode === 'boss')

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setView({ name: 'course' })}>
          <span className="leds" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Labo Virtualisation</span>
        </button>
        <nav className="nav" aria-label="Sections">
          <button type="button" className="nav-link" aria-current={inCourse ? 'page' : undefined} onClick={() => setView({ name: 'course' })}>
            Cours
          </button>
          <button type="button" className="nav-link" aria-current={inCourse ? undefined : 'page'} onClick={() => setView({ name: 'home' })}>
            Entraînement
          </button>
        </nav>
        <span className="player-chip mono tnum" title={`${lvl.name} · série de ${streak} jour${streak > 1 ? 's' : ''}`}>
          Niv. {lvl.level} · {progress.course.xp} XP
          {streak > 0 && <span className="chip-streak"> · {streak} j</span>}
        </span>
      </header>

      <main className="main">
        {view.name === 'course' && (
          <CourseMap progress={progress} onChapter={(index) => setView({ name: 'chapter', index })} onLesson={openLesson} />
        )}
        {view.name === 'chapter' && (
          <ChapterView
            index={view.index}
            progress={progress}
            onLesson={(lesson) => openLesson(view.index, lesson)}
            onBoss={() => startBoss(view.index)}
            onPractice={() => startSession(() => themeSession(COURSE[view.index].id), view)}
            onBack={() => setView({ name: 'course' })}
          />
        )}
        {view.name === 'lesson' && (
          <LessonView
            key={view.run}
            chapter={COURSE[view.chapter]}
            chapterNumber={view.chapter + 1}
            lessonIndex={view.lesson}
            alreadyDone={progress.course.lessons.includes(COURSE[view.chapter].lessons[view.lesson].id)}
            onComplete={(firstTry) => {
              const id = COURSE[view.chapter].lessons[view.lesson].id
              finishLesson(id, firstTry, progress.course.lessons.includes(id))
            }}
            onNext={() => openLesson(view.chapter, view.lesson + 1)}
            onBoss={() => startBoss(view.chapter)}
            onExit={() => setView({ name: 'chapter', index: view.chapter })}
          />
        )}
        {view.name === 'home' && (
          <Home
            progress={progress}
            onStart={(config, rebuild) => setView({ name: 'session', config, rebuild, run: Date.now(), back: { name: 'home' } })}
            onFlashcards={() => setView({ name: 'flash' })}
            onReset={() => setProgress(emptyProgress())}
          />
        )}
        {view.name === 'session' && (
          <SessionView
            key={view.run}
            config={view.config}
            onRecord={record}
            onExit={() => setView(view.back)}
            onRestart={() => setView({ ...view, config: view.rebuild(), run: Date.now() })}
            onFinish={view.config.chapter ? (answered, total) => finishBoss(view.config.chapter as ThemeId, answered, total) : undefined}
            exitLabel={view.back.name === 'chapter' ? 'Retour au chapitre' : 'Retour à l’accueil'}
          />
        )}
        {view.name === 'flash' && <Flashcards known={progress.known} onMark={markTerm} onExit={() => setView({ name: 'home' })} />}
      </main>

      <Toasts toasts={toasts} onDismiss={(id) => setToasts((list) => list.filter((t) => t.id !== id))} />

      <footer className="footer">
        Contenu tiré des cours « Les fondations » et « La virtualisation de A à Z ». Progression enregistrée dans ce navigateur.
      </footer>
    </div>
  )
}
