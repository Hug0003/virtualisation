import { COURSE, LESSON_COUNT } from '../data/course'
import { BADGES, chapterState, currentStreak, levelOf, lessonsDone, nextLesson, starsFor } from '../lib/game'
import type { Progress } from '../lib/storage'
import Stars from './Stars'

interface Props {
  progress: Progress
  onChapter: (index: number) => void
  onLesson: (chapter: number, lesson: number) => void
}

export default function CourseMap({ progress, onChapter, onLesson }: Props) {
  const xp = progress.course.xp
  const lvl = levelOf(xp)
  const streak = currentStreak(progress.course.streak)
  const stars = COURSE.reduce((s, ch) => s + starsFor(progress.course.boss[ch.id] ?? 0), 0)
  const next = nextLesson(progress)
  const nextChapter = next ? COURSE[next.chapter] : null
  const earned = BADGES.filter((b) => b.earned(progress))

  return (
    <div className="course">
      <section className="hero" aria-labelledby="course-title">
        <p className="eyebrow">Parcours · {COURSE.length} chapitres · {LESSON_COUNT} leçons</p>
        <h1 id="course-title">Apprenez la virtualisation, un niveau après l’autre.</h1>
        <p className="lede">
          Des leçons courtes avec des questions rapides, une épreuve à la fin de chaque chapitre, de l’XP, des étoiles et des badges. Chaque chapitre réussi débloque le suivant.
        </p>
      </section>

      <section className="card player" aria-label="Votre progression">
        <div className="player-level">
          <span className="level-badge tnum" aria-hidden="true">
            {lvl.level}
          </span>
          <div className="player-info">
            <p className="player-name">
              Niveau {lvl.level} · {lvl.name}
            </p>
            <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lvl.ratio * 100)} aria-label="Avancement vers le niveau suivant">
              <span style={{ width: `${lvl.ratio * 100}%` }} />
            </div>
            <p className="hint tnum">{lvl.next === null ? `${xp} XP · niveau maximal atteint` : `${xp} XP · encore ${lvl.next - xp} XP avant le niveau ${lvl.level + 1}`}</p>
          </div>
        </div>
        <dl className="player-stats">
          <div>
            <dt>Série</dt>
            <dd className="tnum">
              {streak} jour{streak > 1 ? 's' : ''}
            </dd>
          </div>
          <div>
            <dt>Leçons</dt>
            <dd className="tnum">
              {progress.course.lessons.length} / {LESSON_COUNT}
            </dd>
          </div>
          <div>
            <dt>Étoiles</dt>
            <dd className="tnum">
              {stars} / {COURSE.length * 3}
            </dd>
          </div>
          <div>
            <dt>Badges</dt>
            <dd className="tnum">
              {earned.length} / {BADGES.length}
            </dd>
          </div>
        </dl>
        {next && nextChapter && (
          <div className="row-end">
            <span className="hint">
              Ensuite : chapitre {next.chapter + 1}, {nextChapter.lessons[next.lesson].title}
            </span>
            <button type="button" className="btn btn-primary" onClick={() => onLesson(next.chapter, next.lesson)}>
              {progress.course.lessons.length === 0 ? 'Commencer le parcours' : 'Continuer'}
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="path-title">
        <h2 id="path-title" className="section-title">
          Le parcours
        </h2>
        <ol className="path">
          {COURSE.map((ch, i) => {
            const state = chapterState(progress, i)
            const doneCount = lessonsDone(progress, i)
            const chStars = starsFor(progress.course.boss[ch.id] ?? 0)
            return (
              <li key={ch.id} className={`path-node is-${state}`}>
                <span className="path-dot tnum" aria-hidden="true">
                  {state === 'done' ? '✓' : state === 'locked' ? '🔒' : i + 1}
                </span>
                <button type="button" className="path-card" disabled={state === 'locked'} onClick={() => onChapter(i)}>
                  <span className="path-top">
                    <span className="mode-meta">Chapitre {i + 1}</span>
                    <Stars count={chStars} />
                  </span>
                  <span className="mode-title">{ch.title}</span>
                  <span className="mode-desc">{state === 'locked' ? 'Réussissez l’épreuve du chapitre précédent pour débloquer celui-ci.' : ch.tagline}</span>
                  <span className="path-progress">
                    <span className="meter meter-good" aria-hidden="true">
                      <span style={{ width: `${(doneCount / ch.lessons.length) * 100}%` }} />
                    </span>
                    <span className="hint tnum">
                      {doneCount} / {ch.lessons.length} leçons
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className="section-title">
          Badges
        </h2>
        <ul className="badges">
          {BADGES.map((b) => {
            const has = b.earned(progress)
            return (
              <li key={b.id} className={`badge ${has ? 'is-earned' : ''}`}>
                <span className="badge-icon" aria-hidden="true">
                  {has ? '★' : '☆'}
                </span>
                <span>
                  <span className="badge-name">{b.name}</span>
                  <span className="hint">{b.desc}</span>
                </span>
                <span className="visually-hidden">{has ? 'Obtenu' : 'Pas encore obtenu'}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
