import { useEffect, useState } from 'react'
import { shuffle } from '../generators/random'
import type { Mcq } from '../types'
import Rich from './Rich'

interface Props {
  q: Mcq
  locked: boolean
  reveal: boolean
  onAnswer: (correct: boolean, given: string) => void
}

export default function McqQuestion({ q, locked, reveal, onAnswer }: Props) {
  const [order] = useState(() => {
    const indexes = q.options.map((_, i) => i)
    return q.keepOrder ? indexes : shuffle(Math.random, indexes)
  })
  const [chosen, setChosen] = useState<number | null>(null)

  function choose(optionIndex: number) {
    if (locked) return
    setChosen(optionIndex)
    onAnswer(optionIndex === q.answer, q.options[optionIndex])
  }

  useEffect(() => {
    if (locked) return
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= order.length) {
        e.preventDefault()
        choose(order[n - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="options" role="group" aria-label="Réponses">
      {order.map((optionIndex, pos) => {
        let state = ''
        if (reveal && locked) {
          if (optionIndex === q.answer) state = 'is-right'
          else if (optionIndex === chosen) state = 'is-wrong'
          else state = 'is-dim'
        } else if (optionIndex === chosen) state = 'is-chosen'
        return (
          <button
            key={optionIndex}
            type="button"
            className={`option ${state}`}
            disabled={locked}
            onClick={() => choose(optionIndex)}
          >
            <span className="option-key">{pos + 1}</span>
            <span className="option-text">
              <Rich text={q.options[optionIndex]} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
