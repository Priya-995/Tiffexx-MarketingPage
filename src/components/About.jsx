import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion, isCoarse } from '../lib/env'
import Split from './Split'
import Mascot from './Mascot'

const STATEMENT =
  'Tiffexx is home-style food with a little attitude. Real ghar jaisa khana. Packed in a thali and sent across Ghaziabad, Noida and Greater Noida — so lunch tastes like home, wherever you happen to be.'

const CREW = [
  { name: 'thali', title: 'The Full Thali', line: 'Brings the whole meal. Doesn’t do half measures.', says: 'Sab kuch, ek saath.', tone: 'maroon' },
  { name: 'rice', title: 'Chill Chawal', line: 'Fluffy, unbothered, goes with literally everything.', says: 'Cool rehne ka.', tone: 'yellow' },
  { name: 'roti', title: 'Roti Rockstar', line: 'Soft, folded, a little charred around the edges.', says: 'Garam hai, sambhal ke!', tone: 'orange' },
]

const FOR = ['desk lunches', 'hostel dinners', 'PG nights', 'late shifts', 'homesick foodies', 'busy homes']

function CrewCard({ c, i }) {
  const card = useRef()
  const onMove = (e) => {
    if (prefersReducedMotion() || isCoarse()) return
    const r = card.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(card.current, { rotateY: x * 14, rotateX: -y * 10, duration: 0.6, ease: 'power3.out' })
    gsap.to(card.current.querySelector('.mascot'), { x: x * 24, y: y * 16, duration: 0.6, ease: 'power3.out' })
  }
  const onLeave = () => {
    gsap.to(card.current, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
    gsap.to(card.current.querySelector('.mascot'), { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
  }
  return (
    <article className={`crew-card is-${c.tone}`} style={{ '--d': i }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="crew-inner" ref={card}>
        <div className="crew-arch" aria-hidden="true" />
        <p className="crew-bubble hand" aria-hidden="true">
          “{c.says}”
        </p>
        <Mascot name={c.name} sizes="(max-width: 820px) 70vw, 28vw" />
        <div className="crew-plinth" aria-hidden="true" />
      </div>
      <h3>{c.title}</h3>
      <p>{c.line}</p>
    </article>
  )
}

export default function About() {
  const root = useRef()
  const [w, setW] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setW((x) => (x + 1) % FOR.length), 1900)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.statement .word',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top 80%', end: 'bottom 45%', scrub: true } }
      )
      gsap.from('.crew-card', {
        y: 120,
        rotate: (i) => [-6, 3, 7][i],
        autoAlpha: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.crew', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="about" id="about" ref={root}>
      <div className="container">
        <p className="eyebrow hand">Hi, we’re Tiffexx</p>
        <p className="statement">
          {STATEMENT.split(' ').map((word, i) => (
            <span key={i} className={`word ${/Real|home/.test(word) ? 'is-hl' : ''}`}>
              {word}{' '}
            </span>
          ))}
        </p>

        <div className="crew-head">
          <Split text={'Meet the *crew.*'} className="display h-xl" />
          <p className="crew-note" data-reveal="">Three characters, one tiffin. Hover to say hi.</p>
        </div>
        <div className="crew">
          {CREW.map((c, i) => (
            <CrewCard key={c.name} c={c} i={i} />
          ))}
        </div>

        <div className="made-for" data-reveal="">
          <span>Made for</span>
          <span className="made-for-swap" aria-live="off">
            {FOR.map((f, i) => (
              <span key={f} className={i === w ? 'is-on' : i === (w + FOR.length - 1) % FOR.length ? 'is-out' : ''} aria-hidden={i !== w}>
                {f}
              </span>
            ))}
          </span>
          <span className="sr-only">{FOR.join(', ')}</span>
        </div>
      </div>
    </section>
  )
}
