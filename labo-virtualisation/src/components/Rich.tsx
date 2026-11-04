/** Affiche un texte où les passages entre [[ ]] sont du code, et ceux entre ** ** en gras. */
export default function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[\[.+?\]\]|\*\*.+?\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[[') && part.endsWith(']]')) return <code key={i}>{part.slice(2, -2)}</code>
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
