import type { Block } from '../data/course'
import Rich from './Rich'

/** Affiche les blocs d'un écran de leçon. */
export default function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="lesson-blocks">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p':
            return (
              <p key={i}>
                <Rich text={b.text} />
              </p>
            )
          case 'list':
            return (
              <ul key={i}>
                {b.items.map((item, j) => (
                  <li key={j}>
                    <Rich text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'key':
            return (
              <aside key={i} className="callout callout-key">
                <span className="callout-label">À retenir</span>
                <p>
                  <Rich text={b.text} />
                </p>
              </aside>
            )
          case 'analogy':
            return (
              <aside key={i} className="callout callout-analogy">
                <span className="callout-label">Image mentale</span>
                <p>
                  <Rich text={b.text} />
                </p>
              </aside>
            )
          case 'code':
            return (
              <pre key={i} className="lesson-code">
                <code>{b.text}</code>
              </pre>
            )
          case 'table':
            return (
              <div key={i} className="table-wrap">
                <table className="lesson-table">
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} scope="col">
                          <Rich text={h} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k}>
                            <Rich text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      })}
    </div>
  )
}
