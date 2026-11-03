/** Nettoie une commande tapée : espaces, sudo en tête, point-virgule final. */
export function normalizeCmd(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/;+$/, '')
    .replace(/^sudo /, '')
    .trim()
}

/** Lit un nombre écrit à la française ou non (« 1 250 », « 1,5 To », « 62 »). */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[\s  ]/g, '').replace(',', '.')
  const match = cleaned.match(/-?\d+(\.\d+)?/)
  return match ? Number.parseFloat(match[0]) : null
}

export function checkNumber(input: string, answer: number, tolerance: number): boolean {
  const value = parseNumber(input)
  return value !== null && Math.abs(value - answer) <= tolerance + 1e-9
}

function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '')
}

export function checkText(input: string, answers: string[]): boolean {
  const value = normalizeText(input)
  return value.length > 0 && answers.some((a) => normalizeText(a) === value)
}

/** Formate un nombre à la française, sans décimales inutiles. */
export function fr(n: number, digits = 2): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: digits })
}
