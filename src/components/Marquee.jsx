import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { prefersReducedMotion, isCoarse } from '../lib/env'
import Mascot from './Mascot'
import './Marquee.css'

/* ------------------------------------------------------------------
 *  Layout is authored in a 2000 x 696 "design space" that matches the
 *  2125 x 740 reference banner (same aspect ratio). Everything is
 *  expressed as % of the stage, so the composition scales with the viewport.
 * ------------------------------------------------------------------ */
const DW = 2000
const DH = 696

/* Base tilt of each mascot (degrees). Tweak these if your PNGs are posed differently. */
const BASE_ROT = { thali: -6, rice: -2, roti: -16 }

/* ------------------------------------------------------------------
 *  Sweeping ribbon with repeating animated text
 * ------------------------------------------------------------------ */

const REPEAT_COUNT = 16
const REPEATED_ITEMS = Array.from({ length: REPEAT_COUNT }, () => 'TIFFEXX  •  ').join('')

/* Centre-line of the ribbon (fitted to the reference), design space.
 * Runs well past both edges so the mobile crop never shows an end cap. */
const RIBBON_PATH =
  'M -400 614 C -367 611, -267 601, -200 594 C -133 587, -60 580, 0 574 C 60 568, 97 569, 160 558 C 223 547, 293 530, 376 506 C 459 482, 580 435, 659 412 C 738 389, 790 380, 847 370 C 904 360, 935 355, 998 353 C 1061 351, 1147 349, 1224 360 C 1301 371, 1357 390, 1459 417 C 1561 444, 1745 502, 1835 525 C 1925 548, 1939 545, 2000 558 C 2061 571, 2133 587, 2200 602 C 2267 617, 2367 639, 2400 646'

const RIBBON_WIDTH = 152

/* Reference: left edge of the first "T" sits at x ≈ 221 (design space),
 * and one "TIFFEXX  •" repeat spans ≈ 703 units along the curve. */
const FIRST_T_X = 221
const TARGET_UNIT = 703

export default function Marquee() {
  const root = useRef()
  const pathRef = useRef()
  const textPathRef = useRef()
  const textRef = useRef()
  const speedRef = useRef(1.4)
  const velocityRef = useRef(0)

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const coarse = isCoarse()
    const container = root.current
    const pathEl = pathRef.current
    const textPath = textPathRef.current
    const textEl = textRef.current
    if (!container || !pathEl || !textPath || !textEl) return

    let unitLength = TARGET_UNIT
    let base = 0 // startOffset that puts the first "T" at FIRST_T_X
    let offset = 0

    /* Where along the path is x = FIRST_T_X? (binary search; path is monotonic in x) */
    const findBase = () => {
      let lo = 0
      let hi = pathEl.getTotalLength()
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2
        if (pathEl.getPointAtLength(mid).x < FIRST_T_X) lo = mid
        else hi = mid
      }
      return lo
    }

    /* Fit the font size so one repeat matches the reference spacing */
    const fit = () => {
      try {
        let len = textEl.getComputedTextLength() / REPEAT_COUNT
        if (len > 0) {
          const cur = parseFloat(getComputedStyle(textEl).fontSize) || 150
          textEl.style.fontSize = `${(cur * TARGET_UNIT) / len}px`
          len = textEl.getComputedTextLength() / REPEAT_COUNT
          if (len > 0) unitLength = len
        }
      } catch {
        /* SVG text measurement unavailable – keep fallbacks */
      }
      const prevBase = base
      base = findBase()
      offset = offset ? offset - prevBase + base : base
      textPath.setAttribute('startOffset', `${offset}px`)
    }

    fit()
    let cancelled = false
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit()
      })
    }

    /* ── Ribbon text: seamless, scroll-boosted flow ── */
    let rafId
    let running = true

    const tick = () => {
      if (!running) return
      velocityRef.current *= 0.94
      if (Math.abs(velocityRef.current) < 0.01) velocityRef.current = 0

      offset -= speedRef.current + velocityRef.current

      // wrap inside (base - unit, base] so the visible ribbon is never empty
      if (offset <= base - unitLength) offset += unitLength
      else if (offset > base) offset -= unitLength

      textPath.setAttribute('startOffset', `${offset}px`)
      rafId = requestAnimationFrame(tick)
    }

    if (!reduced) rafId = requestAnimationFrame(tick)

    let st
    if (!reduced) {
      st = ScrollTrigger.create({
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 240)
          velocityRef.current = v * 1.8
        },
      })
    }

    /* ── Everything below is scoped to this component ── */
    let onPointerMove
    let onPointerLeave

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(container)
      const thali = q('.marquee-mascot-thali')[0]
      const rice = q('.marquee-mascot-rice')[0]
      const roti = q('.marquee-mascot-roti')[0]
      const mascotFloats = q('.mascot-float')

      // base tilt
      gsap.set(thali, { rotation: BASE_ROT.thali })
      gsap.set(rice, { rotation: BASE_ROT.rice })
      gsap.set(roti, { rotation: BASE_ROT.roti })

      if (reduced) return

      /* Intro: ribbon sweeps up, mascots pop in from their sides */
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from(q('.marquee-svg'), { opacity: 0, y: 70, duration: 1.1 }, 0)
        .from(thali, { xPercent: -35, opacity: 0, scale: 0.8, duration: 1.2, ease: 'back.out(1.5)' }, 0.2)
        .from(rice, { yPercent: -30, opacity: 0, scale: 0.8, duration: 1.2, ease: 'back.out(1.6)' }, 0.35)
        .from(roti, { xPercent: 35, opacity: 0, scale: 0.8, duration: 1.2, ease: 'back.out(1.5)' }, 0.5)

      /* Idle floating (on inner wrappers, so pointer parallax never kills it) */
      const idle = gsap.timeline({ delay: 1.2 })
      const bob = [9, 8, 10]
      const dur = [2.4, 1.9, 2.2]
      mascotFloats.forEach((el, i) => {
        idle.to(el, { y: `-=${bob[i] ?? 8}`, duration: dur[i] ?? 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, i * 0.35)
      })

      /* Pointer parallax across mascots */
      if (coarse) return

      onPointerMove = (e) => {
        if (intro.isActive()) return
        const rect = container.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5

        gsap.to(thali, { x: px * -24, y: py * -16, rotation: BASE_ROT.thali + px * 4, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
        gsap.to(rice, { x: px * 22, y: py * 14, rotation: BASE_ROT.rice + px * -5, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
        gsap.to(roti, { x: px * 26, y: py * 18, rotation: BASE_ROT.roti + px * 6, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
      }

      onPointerLeave = () => {
        gsap.to(thali, { x: 0, y: 0, rotation: BASE_ROT.thali, duration: 1.2, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })
        gsap.to(rice, { x: 0, y: 0, rotation: BASE_ROT.rice, duration: 1.2, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })
        gsap.to(roti, { x: 0, y: 0, rotation: BASE_ROT.roti, duration: 1.2, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })
      }

      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerleave', onPointerLeave)
    }, container)

    return () => {
      cancelled = true
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      if (st) st.kill()
      if (onPointerMove) container.removeEventListener('pointermove', onPointerMove)
      if (onPointerLeave) container.removeEventListener('pointerleave', onPointerLeave)
      ctx.revert()
    }
  }, [])

  return (
    <section className="marquee-banner" id="marquee" ref={root} aria-label="Tiffexx brand marquee: Ghar ka khana, full swag">
      <div className="marquee-stage">
        {/* Ribbon (z-index sits behind the mascots, which stand on it) */}
        <svg className="marquee-svg" viewBox={`0 0 ${DW} ${DH}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <filter id="ribbon-shadow" x="-10%" y="-40%" width="120%" height="200%">
              <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#b98a1a" floodOpacity="0.28" />
            </filter>
            <linearGradient id="ribbon-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd21c" />
              <stop offset="100%" stopColor="#fbc000" />
            </linearGradient>
            <path id="ribbon-curve" ref={pathRef} d={RIBBON_PATH} fill="none" />
          </defs>

          {/* Flat golden ribbon with a soft shadow */}
          <path
            d={RIBBON_PATH}
            stroke="url(#ribbon-grad)"
            strokeWidth={RIBBON_WIDTH}
            fill="none"
            strokeLinecap="butt"
            filter="url(#ribbon-shadow)"
          />

          {/* Flowing typography */}
          <text className="marquee-curved-text" dominantBaseline="central" alignmentBaseline="central" ref={textRef}>
            <textPath ref={textPathRef} href="#ribbon-curve" startOffset="0px">
              {REPEATED_ITEMS}
            </textPath>
          </text>
        </svg>

        {/* Left: Thali */}
        <div className="marquee-mascot marquee-mascot-thali" aria-hidden="true">
          <div className="mascot-float">
            <Mascot name="thali" className="marquee-thali-img" sizes="(max-width: 820px) 45vw, 28vw" decorative />
          </div>
        </div>

        {/* Centre-right: Chill Chawal */}
        <div className="marquee-mascot marquee-mascot-rice" aria-hidden="true">
          <div className="mascot-float">
            <Mascot name="rice" className="marquee-rice-img" sizes="(max-width: 820px) 35vw, 20vw" decorative />
          </div>
        </div>

        {/* Right: Roti Rockstar */}
        <div className="marquee-mascot marquee-mascot-roti" aria-hidden="true">
          <div className="mascot-float">
            <Mascot name="roti" className="marquee-roti-img" sizes="(max-width: 820px) 35vw, 20vw" decorative />
          </div>
        </div>
      </div>
    </section>
  )
}