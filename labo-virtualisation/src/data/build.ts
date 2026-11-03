import type { Cmd, Mcq, Order, Question, ThemeId } from '../types'

type Accept = RegExp | RegExp[] | ((s: string) => boolean)

function toFn(accept: Accept): (s: string) => boolean {
  if (typeof accept === 'function') return accept
  const list = Array.isArray(accept) ? accept : [accept]
  return (s) => list.some((re) => re.test(s))
}

/** Petits constructeurs pour écrire la banque de questions d'un thème. */
export function themeBuilder(theme: ThemeId) {
  const list: Question[] = []
  return {
    list,
    /** La première option est la bonne réponse ; l'ordre est mélangé à l'affichage. */
    mcq(q: string, options: string[], explain: string): void {
      const item: Mcq = { kind: 'mcq', theme, q, options, answer: 0, explain }
      list.push(item)
    },
    cmd(q: string, solution: string, accept: Accept, explain: string): void {
      const item: Cmd = { kind: 'cmd', theme, q, solution, accept: toFn(accept), explain }
      list.push(item)
    },
    order(q: string, steps: string[], explain: string): void {
      const item: Order = { kind: 'order', theme, q, steps, explain }
      list.push(item)
    },
  }
}
