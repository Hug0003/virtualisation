interface Props {
  count: number
  size?: 'small' | 'large'
}

/** Trois étoiles, dont « count » allumées. */
export default function Stars({ count, size = 'small' }: Props) {
  return (
    <span className={`stars stars-${size}`} role="img" aria-label={`${count} étoile${count > 1 ? 's' : ''} sur 3`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i < count ? 'is-on' : ''} aria-hidden="true">
          <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.5 1.4 6.6L12 17.2l-6 3.3 1.4-6.6-4.9-4.5 6.6-.7z" />
        </svg>
      ))}
    </span>
  )
}
