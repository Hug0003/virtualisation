import { useState } from 'react'
import { GLOSSARY, type Term } from '../data/glossary'
import { THEME_NAME } from '../data/themes'
import { shuffle } from '../generators/random'

interface Props {
  known: string[]
  onMark: (term: string, known: boolean) => void
  onExit: () => void
}

export default function Flashcards({ known, onMark, onExit }: Props) {
  const [onlyUnknown, setOnlyUnknown] = useState(false)
  const [deck, setDeck] = useState<Term[]>(() => shuffle(Math.random, GLOSSARY))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  function rebuild(unknownOnly: boolean) {
    const source = unknownOnly ? GLOSSARY.filter((t) => !known.includes(t.term)) : GLOSSARY
    setDeck(shuffle(Math.random, source))
    setIndex(0)
    setFlipped(false)
  }

  function mark(isKnown: boolean) {
    const card = deck[index]
    if (!card) return
    onMark(card.term, isKnown)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  const card = deck[index]
  const knownCount = GLOSSARY.filter((t) => known.includes(t.term)).length

  return (
    <section className="flash" aria-labelledby="flash-title">
      <div className="session-head">
        <div>
          <p className="eyebrow">Flashcards</p>
          <h1 id="flash-title" className="session-count tnum">
            {card ? `Carte ${index + 1} / ${deck.length}` : 'Paquet terminé'}
          </h1>
        </div>
        <div className="session-meta">
          <span className="pill tnum">
            {knownCount} / {GLOSSARY.length} connus
          </span>
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            Quitter
          </button>
        </div>
      </div>

      <label className="toggle">
        <input
          id="only-unknown"
          type="checkbox"
          checked={onlyUnknown}
          onChange={(e) => {
            setOnlyUnknown(e.target.checked)
            rebuild(e.target.checked)
          }}
        />
        Seulement les termes que je ne connais pas encore
      </label>

      {card ? (
        <>
          <button
            type="button"
            className={`flashcard ${flipped ? 'is-flipped' : ''}`}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Masquer la définition' : 'Voir la définition'}
          >
            <span className="tag">{THEME_NAME[card.theme]}</span>
            <span className="flash-term">{card.term}</span>
            {flipped ? <span className="flash-def">{card.def}</span> : <span className="hint">Touchez pour voir la définition</span>}
          </button>
          <div className="row-end">
            <button type="button" className="btn btn-ghost" onClick={() => mark(false)}>
              À revoir
            </button>
            <button type="button" className="btn btn-primary" onClick={() => mark(true)}>
              Je savais
            </button>
          </div>
        </>
      ) : (
        <div className="card empty">
          <p>{deck.length === 0 ? 'Vous connaissez déjà tous les termes. Bravo.' : 'Vous avez parcouru tout le paquet.'}</p>
          <button type="button" className="btn btn-primary" onClick={() => rebuild(onlyUnknown)}>
            Mélanger et recommencer
          </button>
        </div>
      )}
    </section>
  )
}
