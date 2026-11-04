import type { ThemeId } from '../../types'

/** Un bloc de contenu d'une leçon. Les textes acceptent [[code]] et **gras**. */
export type Block =
  | { t: 'p'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'key'; text: string }
  | { t: 'analogy'; text: string }
  | { t: 'code'; text: string }
  | { t: 'table'; head: string[]; rows: string[][] }

export interface Check {
  q: string
  /** La première option est la bonne réponse ; l'ordre est mélangé à l'affichage. */
  options: string[]
  explain: string
}

export type Step = { kind: 'read'; title: string; blocks: Block[] } | { kind: 'check'; check: Check }

export interface Lesson {
  id: string
  title: string
  minutes: number
  steps: Step[]
}

export interface Chapter {
  id: ThemeId
  title: string
  tagline: string
  lessons: Lesson[]
}

export const p = (text: string): Block => ({ t: 'p', text })
export const list = (...items: string[]): Block => ({ t: 'list', items })
/** Encadré « À retenir ». */
export const key = (text: string): Block => ({ t: 'key', text })
/** Encadré « Image mentale ». */
export const analogy = (text: string): Block => ({ t: 'analogy', text })
export const code = (text: string): Block => ({ t: 'code', text })
export const table = (head: string[], ...rows: string[][]): Block => ({ t: 'table', head, rows })

/** Un écran de lecture. */
export const read = (title: string, ...blocks: Block[]): Step => ({ kind: 'read', title, blocks })
/** Une mini-question : la première option est la bonne. */
export const check = (q: string, options: string[], explain: string): Step => ({ kind: 'check', check: { q, options, explain } })

export const lesson = (title: string, minutes: number, ...steps: Step[]): Omit<Lesson, 'id'> => ({ title, minutes, steps })

/** Les leçons reçoivent les identifiants « <thème>-1 », « <thème>-2 »… */
export function chapter(id: ThemeId, title: string, tagline: string, ...lessons: Omit<Lesson, 'id'>[]): Chapter {
  return { id, title, tagline, lessons: lessons.map((l, i) => ({ ...l, id: `${id}-${i + 1}` })) }
}
