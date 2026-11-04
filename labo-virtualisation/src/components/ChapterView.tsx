import { COURSE } from '../data/course'
import { BOSS_QUESTIONS, PASS_RATIO, XP, chapterState, starsFor } from '../lib/game'
import type { Progress } from '../lib/storage'
import Stars from './Stars'

interface Props {
  index: number
  progress: Progress
  onLesson: (lessonIndex: number) => void
  onBoss: () => void
  onPractice: () => void
  onBack: () => void
}

export default function ChapterView({ index, progress, onLesson, onBoss, onPractice, onBack }: Props) {
  const chapter = COURSE[index]
  const done = chapter.lessons.map((l) => progress.course.lessons.includes(l.id))
  const allDone = done.every(Boolean)
  const best = progress.course.boss[chapter.id]
  const stars = starsFor(best ?? 0)
  const state = chapterState(progress, index)

  return (
    <section className="chapter" aria-labelledby="chapter-title">
      <button type="button" className="link back" onClick={onBack}>
        ← Retour au parcours
      </button>

      <header className="chapter-head">
        <span className={`chapter-badge is-${state}`} aria-hidden="true">
          {index + 1}
        </span>
        <div>
          <p className="eyebrow">Chapitre {index + 1}</p>
          <h1 id="chapter-title" className="chapter-title">
            {chapter.title}
          </h1>
          <p className="lede">{chapter.tagline}</p>
        </div>
      </header>

      <ol className="lesson-list">
        {chapter.lessons.map((l, i) => {
          const locked = i > 0 && !done[i - 1] && !done[i]
          const current = !done[i] && !locked
          return (
            <li key={l.id}>
              <button
                type="button"
                className={`lesson-row ${done[i] ? 'is-done' : ''} ${current ? 'is-current' : ''}`}
                disabled={locked}
                onClick={() => onLesson(i)}
              >
                <span className="lesson-icon" aria-hidden="true">
                  {done[i] ? '✓' : locked ? '🔒' : '▶'}
                </span>
                <span className="lesson-row-text">
                  <span className="lesson-row-title">
                    Leçon {i + 1} · {l.title}
                  </span>
                  <span className="hint tnum">
                    {l.minutes} min · {l.steps.filter((s) => s.kind === 'check').length} questions
                    {done[i] ? ' · validée' : ` · +${XP.lesson} XP`}
                  </span>
                </span>
                <span className="lesson-row-action">{done[i] ? 'Relire' : locked ? 'Verrouillée' : 'Commencer'}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className={`card boss ${allDone ? '' : 'is-locked'}`}>
        <div className="boss-text">
          <p className="eyebrow">Épreuve du chapitre</p>
          <h2 className="section-title">
            {BOSS_QUESTIONS} questions, {Math.round(PASS_RATIO * 100)} % pour valider
          </h2>
          <p className="hint">
            {allDone
              ? best === undefined
                ? `Réussissez-la pour débloquer le chapitre suivant. Chaque étoile rapporte ${XP.star} XP.`
                : `Meilleur score : ${Math.round(best * 100)} %. ${stars < 3 ? 'Visez les 3 étoiles avec un sans-faute.' : 'Sans-faute, bravo.'}`
              : 'Terminez toutes les leçons du chapitre pour la débloquer.'}
          </p>
          <p className="hint">1 étoile dès 70 %, 2 étoiles dès 85 %, 3 étoiles pour 100 %.</p>
        </div>
        <div className="boss-side">
          <Stars count={stars} size="large" />
          <button type="button" className="btn btn-primary" disabled={!allDone} onClick={onBoss}>
            {best === undefined ? 'Passer l’épreuve' : 'Retenter'}
          </button>
        </div>
      </div>

      <div className="row-end">
        <span className="hint">Envie de plus de questions sur ce thème ?</span>
        <button type="button" className="btn btn-ghost" onClick={onPractice}>
          S’entraîner librement
        </button>
      </div>
    </section>
  )
}
