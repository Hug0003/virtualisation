import { solutionText } from '../lib/session'
import type { Question } from '../types'
import Rich from './Rich'

interface Props {
  q: Question
  correct: boolean
  given?: string
}

export default function Feedback({ q, correct, given }: Props) {
  const showSolution = q.kind !== 'mcq' || !correct
  return (
    <div className={`feedback ${correct ? 'is-right' : 'is-wrong'}`} role="status">
      <p className="feedback-title">{correct ? 'Bonne réponse' : 'Pas tout à fait'}</p>
      {given !== undefined && !correct && q.kind !== 'mcq' && (
        <p className="feedback-given">
          Votre réponse : <span className="mono">{given}</span>
        </p>
      )}
      {showSolution && (
        <p className="feedback-solution">
          {q.kind === 'cmd' ? 'Commande attendue : ' : 'Réponse : '}
          <span className="mono pre">{solutionText(q)}</span>
        </p>
      )}
      <p className="feedback-explain">
        <Rich text={q.explain} />
      </p>
    </div>
  )
}
