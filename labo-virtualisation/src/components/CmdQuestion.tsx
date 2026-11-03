import { useState, type FormEvent } from 'react'
import { normalizeCmd } from '../lib/check'
import type { Cmd } from '../types'

interface Props {
  q: Cmd
  locked: boolean
  onAnswer: (correct: boolean, given: string) => void
}

export default function CmdQuestion({ q, locked, onAnswer }: Props) {
  const [value, setValue] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (locked || !value.trim()) return
    const cmd = normalizeCmd(value)
    onAnswer(q.accept(cmd), value.trim())
  }

  return (
    <form className="terminal" onSubmit={submit}>
      <label className="terminal-line" htmlFor="cmd-input">
        <span className="prompt">root@pve1:~#</span>
        <input
          id="cmd-input"
          className="terminal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={locked}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Commande"
        />
      </label>
      {!locked && (
        <div className="row-end">
          <span className="hint">Entrée pour valider</span>
          <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
            Valider
          </button>
        </div>
      )}
    </form>
  )
}
