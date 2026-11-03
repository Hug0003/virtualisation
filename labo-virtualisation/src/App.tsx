import { useEffect, useState } from 'react'
import Flashcards from './components/Flashcards'
import Home from './components/Home'
import SessionView from './components/SessionView'
import { emptyProgress, loadProgress, recordAnswer, saveProgress } from './lib/storage'
import type { SessionConfig, ThemeId } from './types'

type View =
  | { name: 'home' }
  | { name: 'flash' }
  | { name: 'session'; config: SessionConfig; rebuild: () => SessionConfig; run: number }

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [view, setView] = useState<View>({ name: 'home' })

  useEffect(() => saveProgress(progress), [progress])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  function record(theme: ThemeId, key: string, correct: boolean) {
    setProgress((p) => recordAnswer(p, theme, key, correct))
  }

  function markTerm(term: string, known: boolean) {
    setProgress((p) => ({ ...p, known: known ? [...new Set([...p.known, term])] : p.known.filter((t) => t !== term) }))
  }

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setView({ name: 'home' })}>
          <span className="leds" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Labo Virtualisation</span>
        </button>
        <span className="host mono" aria-hidden="true">
          pve1 · 8006
        </span>
      </header>

      <main className="main">
        {view.name === 'home' && (
          <Home
            progress={progress}
            onStart={(config, rebuild) => setView({ name: 'session', config, rebuild, run: Date.now() })}
            onFlashcards={() => setView({ name: 'flash' })}
            onReset={() => setProgress(emptyProgress())}
          />
        )}
        {view.name === 'session' && (
          <SessionView
            key={view.run}
            config={view.config}
            onRecord={record}
            onExit={() => setView({ name: 'home' })}
            onRestart={() => setView({ ...view, config: view.rebuild(), run: Date.now() })}
          />
        )}
        {view.name === 'flash' && <Flashcards known={progress.known} onMark={markTerm} onExit={() => setView({ name: 'home' })} />}
      </main>

      <footer className="footer">
        Questions tirées des cours « Les fondations » et « La virtualisation de A à Z ». Progression enregistrée dans ce navigateur.
      </footer>
    </div>
  )
}
