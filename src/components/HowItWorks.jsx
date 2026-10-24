import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { prefersReducedMotion } from '../lib/env'
import Split from './Split'
import Mascot from './Mascot'

gsap.registerPlugin(MotionPathPlugin)

const STEPS = [
  {
    t: 'Tell us',
    d: 'Pick your area, lunch or dinner, and how often you want it. Takes about a minute.',
    icon: (
      <path d="M8 6h16v20H8zM12 11h8M12 15h8M12 19h5" />
    ),
  },
  {
    t: 'We pack',
    d: 'Your thali gets cooked home-style and packed into a Tiffexx thali.',
    icon: <path d="M6 12h20v12a3 3 0 01-3 3H9a3 3 0 01-3-3zM6 12l2-5h16l2 5M16 4v3" />,
  },
  {
    t: 'You eat',
    d: 'It reaches your door. You put on your sunglasses. (Optional, but recommended.)',
    icon: <path d="M4 14h10v3a5 5 0 01-10 0zM18 14h10v3a5 5 0 01-10 0zM14 15h4" />,
  },
]

export default function HowItWorks() {
  const root = useRef()
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add({ desk: '(min-width: 821px)', mob: '(max-width: 820px)' }, (c) => {
        const path = root.current.querySelector(c.conditions.desk ? '.how-path-d' : '.how-path-m')
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.how-track', start: 'top 70%', end: 'bottom 60%', scrub: 0.8 },
        })
        tl.to(path, { strokeDashoffset: 0, ease: 'none' }, 0).to(
          '.how-runner',
          { motionPath: { path, align: path, alignOrigin: [0.5, 0.75] }, ease: 'none' },
          0
        )
        gsap.utils.toArray('.how-step').forEach((s) => {
          gsap.from(s, { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 85%' } })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="how" id="how" ref={root}>
      <div className="container">
        <div className="how-head">
          <p className="eyebrow">How it works</p>
          <Split text={'Three steps to a\n*full stomach.*'} className="display h-xl" />
        </div>
        <div className="how-track">
          <svg className="how-svg is-desk" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
            <path className="how-path-bg" d="M20 200 C 220 40, 380 40, 600 130 S 980 230, 1180 60" />
            <path className="how-path how-path-d" d="M20 200 C 220 40, 380 40, 600 130 S 980 230, 1180 60" />
          </svg>
          <svg className="how-svg is-mob" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className="how-path-bg" d="M20 0 C 90 200, 10 400, 50 520 S 90 800, 30 1000" />
            <path className="how-path how-path-m" d="M20 0 C 90 200, 10 400, 50 520 S 90 800, 30 1000" />
          </svg>
          <div className="how-runner" aria-hidden="true">
            <Mascot name="thali" decorative sizes="140px" />
          </div>
          <ol className="how-steps">
            {STEPS.map((s, i) => (
              <li className="how-step" key={s.t}>
                <span className="how-num">0{i + 1}</span>
                <svg className="how-icon" viewBox="0 0 32 32" aria-hidden="true">
                  {s.icon}
                </svg>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
