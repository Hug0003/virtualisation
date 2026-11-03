import { useState, type FormEvent } from 'react'
import { checkNumber, checkText } from '../lib/check'
import type { Num, Text } from '../types'

interface Props {
  q: Num | Text
  locked: boolean
  onAnswer: (correct: boolean, given: string) => void
}

export default function InputQuestion({ q, locked, onAnswer }: Props) {
  const [value, setValue] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (locked || !value.trim()) return
    const correct = q.kind === 'num' ? checkNumber(value, q.answer, q.tolerance) : checkText(value, q.answers)
    onAnswer(correct, value.trim())
  }

  return (
    <form className="answer-form" onSubmit={submit}>
      <div className="answer-field">
        <input
          id="answer-input"
          className="answer-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={locked}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          inputMode={q.kind === 'num' ? 'decimal' : 'text'}
          placeholder={q.kind === 'text' ? q.placeholder : 'Votre réponse'}
          aria-label="Votre réponse"
        />
        {q.kind === 'num' && q.unit && <span className="unit">{q.unit}</span>}
      </div>
      {!locked && (
        <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
          Valider
        </button>
      )}
    </form>
  )
}
