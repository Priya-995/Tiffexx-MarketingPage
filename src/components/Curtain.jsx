import { useEffect, useRef } from 'react'
import { gsap, jumpTo, scrollToTarget } from '../lib/scroll'
import { prefersReducedMotion, asset } from '../lib/env'

/**
 * Section-to-section "page transition": two brand panels wipe across,
 * we jump while covered, then they wipe away. Triggered via
 * window.dispatchEvent(new CustomEvent('tx:go', { detail: '#faq' })).
 */
export default function Curtain() {
  const root = useRef()
  const busy = useRef(false)
  useEffect(() => {
    const go = (e) => {
      const hash = e.detail
      if (prefersReducedMotion()) return scrollToTarget(hash)
      if (busy.current) return
      busy.current = true
      const panels = root.current.querySelectorAll('.curtain-panel')
      const logo = root.current.querySelector('.curtain-logo')
      gsap
        .timeline({ onComplete: () => (busy.current = false) })
        .set(root.current, { visibility: 'visible' })
        .fromTo(panels, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'power4.inOut', stagger: 0.08 })
        .fromTo(logo, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, '-=0.2')
        .add(() => {
          jumpTo(hash)
          scrollToTarget(hash, { focusOnly: true })
        })
        .to(logo, { autoAlpha: 0, duration: 0.2 }, '+=0.12')
        .to(panels, { yPercent: -100, duration: 0.6, ease: 'power4.inOut', stagger: -0.08 })
        .set(root.current, { visibility: 'hidden' })
    }
    window.addEventListener('tx:go', go)
    return () => window.removeEventListener('tx:go', go)
  }, [])
  return (
    <div className="curtain" ref={root} aria-hidden="true">
      <div className="curtain-panel is-yellow" />
      <div className="curtain-panel is-maroon">
        <img className="curtain-logo" src={asset('tiffexx-logo.png')} alt="" width="700" height="170" />
      </div>
    </div>
  )
}

export const go = (hash) => window.dispatchEvent(new CustomEvent('tx:go', { detail: hash }))
