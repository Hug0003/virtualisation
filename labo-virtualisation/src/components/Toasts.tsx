export interface Toast {
  id: number
  title: string
  text: string
}

/** Notifications éphémères : XP gagnée, niveau supérieur, badge obtenu. */
export default function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} type="button" className="toast" onClick={() => onDismiss(t.id)}>
          <span className="toast-title">{t.title}</span>
          <span className="toast-text">{t.text}</span>
        </button>
      ))}
    </div>
  )
}
