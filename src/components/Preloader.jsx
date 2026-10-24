import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { asset, prefersReducedMotion } from '../lib/env'

/** Brand intro: logo wipes in, counter runs while fonts/images settle, then the curtain lifts. */
export default function Preloader({ onDone }) {
  const root = useRef()
  useEffect(() => {
    const reduced = prefersReducedMotion()
    const counter = { v: 0 }
    const num = root.current.querySelector('.pre-num')
    const ready = Promise.race([
      Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))]),
      new Promise((r) => setTimeout(r, 2600)),
    ])
    let alive = true
    if (reduced) {
      ready.then(() => alive && gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: onDone }))
      return () => (alive = false)
    }
    const ctx = gsap.context(() => {}, root)
    let tl
    ctx.add(() => {
    tl = gsap.timeline()
    tl.from('.pre-logo', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'expo.inOut' })
      .from('.pre-mascot', { yPercent: 120, rotate: (i) => (i ? 18 : -18), duration: 0.8, ease: 'back.out(1.6)', stagger: 0.1 }, '-=0.4')
      .to(counter, { v: 86, duration: 1, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(counter.v)) }, 0)
    })
    const tlDone = new Promise((r) => {
      if (!tl || tl.totalProgress() === 1) {
        r()
      } else {
        tl.eventCallback('onComplete', r)
        setTimeout(r, 1800)
      }
    })

    const safetyTimer = setTimeout(() => {
      if (alive) onDone?.()
    }, 3200)

    Promise.all([ready, tlDone]).then(() => {
      if (!alive) return
      clearTimeout(safetyTimer)
      ctx.add(() =>
        gsap
          .timeline({
            onComplete: () => {
              if (alive) onDone?.()
            },
          })
          .to(counter, { v: 100, duration: 0.3, onUpdate: () => (num.textContent = Math.round(counter.v)) })
          .to('.pre-mascot', { yPercent: 130, duration: 0.5, ease: 'back.in(1.4)', stagger: 0.05 })
          .to('.pre-logo, .pre-count', { autoAlpha: 0, y: -30, duration: 0.4 }, '<')
          .to('.pre-panel', { yPercent: -100, duration: 0.8, ease: 'expo.inOut', stagger: 0.08 }, '-=0.15')
          .set(root.current, { display: 'none' })
      )
    })
    return () => {
      alive = false
      clearTimeout(safetyTimer)
      ctx.revert()
    }
  }, [onDone])
  return (
    <div className="preloader" ref={root} role="status" aria-label="Loading Tiffexx">
      <div className="pre-panel is-yellow" />
      <div className="pre-panel is-maroon">
        <img className="pre-logo" src={asset('tiffexx-logo.png')} alt="Tiffexx" width="700" height="170" />
        <div className="pre-mascots" aria-hidden="true">
          <img className="pre-mascot" src={asset('mascot-rice-sm.webp')} alt="" width="400" height="409" />
          <img className="pre-mascot" src={asset('mascot-roti-sm.webp')} alt="" width="350" height="425" />
        </div>
        <div className="pre-count" aria-hidden="true">
          <span className="pre-num">0</span>
          <span>%</span>
        </div>
      </div>
    </div>
  )
}
