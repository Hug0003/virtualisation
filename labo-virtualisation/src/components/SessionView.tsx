import { useEffect, useRef, useState } from 'react'
import { THEME_NAME } from '../data/themes'
import { itemKey, materialize, randomGenItem } from '../lib/session'
import type { Answered, Item, Question, SessionConfig, ThemeId } from '../types'
import CmdQuestion from './CmdQuestion'
import Feedback from './Feedback'
import InputQuestion from './InputQuestion'
import McqQuestion from './McqQuestion'
import OrderQuestion from './OrderQuestion'
import ResultScreen from './ResultScreen'
import Rich from './Rich'

interface Props {
  config: SessionConfig
  onRecord: (theme: ThemeId, key: string, correct: boolean) => void
  onExit: () => void
  onRestart: () => void
}

const KIND_LABEL: Record<Question['kind'], string> = {
  mcq: 'QCM',
  cmd: 'Commande',
  order: 'Mise en ordre',
  num: 'Calcul',
  text: 'Calcul',
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function SessionView({ config, onRecord, onExit, onRestart }: Props) {
  const [items, setItems] = useState<Item[]>(config.items)
  const [index, setIndex] = useState(0)
  const [question, setQuestion] = useState<Question | null>(() => (config.items[0] ? materialize(config.items[0]) : null))
  const [result, setResult] = useState<{ correct: boolean; given: string } | null>(null)
  const [answered, setAnswered] = useState<Answered[]>([])
  const [finished, setFinished] = useState(config.items.length === 0)
  const [deadline] = useState(() => (config.minutes ? Date.now() + config.minutes * 60_000 : null))
  const [now, setNow] = useState(() => Date.now())
  const nextButton = useRef<HTMLButtonElement>(null)

  const exam = Boolean(config.exam)
  const total = config.endless ? null : items.length

  function goTo(i: number, list: Item[]) {
    if (i >= list.length) {
      setFinished(true)
      return
    }
    setIndex(i)
    setQuestion(materialize(list[i]))
    setResult(null)
  }

  function next() {
    let list = items
    if (config.endless && index + 1 >= list.length) {
      list = [...list, randomGenItem()]
      setItems(list)
    }
    goTo(index + 1, list)
  }

  function answer(correct: boolean, given: string) {
    if (!question || result) return
    onRecord(question.theme, itemKey(items[index]), correct)
    setAnswered((a) => [...a, { question, correct, given }])
    if (exam) goTo(index + 1, items)
    else setResult({ correct, given })
  }

  useEffect(() => {
    if (result) nextButton.current?.focus()
  }, [result])

  useEffect(() => {
    if (!result || exam) return
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

  useEffect(() => {
    if (!deadline || finished) return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= deadline) setFinished(true)
    }, 500)
    return () => window.clearInterval(id)
  }, [deadline, finished])

  if (finished || !question) {
    return <ResultScreen config={config} answered={answered} total={items.length} onExit={onExit} onRestart={onRestart} />
  }

  const okCount = answered.filter((a) => a.correct).length
  const progress = total ? (index / total) * 100 : 0
  const locked = result !== null
  const key = `${index}-${items[index].id}`

  return (
    <section className="session" aria-labelledby="session-title">
      <div className="session-head">
        <div>
          <p className="eyebrow">{config.title}</p>
          <h1 id="session-title" className="session-count tnum">
            {total ? `Question ${index + 1} / ${total}` : `Question ${index + 1}`}
          </h1>
        </div>
        <div className="session-meta">
          {deadline && (
            <span className={`pill tnum ${deadline - now < 5 * 60_000 ? 'pill-warn' : ''}`} aria-label="Temps restant">
              {formatTime(deadline - now)}
            </span>
          )}
          {!exam && (
            <span className="pill tnum" aria-label="Score">
              {okCount} / {answered.length} juste{okCount > 1 ? 's' : ''}
            </span>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => (answered.length > 0 ? setFinished(true) : onExit())}>
            {answered.length > 0 ? 'Terminer' : 'Quitter'}
          </button>
        </div>
      </div>
      {total !== null && (
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      <article className="card question-card" key={key}>
        <div className="question-tags">
          <span className="tag">{THEME_NAME[question.theme]}</span>
          <span className="tag tag-kind">{KIND_LABEL[question.kind]}</span>
        </div>
        <h2 className="question-text">
          <Rich text={question.q} />
        </h2>

        {question.kind === 'mcq' && <McqQuestion q={question} locked={locked} reveal={!exam} onAnswer={answer} />}
        {question.kind === 'cmd' && <CmdQuestion q={question} locked={locked} onAnswer={answer} />}
        {question.kind === 'order' && <OrderQuestion q={question} locked={locked} reveal={!exam} onAnswer={answer} />}
        {(question.kind === 'num' || question.kind === 'text') && <InputQuestion q={question} locked={locked} onAnswer={answer} />}

        {result && (
          <>
            <Feedback q={question} correct={result.correct} given={result.given} />
            <div className="row-end">
              <span className="hint">Entrée pour continuer</span>
              <button ref={nextButton} type="button" className="btn btn-primary" onClick={next}>
                {total !== null && index + 1 >= total ? 'Voir le résultat' : 'Question suivante'}
              </button>
            </div>
          </>
        )}
        {exam && <p className="hint">Examen : la correction s'affiche à la fin.</p>}
      </article>
    </section>
  )
}
