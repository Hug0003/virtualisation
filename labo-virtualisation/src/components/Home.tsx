import { useState } from 'react'
import { BANK } from '../data/questions'
import { GLOSSARY } from '../data/glossary'
import { THEMES } from '../data/themes'
import { GENERATORS } from '../generators'
import type { Progress } from '../lib/storage'
import {
  ALL_FAMILIES,
  ALL_THEMES,
  calcSession,
  countAvailable,
  customSession,
  examSession,
  orderSession,
  reviewSession,
  terminalSession,
  themeSession,
} from '../lib/session'
import type { Family, SessionConfig, ThemeId } from '../types'

interface Props {
  progress: Progress
  onStart: (config: SessionConfig, rebuild: () => SessionConfig) => void
  onFlashcards: () => void
  onReset: () => void
}

const FAMILY_LABEL: Record<Family, string> = {
  mcq: 'QCM',
  cmd: 'Commandes',
  order: 'Mises en ordre',
  calc: 'Calculs générés',
}

const COUNTS = [10, 20, 40]

export default function Home({ progress, onStart, onFlashcards, onReset }: Props) {
  const [themes, setThemes] = useState<ThemeId[]>(ALL_THEMES)
  const [families, setFamilies] = useState<Family[]>(ALL_FAMILIES)
  const [count, setCount] = useState(20)
  const [confirmReset, setConfirmReset] = useState(false)

  const totals = Object.values(progress.stats).reduce((acc, s) => ({ ok: acc.ok + (s?.ok ?? 0), n: acc.n + (s?.n ?? 0) }), { ok: 0, n: 0 })
  const rate = totals.n ? Math.round((totals.ok / totals.n) * 100) : null
  const available = countAvailable(themes, families)
  const canStart = themes.length > 0 && families.length > 0 && (available.bank > 0 || available.calc)

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

  function start(build: () => SessionConfig) {
    onStart(build(), build)
  }

  const cmdCount = BANK.filter((q) => q.kind === 'cmd').length
  const orderCount = BANK.filter((q) => q.kind === 'order').length

  const modes = [
    { id: 'exam', title: 'Examen blanc', meta: '30 questions · 30 min', desc: 'Tous les thèmes, note sur 20 et correction complète à la fin.', run: () => start(examSession) },
    { id: 'terminal', title: 'Terminal', meta: `${cmdCount} commandes`, desc: 'Tapez la vraie commande : qm, pct, pvecm, lvcreate, zpool, ip…', run: () => start(terminalSession) },
    { id: 'calc', title: 'Calculs réseau et stockage', meta: 'Sans fin', desc: 'Sous-réseaux, masques, RAID, Ceph, quorum, chmod, débits.', run: () => start(calcSession) },
    { id: 'order', title: 'Remettre dans l’ordre', meta: `${orderCount} séquences`, desc: 'Démarrage, LVM, dépannage réseau, cluster, trajet d’un paquet…', run: () => start(orderSession) },
    { id: 'flash', title: 'Flashcards', meta: `${GLOSSARY.length} termes`, desc: 'Le vocabulaire des deux cours, carte par carte.', run: onFlashcards },
    {
      id: 'review',
      title: 'Revoir mes erreurs',
      meta: progress.errors.length ? `${progress.errors.length} à revoir` : 'Aucune pour l’instant',
      desc: 'Une question quitte la liste dès que vous la réussissez.',
      run: () => start(() => reviewSession(progress.errors)),
      disabled: progress.errors.length === 0,
    },
  ]

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Entraînement · Proxmox VE · VMware · Linux · réseau</p>
        <h1 id="hero-title">Entraînez-vous jusqu’à ce que ça devienne évident.</h1>
        <p className="lede">
          {BANK.length} questions écrites à partir de vos deux cours, et {GENERATORS.length} générateurs de calculs qui ne s’épuisent jamais.
        </p>
        <dl className="kpis">
          <div>
            <dt>Réponses</dt>
            <dd className="tnum">{progress.answered}</dd>
          </div>
          <div>
            <dt>Réussite</dt>
            <dd className="tnum">{rate === null ? '—' : `${rate} %`}</dd>
          </div>
          <div>
            <dt>Erreurs à revoir</dt>
            <dd className="tnum">{progress.errors.length}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="modes-title">
        <h2 id="modes-title" className="section-title">Modes</h2>
        <div className="modes">
          {modes.map((m) => (
            <button key={m.id} type="button" className="mode" onClick={m.run} disabled={m.disabled}>
              <span className="mode-meta">{m.meta}</span>
              <span className="mode-title">{m.title}</span>
              <span className="mode-desc">{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card custom" aria-labelledby="custom-title">
        <h2 id="custom-title" className="section-title">Session sur mesure</h2>
        <div className="field">
          <div className="field-head">
            <span className="field-label">Thèmes</span>
            <span className="row-tight">
              <button type="button" className="link" onClick={() => setThemes(ALL_THEMES)}>Tous</button>
              <button type="button" className="link" onClick={() => setThemes([])}>Aucun</button>
            </span>
          </div>
          <div className="chips">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className="chip"
                aria-pressed={themes.includes(t.id)}
                onClick={() => setThemes((list) => toggle(list, t.id))}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-label">Types de questions</span>
          <div className="chips">
            {ALL_FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                className="chip"
                aria-pressed={families.includes(f)}
                onClick={() => setFamilies((list) => toggle(list, f))}
              >
                {FAMILY_LABEL[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-label">Nombre de questions</span>
          <div className="segmented" role="radiogroup" aria-label="Nombre de questions">
            {COUNTS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={count === c} className="seg" onClick={() => setCount(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="row-end">
          <span className="hint">
            {canStart
              ? `${available.bank} question${available.bank > 1 ? 's' : ''} dans la banque${available.calc ? ' + calculs illimités' : ''}`
              : 'Choisissez au moins un thème et un type disponibles.'}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canStart}
            onClick={() => start(() => customSession(themes, families, count))}
          >
            Lancer la session
          </button>
        </div>
      </section>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="section-title">Progression par thème</h2>
        <ul className="stats">
          {THEMES.map((t) => {
            const s = progress.stats[t.id]
            const pct = s && s.n ? Math.round((s.ok / s.n) * 100) : null
            const level = pct === null ? 'none' : pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low'
            const size = BANK.filter((q) => q.theme === t.id).length
            return (
              <li key={t.id} className="stat-row">
                <div className="stat-name">
                  <span>{t.name}</span>
                  <span className="stat-sub tnum">
                    {size} questions{s ? ` · ${s.ok}/${s.n} justes` : ''}
                  </span>
                </div>
                <div className={`meter meter-${level}`} aria-label={pct === null ? 'Pas encore commencé' : `${pct} % de réussite`}>
                  <span style={{ width: `${pct ?? 0}%` }} />
                </div>
                <span className="stat-pct tnum">{pct === null ? '—' : `${pct} %`}</span>
                <button type="button" className="btn btn-small" onClick={() => start(() => themeSession(t.id))}>
                  S’entraîner
                </button>
              </li>
            )
          })}
        </ul>
        <div className="row-end">
          {confirmReset ? (
            <>
              <span className="hint">Toute la progression sera effacée.</span>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onReset()
                  setConfirmReset(false)
                }}
              >
                Effacer la progression
              </button>
            </>
          ) : (
            <button type="button" className="link" onClick={() => setConfirmReset(true)} disabled={progress.answered === 0}>
              Remettre la progression à zéro
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
