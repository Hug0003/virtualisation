import { useState } from 'react'
import { GLOSSARY, type Term } from '../data/glossary'
import { THEME_NAME, THEMES } from '../data/themes'
import { shuffle } from '../generators/random'
import type { ThemeId } from '../types'

interface Props {
  known: string[]
  /** Paquet ouvert au départ : un thème, ou tout le glossaire. */
  initialDeck?: ThemeId | 'all'
  onMark: (term: string, known: boolean) => void
  onExit: () => void
}

type Deck = ThemeId | 'all'

const inDeck = (deck: Deck) => (t: Term) => deck === 'all' || t.theme === deck

/** Thèmes qui ont assez de termes pour former un paquet. */
const DECKS = THEMES.filter((t) => GLOSSARY.filter(inDeck(t.id)).length >= 5)

export default function Flashcards({ known, initialDeck = 'all', onMark, onExit }: Props) {
  const [deckId, setDeckId] = useState<Deck>(initialDeck)
  const [onlyUnknown, setOnlyUnknown] = useState(false)
  const [deck, setDeck] = useState<Term[]>(() => shuffle(Math.random, GLOSSARY.filter(inDeck(initialDeck))))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  function rebuild(nextDeck: Deck, unknownOnly: boolean) {
    const source = GLOSSARY.filter(inDeck(nextDeck)).filter((t) => !unknownOnly || !known.includes(t.term))
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
  const pool = GLOSSARY.filter(inDeck(deckId))
  const knownCount = pool.filter((t) => known.includes(t.term)).length

  return (
    <section className="flash" aria-labelledby="flash-title">
      <div className="session-head">
        <div>
          <p className="eyebrow">Flashcards · {deckId === 'all' ? 'tout le glossaire' : THEME_NAME[deckId]}</p>
          <h1 id="flash-title" className="session-count tnum">
            {card ? `Carte ${index + 1} / ${deck.length}` : 'Paquet terminé'}
          </h1>
        </div>
        <div className="session-meta">
          <span className="pill tnum">
            {knownCount} / {pool.length} connus
          </span>
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            Quitter
          </button>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Paquet">
        {[{ id: 'all' as const, name: 'Tout' }, ...DECKS].map((d) => (
          <button
            key={d.id}
            type="button"
            className="chip"
            aria-pressed={deckId === d.id}
            onClick={() => {
              setDeckId(d.id)
              rebuild(d.id, onlyUnknown)
            }}
          >
            {d.name} <span className="tnum">({GLOSSARY.filter(inDeck(d.id)).length})</span>
          </button>
        ))}
      </div>

      <label className="toggle">
        <input
          id="only-unknown"
          type="checkbox"
          checked={onlyUnknown}
          onChange={(e) => {
            setOnlyUnknown(e.target.checked)
            rebuild(deckId, e.target.checked)
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
          <p>{deck.length === 0 ? 'Vous connaissez déjà tous les termes de ce paquet. Bravo.' : 'Vous avez parcouru tout le paquet.'}</p>
          <button type="button" className="btn btn-primary" onClick={() => rebuild(deckId, onlyUnknown)}>
            Mélanger et recommencer
          </button>
        </div>
      )}
    </section>
  )
}
