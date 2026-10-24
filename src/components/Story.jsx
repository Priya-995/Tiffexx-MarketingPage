import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { isSmall, prefersReducedMotion, isCoarse, asset } from '../lib/env'

import { Curves, Eyes } from './HeroDecor'
import './big-cursor.css' // larger arrow/hand cursor for the whole page (same shapes, just bigger)
import './story-hero.css'
import './tfx-hero.css' // new hero (replaces the old thali hero)
import './sub-phones.css' // phone mockups that replace the old ticket card
import './story-layout.css' // keep this LAST

/*
 * Layer map (each layer owns its own transform so GSAP tweens never fight):
 *
 *  .tfx-hero              scroll fade-out                    (y, autoAlpha)
 *    .tfx-checker         intro slide-in
 *    .tfx-canvas          fixed 3:2 composition box (cqw units)
 *      .tfx-cta           store badges (intro glide on each .tfx-cta-btn)
 *      .tfx-title         pointer parallax (x, y)            -> each img has its own intro
 *        img.tfx-headline    "Home-cooked Comfort" + cloud + stars
 *        img.tfx-onrepeat    "On Repeat" + smiley
 *        svg.tfx-eyes        googly eyes, pupils follow the cursor
 *      .tfx-char          pointer parallax (x, y)
 *        .tfx-char-float  idle bob                           (y, rotate)
 *          img            intro drop-in                      (y, rotation, autoAlpha)
 *
 *  .sub-phones            scroll in/out wrapper              (y, autoAlpha)
 *    .sub-phone           one per step, swapped by CSS state (is-active / is-past / is-next)
 */

// Artwork cut-outs: save these (transparent PNGs) in your assets folder under these names
const ART = {
  headline: 'hero-headline.png',
  onRepeat: 'hero-onrepeat.png',
  char: 'hero-character.png',
}

const APP_LINKS = [
  {
    label: 'Download on the App Store',
    img: 'badge-app-store.avif',
    href: 'https://apps.apple.com/in/app/tiffexx/id6769454054',
  },
  {
    label: 'Get it on Google Play',
    img: 'badge-google-play.avif',
    href: 'https://play.google.com/store/apps/details?id=com.tiffexx.user',
  },
]

// One mockup per step (index matches STEPS). Save the three screenshots in your assets folder.
const STEPS = [
  {
    t: 'Find kitchens near you',
    d: "Browse trusted local kitchens and see what's on their menu.",
    shot: 'mockup-1-kitchens.png',
    alt: 'Tiffexx app: list of nearby tiffin partners with Order Now and Subscribe buttons',
  },
  {
    t: 'Pick your plan',
    d: 'Choose lunch or dinner, and the days you want them.',
    shot: 'mockup-2-plans.png',
    alt: 'Tiffexx app: meal plans with daily price and a Subscribe Now button',
  },
  {
    t: 'Open the door',
    d: 'Your fresh meal arrives at your doorstep. Eat, smile, repeat.',
    shot: 'mockup-3-delivered.png',
    alt: 'Tiffexx app: order tracking screen showing the meal as delivered',
  },
]

export default function Story({ started = true }) {
  const root = useRef()
  const intro = useRef(null)
  const [active, setActive] = useState(-1)
  const [small] = useState(() => isSmall() || isCoarse())
  const reduced = prefersReducedMotion()

  /* 1. Paused intro timeline (built before first paint, so nothing flashes) */
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

      tl.from('.tfx-checker', { xPercent: -18, yPercent: 12, autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 0)
        .from('.tfx-curve', { strokeDashoffset: 1, duration: 1.8, stagger: 0.08, ease: 'power1.inOut' }, 0.1)
        // headline block rises into place
        .from('.tfx-headline', { y: 70, scale: 0.95, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2 }, 0.25)
        // "On Repeat" follows, then the eyes pop
        .from('.tfx-onrepeat', { y: 40, scale: 0.9, autoAlpha: 0, transformOrigin: '50% 100%', duration: 0.9 }, 0.85)
        .from('.tfx-eyes', { scale: 0, rotation: -12, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(1.8)' }, 1.05)
        // store badges glide in under "On Repeat"
        .from('.tfx-cta-btn', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 1.4)
        // character drops in last
        .from('.tfx-char img', { y: 90, rotation: 8, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2 }, 0.6)

      intro.current = tl
    }, root)
    return () => {
      intro.current = null
      ctx.revert()
    }
  }, [reduced])

  // play the intro once the artwork is decoded, so it never janks
  useEffect(() => {
    if (!started || reduced) return
    let off = false
    const go = () => !off && intro.current?.play()
    const imgs = [...(root.current?.querySelectorAll('.tfx-canvas img') ?? [])]
    Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null))).then(go, go)
    return () => {
      off = true
    }
  }, [started, reduced])

  /* 2. Scroll: hero fades out, then the subscription steps + phone mockups */
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          // dish list starts only after the hero has left (~0.40)
          if (s.progress > 0.4) {
            const p = Math.min(1, Math.max(0, (s.progress - 0.4) / 0.48))
            setActive(Math.min(2, Math.floor(p * 3)))
          } else {
            setActive(-1)
          }
        },
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? true : 1.4,
          invalidateOnRefresh: true,
        },
      })

      tl
        // hero leaves gently
        .to('.tfx-hero', { autoAlpha: 0, y: -50, duration: 0.22, ease: 'power1.in' }, 0.06)

        // subscription section: copy on the left, phone mockups on the right
        .fromTo('.inside-copy', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.34)
        .fromTo('.sub-phones', { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.4)
        .to('.inside-bar i', { scaleY: 1, duration: 0.48 }, 0.4)

        // exit
        .to('.inside-copy', { autoAlpha: 0, y: -60, duration: 0.08 }, 0.9)
        .to('.sub-phones', { autoAlpha: 0, y: 80, duration: 0.08 }, 0.9)
        .set({}, {}, 1)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  /* 3. Idle motion: the character only, gentle and 2D */
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.to('.tfx-char-float', { y: -6, rotate: 1, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  /* 4. Pointer: layered parallax (title, decor and character move at different depths) */
  useEffect(() => {
    if (reduced || small || !root.current) return
    const layers = [
      ['.tfx-title', 10, 6],
      ['.tfx-char', 12, 7], // same direction as the title so the mascot stays tucked beside the "t"
    ]
      .map(([sel, ax, ay]) => {
        const node = root.current.querySelector(sel)
        if (!node) return null
        const opts = { duration: 1.1, ease: 'power3.out' }
        return { x: gsap.quickTo(node, 'x', opts), y: gsap.quickTo(node, 'y', opts), ax, ay }
      })
      .filter(Boolean)

    const move = (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1
      const y = (e.clientY / innerHeight) * 2 - 1
      layers.forEach((l) => {
        l.x(-x * l.ax)
        l.y(-y * l.ay)
      })
    }
    const leave = () => layers.forEach((l) => (l.x(0), l.y(0)))

    window.addEventListener('pointermove', move)
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [reduced, small])

  /* 5. Eyes: pupils slide inside the whites toward the cursor */
  useEffect(() => {
    if (reduced || small || !root.current) return
    const eyes = [...root.current.querySelectorAll('.tfx-eye')]
    const pupils = [...root.current.querySelectorAll('.tfx-pupil')]
    if (!eyes.length || eyes.length !== pupils.length) return

    // resting offset of each pupil (matches the circles drawn in HeroDecor) and how far it may
    // travel inside its eye (eye radius - pupil radius - outline), in SVG units
    const rest = [{ x: 9, y: 0 }, { x: 7, y: 2 }]
    const reach = [{ x: 23, y: 27 }, { x: 19, y: 23 }]
    const opts = { duration: 0.35, ease: 'power3.out' }
    const to = pupils.map((p) => ({ x: gsap.quickTo(p, 'x', opts), y: gsap.quickTo(p, 'y', opts) }))

    const look = (e) => {
      eyes.forEach((eye, i) => {
        const r = eye.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const dist = Math.hypot(dx, dy) || 1
        const t = Math.min(1, dist / 180) // pupils settle toward centre when the cursor is close
        to[i].x((dx / dist) * reach[i].x * t - rest[i].x)
        to[i].y((dy / dist) * reach[i].y * t - rest[i].y)
      })
    }
    const away = () => to.forEach((q) => (q.x(0), q.y(0)))

    window.addEventListener('pointermove', look)
    document.addEventListener('mouseleave', away)
    return () => {
      window.removeEventListener('pointermove', look)
      document.removeEventListener('mouseleave', away)
      gsap.set(pupils, { x: 0, y: 0 })
    }
  }, [reduced, small])

  const step = active >= 0 ? STEPS[active] : null

  // state of each phone relative to the current step: waiting below, showing, or already gone above
  const phoneState = (i) => (active < 0 || i > active ? 'is-next' : i === active ? 'is-active' : 'is-past')

  return (
    <>
      <section className="story" id="top" ref={root} aria-label="Tiffexx — introduction">
        <span className="anchor" id="inside" style={{ top: '136vh' }} />
        <div className="story-stage">
          {/* ---------- HERO (matches the reference design) ---------- */}
          <div className="tfx-hero">
            <Curves className="tfx-curves" />
            <div className="tfx-checker" aria-hidden="true" />

            <div className="tfx-canvas">
              <div className="tfx-title">
                <h1 className="tfx-sr">Home-cooked Comfort. On Repeat.</h1>
                <img className="tfx-headline" src={asset(ART.headline)} alt="" aria-hidden="true" decoding="async" draggable="false" />
                <img className="tfx-onrepeat" src={asset(ART.onRepeat)} alt="" aria-hidden="true" decoding="async" draggable="false" />
                <Eyes className="tfx-eyes" />
              </div>

              <div className="tfx-cta">
                {APP_LINKS.map((a) => (
                  <a key={a.label} className="tfx-cta-btn" href={a.href} target="_blank" rel="noopener noreferrer" aria-label={a.label}>
                    <img src={asset(a.img)} alt={a.label} draggable="false" />
                  </a>
                ))}
              </div>

              <div className="tfx-char">
                <div className="tfx-char-float">
                  <img
                    src={asset(ART.char)}
                    alt="Tiffexx thali mascot wearing sunglasses"
                    loading="eager"
                    decoding="async"
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Subscription: steps reveal on scroll ---------- */}
          <div className="inside-copy container" aria-live="polite">
            <p className="eyebrow">Subscription</p>
            <h2 className="display inside-title">
              Subscribe once.{' '}
              <br />
              <em>Eat every day.</em>
            </h2>

            <div className="inside-item" key={step ? active : 'none'}>
              {step ? (
                <>
                  <span className="inside-num">0{active + 1} / 03</span>
                  <h3>{step.t}</h3>
                  <p>{step.d}</p>
                </>
              ) : (
                <p className="inside-hint">Keep scrolling — set up your meal.</p>
              )}
            </div>

            <div className="inside-bar" aria-hidden="true">
              <i />
            </div>
          </div>

          {/* App mockups on the right: one per step, swapped as you scroll */}
          <div className="sub-phones" aria-hidden="true">
            {STEPS.map((s, i) => (
              <figure key={s.shot} className={`sub-phone ${phoneState(i)}`}>
                <img src={asset(s.shot)} alt={s.alt} loading="eager" decoding="async" draggable="false" />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}