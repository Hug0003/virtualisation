import { useState } from 'react'
import { shuffle } from '../generators/random'
import type { Order } from '../types'
import Rich from './Rich'

interface Props {
  q: Order
  locked: boolean
  reveal: boolean
  onAnswer: (correct: boolean, given: string) => void
}

function shuffledSteps(steps: string[]): string[] {
  if (steps.length < 2) return steps
  let result = shuffle(Math.random, steps)
  while (result.every((s, i) => s === steps[i])) result = shuffle(Math.random, steps)
  return result
}

export default function OrderQuestion({ q, locked, reveal, onAnswer }: Props) {
  const [pool, setPool] = useState(() => shuffledSteps(q.steps))
  const [chosen, setChosen] = useState<string[]>([])

  function add(step: string) {
    if (locked) return
    setPool((p) => p.filter((s) => s !== step))
    setChosen((c) => [...c, step])
  }

  function remove(step: string) {
    if (locked) return
    setChosen((c) => c.filter((s) => s !== step))
    setPool((p) => [...p, step])
  }

  function validate() {
    const correct = chosen.every((s, i) => s === q.steps[i])
    onAnswer(correct, chosen.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }

  return (
    <div className="order">
      <ol className="order-chosen" aria-label="Votre ordre">
        {chosen.length === 0 && <li className="order-empty">Touchez les étapes ci-dessous dans le bon ordre.</li>}
        {chosen.map((step, i) => {
          const state = reveal && locked ? (step === q.steps[i] ? 'is-right' : 'is-wrong') : ''
          return (
            <li key={step}>
              <button type="button" className={`order-step placed ${state}`} onClick={() => remove(step)} disabled={locked}>
                <span className="order-num">{i + 1}</span>
                <Rich text={step} />
              </button>
            </li>
          )
        })}
      </ol>
      {pool.length > 0 && (
        <div className="order-pool" aria-label="Étapes disponibles">
          {pool.map((step) => (
            <button type="button" key={step} className="order-step" onClick={() => add(step)} disabled={locked}>
              <Rich text={step} />
            </button>
          ))}
        </div>
      )}
      {!locked && (
        <div className="row-end">
          {chosen.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => { setPool(shuffledSteps(q.steps)); setChosen([]) }}>
              Recommencer
            </button>
          )}
          <button type="button" className="btn btn-primary" disabled={pool.length > 0} onClick={validate}>
            Valider l'ordre
          </button>
        </div>
      )}
    </div>
  )
}
