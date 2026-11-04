import { useEffect, useMemo, useRef, useState } from 'react'
import type { Chapter } from '../data/course'
import { XP } from '../lib/game'
import type { Mcq } from '../types'
import Feedback from './Feedback'
import LessonBlocks from './LessonBlocks'
import McqQuestion from './McqQuestion'
import Rich from './Rich'

interface Props {
  chapter: Chapter
  chapterNumber: number
  lessonIndex: number
  /** La leçon a déjà été terminée : on peut la relire, mais elle ne rapporte plus d'XP. */
  alreadyDone: boolean
  onComplete: (checksFirstTry: number) => void
  onNext: () => void
  onBoss: () => void
  onExit: () => void
}

export default function LessonView({ chapter, chapterNumber, lessonIndex, alreadyDone, onComplete, onNext, onBoss, onExit }: Props) {
  const lesson = chapter.lessons[lessonIndex]
  // Figé à l'ouverture : une fois la leçon validée, la prop passe à true, mais l'écran de fin doit montrer l'XP gagnée.
  const [wasDone] = useState(alreadyDone)
  const [stepIndex, setStepIndex] = useState(0)
  /** Résultat de chaque mini-question, indexé par étape. */
  const [results, setResults] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)
  const reported = useRef(false)
  const nextButton = useRef<HTMLButtonElement>(null)

  const step = lesson.steps[stepIndex]
  const checkCount = lesson.steps.filter((s) => s.kind === 'check').length
  const firstTry = Object.values(results).filter(Boolean).length
  const answered = step?.kind === 'check' && stepIndex in results
  const canContinue = step?.kind === 'read' || answered
  const isLastLesson = lessonIndex + 1 >= chapter.lessons.length

  const mcq = useMemo<Mcq | null>(
    () => (step?.kind === 'check' ? { kind: 'mcq', theme: chapter.id, q: step.check.q, options: step.check.options, answer: 0, explain: step.check.explain } : null),
    [step, chapter.id],
  )

  function next() {
    if (!canContinue) return
    if (stepIndex + 1 >= lesson.steps.length) setFinished(true)
    else setStepIndex((i) => i + 1)
  }

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [stepIndex, finished])

  useEffect(() => {
    if (answered) nextButton.current?.focus()
  }, [answered])

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true
      onComplete(firstTry)
    }
  }, [finished, firstTry, onComplete])

  useEffect(() => {
    if (finished || !canContinue) return
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'BUTTON', 'TEXTAREA'].includes(target.tagName)) return
      if (e.key === 'Enter') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const head = (
    <div className="session-head">
      <div>
        <p className="eyebrow">
          Chapitre {chapterNumber} · {chapter.title}
        </p>
        <h1 className="session-count">{lesson.title}</h1>
      </div>
      <div className="session-meta">
        <button type="button" className="btn btn-ghost" onClick={onExit}>
          Quitter
        </button>
      </div>
    </div>
  )

  if (finished) {
    const gained = wasDone ? 0 : XP.lesson + XP.check * firstTry
    return (
      <section className="lesson" aria-labelledby="lesson-done-title">
        {head}
        <div className="card lesson-done">
          <div className="xp-burst" aria-hidden="true">
            +{gained} XP
          </div>
          <h2 id="lesson-done-title" className="section-title">
            Leçon terminée
          </h2>
          <p className="hint">
            {checkCount > 0 && `Réussies du premier coup : ${firstTry} / ${checkCount}. `}
            {wasDone ? 'Leçon déjà validée : la relecture ne rapporte pas d’XP, mais elle consolide.' : `Leçon validée : +${XP.lesson} XP, et +${XP.check} XP par bonne réponse.`}
          </p>
          <div className="row">
            {isLastLesson ? (
              <button type="button" className="btn btn-primary" onClick={onBoss}>
                Passer l’épreuve du chapitre
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={onNext}>
                Leçon suivante
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              Retour au chapitre
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="lesson" aria-labelledby="lesson-step-title">
      {head}
      <ol className="steps" aria-label="Avancement de la leçon">
        {lesson.steps.map((s, i) => (
          <li
            key={i}
            className={`step-dot ${s.kind === 'check' ? 'is-check' : ''} ${i < stepIndex ? 'is-done' : ''} ${i === stepIndex ? 'is-current' : ''}`}
            aria-current={i === stepIndex ? 'step' : undefined}
          >
            <span className="visually-hidden">
              Étape {i + 1}
              {s.kind === 'check' ? ', question' : ''}
            </span>
          </li>
        ))}
      </ol>

      {step.kind === 'read' && (
        <article className="card lesson-card" key={stepIndex}>
          <h2 id="lesson-step-title" className="lesson-title">
            {step.title}
          </h2>
          <LessonBlocks blocks={step.blocks} />
        </article>
      )}

      {step.kind === 'check' && mcq && (
        <article className="card question-card lesson-check" key={stepIndex}>
          <div className="question-tags">
            <span className="tag tag-kind">Question rapide</span>
            {!wasDone && <span className="tag">+{XP.check} XP du premier coup</span>}
          </div>
          <h2 id="lesson-step-title" className="question-text">
            <Rich text={mcq.q} />
          </h2>
          <McqQuestion q={mcq} locked={answered} reveal onAnswer={(correct) => setResults((r) => ({ ...r, [stepIndex]: correct }))} />
          {answered && <Feedback q={mcq} correct={results[stepIndex]} />}
        </article>
      )}

      <div className="row-end">
        {canContinue && <span className="hint">Entrée pour continuer</span>}
        <button ref={nextButton} type="button" className="btn btn-primary" onClick={next} disabled={!canContinue}>
          {stepIndex + 1 >= lesson.steps.length ? 'Terminer la leçon' : 'Continuer'}
        </button>
      </div>
    </section>
  )
}
