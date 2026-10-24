import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NAV, AREAS } from '../content'
import { asset } from '../lib/env'
import { ScrollTrigger, stopScroll, scrollToTarget } from '../lib/scroll'
import { go } from './Curtain'
import Mascot from './Mascot'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const btn = useRef()
  const panel = useRef()

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        setScrolled(s.scroll() > 40)
        setHidden(s.direction === 1 && s.scroll() > 400)
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    stopScroll(open)
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') {
        // simple focus trap
        const f = panel.current?.querySelectorAll('a,button')
        if (!f?.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
      }
    }
    addEventListener('keydown', onKey)
    setTimeout(() => panel.current?.querySelector('a')?.focus(), 350)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  const close = () => {
    setOpen(false)
    btn.current?.focus()
  }
  const nav = (e, href) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => go(href), open ? 250 : 0)
  }

  return (
    <>
      <a className="skip-link" href="#order" onClick={(e) => (e.preventDefault(), scrollToTarget('#order'))}>
        Skip to ordering
      </a>
      <header className={`nav ${hidden && !open ? 'is-hidden' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
        <a href="#top" className="nav-logo" onClick={(e) => (e.preventDefault(), scrollToTarget('#top'))} aria-label="Tiffexx — back to top">
          <img src={asset('tiffexx-logo.png')} alt="Tiffexx" width="700" height="170" />
        </a>
        <nav className="nav-links" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => nav(e, n.href)}>
              <span data-text={n.label}>{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <a href="#order" className="btn btn-yellow btn-sm" onClick={(e) => (e.preventDefault(), scrollToTarget('#order'))}>
            Order a tiffin
          </a>
          <button
            ref={btn}
            className={`burger ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => (open ? close() : setOpen(true))}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            ref={panel}
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="menu-links" aria-label="Menu">
              {[...NAV, { href: '#order', label: 'Order a tiffin' }].map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => nav(e, n.href)}
                  initial={{ y: 80, opacity: 0, rotate: 4 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <small>0{i + 1}</small>
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <motion.div className="menu-foot" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} exit={{ opacity: 0 }}>
              <p className="hand">Now serving</p>
              <p>{AREAS.map((a) => a.name).join(' · ')}</p>
            </motion.div>
            <motion.div
              className="menu-mascot"
              initial={{ y: 300, rotate: 20 }}
              animate={{ y: 0, rotate: -6 }}
              exit={{ y: 300 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 120, damping: 14 }}
            >
              <Mascot name="roti" decorative sizes="40vw" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
