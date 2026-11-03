import { THEME_NAME } from '../data/themes'
import { solutionText } from '../lib/session'
import type { Answered, SessionConfig } from '../types'
import Rich from './Rich'

interface Props {
  config: SessionConfig
  answered: Answered[]
  total: number
  onExit: () => void
  onRestart: () => void
}

export default function ResultScreen({ config, answered, total, onExit, onRestart }: Props) {
  const ok = answered.filter((a) => a.correct).length
  const exam = Boolean(config.exam)
  const denominator = exam ? total : answered.length
  const ratio = denominator ? ok / denominator : 0
  const grade = Math.round(ratio * 200) / 10
  const wrong = answered.filter((a) => !a.correct)
  const list = exam ? answered : wrong

  let verdict = 'Continuez, la répétition fait tout.'
  if (ratio >= 0.85) verdict = 'Excellent, vous maîtrisez le sujet.'
  else if (ratio >= 0.65) verdict = 'Bien. Revoyez les erreurs pour consolider.'
  else if (ratio >= 0.45) verdict = 'C’est en route. Relisez les explications ci-dessous.'

  return (
    <section className="result" aria-labelledby="result-title">
      <p className="eyebrow">{config.title}</p>
      <h1 id="result-title" className="result-score tnum">
        {exam ? (
          <>
            {grade.toLocaleString('fr-FR')}
            <small> / 20</small>
          </>
        ) : (
          <>
            {ok}
            <small> / {denominator} justes</small>
          </>
        )}
      </h1>
      <p className="result-verdict">
        {verdict}
        {exam && answered.length < total && ` ${total - answered.length} question(s) sans réponse comptent comme fausses.`}
      </p>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          Recommencer
        </button>
        <button type="button" className="btn btn-ghost" onClick={onExit}>
          Retour à l'accueil
        </button>
      </div>

      {list.length > 0 && (
        <>
          <h2 className="section-title">{exam ? 'Correction complète' : 'À revoir'}</h2>
          <ol className="review-list">
            {list.map((a, i) => (
              <li key={i} className={`review-item ${a.correct ? 'is-right' : 'is-wrong'}`}>
                <p className="review-meta">
                  <span className="tag">{THEME_NAME[a.question.theme]}</span>
                  <span className={`mark ${a.correct ? 'ok' : 'ko'}`}>{a.correct ? 'Juste' : 'Faux'}</span>
                </p>
                <p className="review-q">
                  <Rich text={a.question.q} />
                </p>
                {!a.correct && (
                  <p className="review-line">
                    Votre réponse : <span className="mono pre">{a.given}</span>
                  </p>
                )}
                <p className="review-line">
                  Bonne réponse : <span className="mono pre">{solutionText(a.question)}</span>
                </p>
                <p className="review-explain">
                  <Rich text={a.question.explain} />
                </p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
