import { asset } from '../lib/env'

const M = {
  thali: { w: 1000, h: 675, sm: 500, alt: 'Tiffexx thali mascot in sunglasses giving a thumbs up' },
  'thali-character': { w: 1000, h: 1000, sm: 500, alt: 'Tiffexx 3D round thali mascot with sunglasses and sneakers' },
  rice: { w: 800, h: 819, sm: 400, alt: 'Tiffexx rice bowl mascot in sunglasses and sneakers, pointing' },
  roti: { w: 700, h: 850, sm: 350, alt: 'Tiffexx roti mascot in sunglasses and sneakers, pointing' },
}

/** Responsive, lazy-loaded cut-out mascot image. Pass decorative to hide from screen readers. */
export default function Mascot({ name, className = '', sizes = '(max-width: 820px) 50vw, 30vw', eager, decorative, flip, ...rest }) {
  const m = M[name] || M.thali
  const base = name === 'thali-character' ? 'thali-character' : `mascot-${name}`
  return (
    <img
      className={`mascot mascot-${name} ${flip ? 'is-flipped' : ''} ${className}`}
      src={asset(`${base}.webp`)}
      srcSet={`${asset(`${base}-sm.webp`)} ${m.sm}w, ${asset(`${base}.webp`)} ${m.w}w`}
      sizes={sizes}
      width={m.w}
      height={m.h}
      alt={decorative ? '' : m.alt}
      aria-hidden={decorative ? 'true' : undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      {...rest}
    />
  )
}
