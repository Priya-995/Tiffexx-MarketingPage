import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { isSmall, prefersReducedMotion, isCoarse, asset } from '../lib/env'

import Mascot from './Mascot'
import './story-hero.css'
import './story-layout.css' // keep this LAST

/*
 * Layer map (each layer owns its own transform so GSAP tweens never fight):
 *
 *  .tfx-copy              scroll fade-out           (y, autoAlpha)
 *    .tfx-title           pointer parallax          (x, y)
 *      .ch                 typing reveal             (autoAlpha)
 *  .story-thali-wrap       scroll: slide to the right (x, scale, rotation)
 *    .story-orbit          intro pop-in              (scale, y, rotation, autoAlpha)
 *      .story-thali-float  idle bob                  (y, rotate)
 *        .story-tilt       pointer tilt (subtle)     (x, y, rotationX/Y/Z)
 *
 * Only ONE small perspective lives on .story-tilt. No nested perspectives
 * and no 360° spin, which is what was stretching the character.
 */

// remove: import { THALI } from '../content'
// remove: const ORDER = [...]  and  const byId = ...

const STEPS = [
  { t: 'Find kitchens near you', d: "Browse trusted local kitchens and see what's on their menu." },
  { t: 'Pick your plan', d: 'Choose lunch or dinner, and the days you want them.' },
  { t: 'Open the door', d: 'Your fresh meal arrives at your doorstep. Eat, smile, repeat.' },
]
const TICKET_ROWS = ['Lunch', 'Dinner']

const SPLATS = [
  { l: 2, t: 36, s: 5, c: '#f0a019' },
  { l: 4.5, t: 62, s: 4.5, c: '#d6431b' },
  { l: 33, t: 54, s: 4.5, c: '#d6431b' },
  { l: 90, t: 80, s: 5, c: '#f2b51c' },
]

// ---- copy on the right (edit freely) ----
const WELCOME = 'Ghar jaisa khana dhoondh rahe the na? Aao, Tiffexx mein swagat hai!” 🧡!'
const HEAD_1 = 'Home-Cooked Comfort.'
const HEAD_2 = 'On Repeat.'
const SUB = 'Your everyday meal, sorted.'

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

// types out letter by letter; words stay whole so paragraphs wrap normally
const Type = ({ text, g, step }) =>
  text.split(' ').map((w, wi) => (
    <Fragment key={wi}>
      {wi > 0 && ' '}
      <span className="tfx-w" aria-hidden="true">
        {[...w].map((c, i) => (
          <span className="tfx-ch" data-g={g} data-step={step} key={i}>
            {c}
          </span>
        ))}
      </span>
    </Fragment>
  ))

export default function Story({ started = true }) {
  const root = useRef()
  const intro = useRef(null)
  const [active, setActive] = useState(-1)
  const [small] = useState(() => isSmall() || isCoarse())
  const reduced = prefersReducedMotion()

  /* 1. Base state + paused intro timeline (built before first paint) */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.story-badge', { rotation: -6 })
      gsap.set('.story-tilt', { transformPerspective: 2400, transformOrigin: '50% 55%' })

      const chars = gsap.utils.toArray('.tfx-ch')
      const setCaret = (c) => {
        chars.forEach((x) => x.classList.remove('is-cur'))
        c.classList.add('is-cur')
      }

      if (reduced) {
        setCaret(chars[chars.length - 1])
        return
      }

      gsap.set(chars, { autoAlpha: 0 })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

      // 1) character pops in: plain scale + settle + tiny rotation (no 3D = no stretching)
      tl.from('.story-orbit', { scale: 0.7, y: 50, rotation: -10, autoAlpha: 0, duration: 1.1, ease: 'power3.out' }, 0)
        .from('.story-wave', { yPercent: 100, duration: 1.2 }, 0.2)
        .from('.story-ground', { scaleX: 0, scaleY: 0, duration: 0.7 }, 0.7)
        .from('.story-splat', { scale: 0, duration: 0.9, stagger: 0.1, ease: 'elastic.out(1, 0.5)' }, 0.8)
        .from('.story-badge img', { scale: 0, rotation: -30, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 1.0)
        .from('.story-flower', { scale: 0, rotation: -120, duration: 0.9, ease: 'back.out(1.6)' }, 1.0)

      // 2) welcome → headline → about types out in order, caret follows the latest letter
      let t = 0.9
      let lastG = null
      chars.forEach((c) => {
        if (lastG !== null && c.dataset.g !== lastG) t += 0.3 // breath between blocks
        lastG = c.dataset.g
        tl.set(c, { autoAlpha: 1 }, t)
        tl.call(setCaret, [c], t)
        t += parseFloat(c.dataset.step)
      })

      // 3) the download card glides in once the text is done
     // 3) subheadline, then the store badges, glide in once the headline is typed
tl.from('.tfx-sub', { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out' }, t + 0.05)
tl.from('.tfx-dl', { autoAlpha: 0, y: 28, duration: 0.9, ease: 'power3.out' }, t + 0.35)

      intro.current = tl
    }, root)
    return () => {
      intro.current = null
      ctx.revert()
    }
  }, [reduced])

  // play the intro only once the character image is decoded, so it never janks
  useEffect(() => {
    if (!started) return
    let off = false
    const go = () => !off && intro.current?.play()
    const img = root.current?.querySelector('.story-thali')
    if (img?.decode) img.decode().then(go, go)
    else go()
    return () => {
      off = true
    }
  }, [started, reduced])

  /* 2. Scroll: headline fades, thali glides to the RIGHT, then the dish list */
  /* 2. Scroll: headline fades, thali glides RIGHT (slow + eased), then the dish list */
useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        // dish list starts only after the glide has finished (~0.40)
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
        scrub: reduced ? true : 1.4,        // more "weight" = smoother catch-up
        invalidateOnRefresh: true,
      },
    })

    tl
      // 1) text + decorations fade out first, gently
      .to('.tfx-copy', { autoAlpha: 0, y: -50, duration: 0.14, ease: 'power1.in' }, 0.06)
      .to('.story-badge', { autoAlpha: 0, scale: 0.6, duration: 0.12 }, 0.06)
      .to('.story-wave, .story-flower, .story-splat, .story-ground', { autoAlpha: 0, duration: 0.14 }, 0.06)

      // 2) the glide: long, soft in/out, starts while the text is leaving
      .to(
        '.story-thali-wrap',
        {
          x: () => (window.innerWidth > 820 ? window.innerWidth * 0.5 : 0),
          scale: 0.92,
          rotation: 6,
          duration: 0.34,
          ease: 'sine.inOut',
          force3D: true,
        },
        0.12
      )
      .to('.story-glow', { scale: 1.6, xPercent: 30, duration: 0.34, ease: 'sine.inOut' }, 0.12)

      // 3) "What's inside" arrives once the character has nearly landed
      .fromTo('.inside-copy', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.34)
     .fromTo('.sub-ticket', { autoAlpha: 0, y: 80, rotate: 8 }, { autoAlpha: 1, y: 0, rotate: 3, duration: 0.12, ease: 'power2.out' }, 0.4)
      .to('.inside-bar i', { scaleY: 1, duration: 0.48 }, 0.4)

      // exit
      .to('.inside-copy', { autoAlpha: 0, y: -60, duration: 0.08 }, 0.9)
     .to('.sub-ticket', { autoAlpha: 0, y: 80, duration: 0.08 }, 0.9)
      .set({}, {}, 1)
  }, root)
  return () => ctx.revert()
}, [reduced])
  /* 3. Idle motion (gentle, 2D only) */
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.to('.story-thali-float', { y: -10, rotate: 1, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  /* 4. Pointer: subtle tilt + parallax */
  useEffect(() => {
    if (reduced || small || !root.current) return
    const el = (s) => root.current.querySelector(s)
    const tilt = el('.story-tilt')
    const title = el('.tfx-stack')
    const sheen = el('.story-sheen')
    if (!tilt) return

    const qt = (target, prop, duration = 0.9) => gsap.quickTo(target, prop, { duration, ease: 'power3.out' })
    const tX = qt(tilt, 'x')
    const tY = qt(tilt, 'y')
    const tRY = qt(tilt, 'rotationY')
    const tRX = qt(tilt, 'rotationX')
    const hX = title ? qt(title, 'x', 1.1) : null
    const hY = title ? qt(title, 'y', 1.1) : null

    const move = (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1
      const y = (e.clientY / innerHeight) * 2 - 1
      tX(x * 18)
      tY(y * 12)
      tRY(x * 7)
      tRX(-y * 5)
      hX?.(-x * 10)
      hY?.(-y * 6)
      if (sheen) {
        sheen.style.setProperty('--mx', `${(1 - (x + 1) / 2) * 100}%`)
        sheen.style.setProperty('--my', `${(1 - (y + 1) / 2) * 100}%`)
      }
    }
    const leave = () => {
      tX(0)
      tY(0)
      tRY(0)
      tRX(0)
      hX?.(0)
      hY?.(0)
      if (sheen) {
        sheen.style.setProperty('--mx', '35%')
        sheen.style.setProperty('--my', '25%')
      }
    }
    window.addEventListener('pointermove', move)
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [reduced, small])

 const step = active >= 0 ? STEPS[active] : null
  const thaliSrc = asset('thali-character.png')

  return (
    <>
      <section className="story" id="top" ref={root} aria-label="Tiffexx — introduction">
        <span className="anchor" id="inside" style={{ top: '136vh' }} />
        <div className="story-stage">

          {/* headline: right half, vertically centred with the character */}
          <div className="tfx-copy">
            <div className="tfx-stack">
              {/* <p className="tfx-welcome" aria-label={WELCOME}>
                <Type text={WELCOME} g="a" step={0.045} />
              </p> */}

              <h1 className="tfx-title" aria-label="Ghar ka pyaar, har thali mein.">
  <span className="tfx-line">
    <Type text={HEAD_1} g="b" step={0.06} />
  </span>
  <span className="tfx-line">
    <Type text={HEAD_2} g="b" step={0.06} />
  </span>
</h1>


  

<p className="tfx-sub">{SUB}</p>

<div className="tfx-dl">
  <div className="tfx-dl-btns">
    {APP_LINKS.map((a) => (
      <a key={a.label} className="tfx-dl-btn" href={a.href} target="_blank" rel="noopener noreferrer" aria-label={a.label}>
        <img src={asset(a.img)} alt={a.label} height="56" draggable="false" />
      </a>
    ))}
  </div>
</div>

              
            </div>
          </div>

          {SPLATS.map((s, i) => (
            <span key={i} className="story-splat" aria-hidden="true" style={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.s}vw`, '--c': s.c }} />
          ))}

          {/* 3D Thali character: left half */}
          <div className="story-ground" aria-hidden="true" />
          <div className="story-thali-pos">
            <div className="story-thali-wrap">
              <div className="story-orbit">
                <div className="story-thali-float">
                  <div className="story-tilt">
                    <img
                      src={thaliSrc}
                      srcSet={`${asset('thali-character-sm.webp')} 500w, ${thaliSrc} 1000w`}
                      sizes="(max-width: 820px) 88vw, 44vw"
                      className="story-thali"
                      alt="Tiffexx 3D Thali character in sunglasses, hands on hips"
                      loading="eager"
                      decoding="async"
                      draggable="false"
                    />
                    {!small && (
                      <span
                        className="story-sheen"
                        aria-hidden="true"
                        style={{ WebkitMaskImage: `url(${thaliSrc})`, maskImage: `url(${thaliSrc})` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* "What's inside" dish exploration on scroll */}
          {/* Subscription: steps reveal on scroll */}
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

<aside className="sub-ticket" aria-hidden="true">
  <span className="sub-ticket-clip" />
  <div className="sub-ticket-head">
    <span>TIFFEXX</span>
    <span className={`sub-ticket-badge ${active >= 1 ? 'on' : ''}`}>
      {active >= 1 ? 'Active' : 'Pending'}
    </span>
  </div>
  <h4>Your daily Meal</h4>
 <ul>
  {TICKET_ROWS.map((r, i) => (
    <li key={r} className={active >= 2 || (active === 1 && i === 0) ? 'done' : ''}>
      <span>{r}</span>
      <b>{active >= 2 ? 'Delivered' : active === 1 && i === 0 ? 'Scheduled' : '—'}</b>
    </li>
  ))}
</ul>
  <div className="sub-ticket-total">
    <span className="sub-ticket-tag">TOTAL</span>
    <strong>Ghar Jaisa</strong>
  </div>
  <div className="sub-ticket-barcode" />
  <small>Order. Eat. Repeat.</small>
</aside>
        </div>
      </section>
    </>
  )
}