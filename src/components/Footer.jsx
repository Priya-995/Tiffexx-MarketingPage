import { NAV, AREAS, CONTACT } from '../content'
import { asset } from '../lib/env'
import { scrollToTarget } from '../lib/scroll'
import { go } from './Curtain'


const SOCIALS = [
  {
    label: 'Website',
    href: 'https://www.tiffexx.com/home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/tiffexx.com_/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tiffexxindia',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.84v1.54h.06c.53-.96 1.84-1.97 3.78-1.97 4.04 0 4.82 2.56 4.82 5.9V21h-4v-5.1c0-1.22-.02-2.78-1.76-2.78-1.77 0-2.04 1.32-2.04 2.69V21h-4V9.75Z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@Tiffexx',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.22 22 12 22 12s0-3.22-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    ),
  },
]
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer-top">
       <div className="footer-brand">
  <img src={asset('tiffexx-logo.png')} alt="Tiffexx" width="700" height="170" loading="lazy" />

  <ul className="footer-socials" aria-label="Tiffexx on the web">
    {SOCIALS.map((s, i) => (
      <li key={s.label} style={{ '--i': i }}>
        <a
          className="footer-social"
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          data-label={s.label}
        >
          {s.icon}
        </a>
      </li>
    ))}
  </ul>
</div>
        <nav className="footer-col" aria-label="Footer">
          <h4>Explore</h4>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => (e.preventDefault(), go(n.href))}>
              {n.label}
            </a>
          ))}
          <a href="#reviews" onClick={(e) => (e.preventDefault(), go('#reviews'))}>
            Reviews
          </a>
        </nav>
        <div className="footer-col">
          <h4>We deliver to</h4>
          {AREAS.map((a) => (
            <span key={a.id}>{a.name}</span>
          ))}
        </div>
        <div className="footer-col">
          <h4>Say hello</h4>
          {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>}
          {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
          {CONTACT.instagram && (
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
              Instagram ↗
            </a>
          )}
          <a
  href="https://www.tiffexx.com/home"
  target="_blank"
  rel="noopener noreferrer"
>
  Order form →
</a>
        </div>
      </div>
      <div className="footer-giant" aria-hidden="true">
        {'TIFFEXX'.split('').map((c, i) => (
          <span key={i} style={{ '--i': i }}>
            {c}
          </span>
        ))}
      </div>
      <div className="container footer-bottom">
        <p>© {year} Tiffexx. All rights reserved.</p>
        <button className="link" onClick={() => scrollToTarget('#top')}>
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
