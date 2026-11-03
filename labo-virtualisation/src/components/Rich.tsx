/** Affiche un texte où les passages entre [[ ]] sont du code. */
export default function Rich({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/g)
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>))}
    </>
  )
}
