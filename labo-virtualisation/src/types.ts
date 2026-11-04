export type ThemeId =
  | 'mat'
  | 'os'
  | 'lin'
  | 'sto'
  | 'lvm'
  | 'net'
  | 'vnet'
  | 'hyp'
  | 'pve'
  | 'clu'
  | 'vmw'

interface Base {
  theme: ThemeId
  /** Énoncé. Le texte entre [[ ]] s'affiche comme du code. */
  q: string
  explain: string
}

export interface Mcq extends Base {
  kind: 'mcq'
  options: string[]
  /** Index de la bonne réponse dans options. */
  answer: number
  /** Ne pas mélanger les options (Oui/Non, valeurs croissantes…). */
  keepOrder?: boolean
}

export interface Cmd extends Base {
  kind: 'cmd'
  solution: string
  accept: (normalized: string) => boolean
}

export interface Order extends Base {
  kind: 'order'
  /** Étapes dans le bon ordre. */
  steps: string[]
}

export interface Num extends Base {
  kind: 'num'
  answer: number
  tolerance: number
  unit?: string
}

export interface Text extends Base {
  kind: 'text'
  answers: string[]
  placeholder?: string
}

export type Question = Mcq | Cmd | Order | Num | Text
export type BankQuestion = Question & { id: string }

/** Familles de questions qu'on peut choisir dans une session. */
export type Family = 'mcq' | 'cmd' | 'order' | 'calc'

export interface Generator {
  id: string
  theme: ThemeId
  label: string
  make: (rng?: () => number) => Question
}

export interface Item {
  src: 'bank' | 'gen'
  id: string
}

export type SessionMode = 'custom' | 'exam' | 'terminal' | 'calc' | 'order' | 'review' | 'boss'

export interface SessionConfig {
  mode: SessionMode
  title: string
  items: Item[]
  /** Correction différée, chronomètre et note sur 20. */
  exam?: boolean
  /** Questions générées sans fin, jusqu'à ce que l'utilisateur arrête. */
  endless?: boolean
  minutes?: number
  /** Épreuve de fin de chapitre du parcours. */
  chapter?: ThemeId
}

export interface Answered {
  question: Question
  correct: boolean
  given: string
}
