import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { REVIEWS } from '../content'
import { prefersReducedMotion } from '../lib/env'
import Split from './Split'
import Mascot from './Mascot'

const DELAY = 1000 // ms each card stays on top

// poses for the cards waiting underneath the top card (depth 1, 2)
const BEHIND = [
  null,
  { y: -22, x: 0, rotate: -3, scale: 0.95, opacity: 1 },
  { y: -44, x: 0, rotate: 3.2, scale: 0.9, opacity: 1 },
]

function Card({ r, num, total }) {
  return (
    <>
      <span className="tst-q" aria-hidden="true">“</span>
      <blockquote>{r.text}</blockquote>
      <footer>
        <span className="tst-avatar" aria-hidden="true">{r.name?.[0]}</span>
        <p>
          <strong>{r.name}</strong>
          {r.area && <span> · {r.area}</span>}
          {r.source && <span> · via {r.source}</span>}
        </p>
        <span className="tst-count" aria-hidden="true">
          {String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </footer>
    </>
  )
}

export default function Reviews() {
  const n = REVIEWS.length
  // the longest review sets the card height, so no text is ever cut off
const longest = REVIEWS.reduce((a, b) => (b.text.length > a.text.length ? b : a), REVIEWS[0])
  const reduced = prefersReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // auto-advance; restarts whenever the active card changes (so clicking a dot never double-jumps)
  useEffect(() => {
    if (reduced || paused || n < 2) return
    const t = setTimeout(() => setActive((a) => (a + 1) % n), DELAY)
    return () => clearTimeout(t)
  }, [active, paused, reduced, n])

  // cards waiting underneath: the 2 that were shown most recently
  const behind = [1, 2]
    .filter((d) => d < n)
    .map((d) => ({ d, i: (active - d + n) % n }))

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="reviews-head">
          <p className="eyebrow">Word on the street</p>
          <Split text={'Straight from\n*the tiffin-eaters.*'} className="display h-xl" />
        </div>

        {n > 0 && (
          <div className="review-empty">
            <div
              className="tst"
              data-reveal=""
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <div className="tst-stage" aria-live="polite">
                 {/* invisible copy of the longest card: gives the stage its height */}
  <article className="tst-card tst-sizer" aria-hidden="true">
    <Card r={longest} num={1} total={n} />
  </article>
                {/* waiting cards (stacked behind) */}
                {behind.map(({ d, i }) => (
                  <motion.article
                    key={i}
                    className="tst-card is-behind"
                    aria-hidden="true"
                    initial={{ ...BEHIND[d], opacity: 0 }}
                    animate={BEHIND[d]}
                    transition={{ type: 'spring', stiffness: 150, damping: 22 }}
                  >
                    <Card r={REVIEWS[i]} num={i + 1} total={n} />
                  </motion.article>
                ))}

                {/* newest card lands on top of the pile */}
                <AnimatePresence initial={false}>
                  <motion.article
                    key={active}
                    className="tst-card is-top"
                    initial={reduced ? { opacity: 0 } : { y: 190, x: 70, rotate: 9, scale: 1.04, opacity: 0 }}
                    animate={{ y: 0, x: 0, rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ y: -22, rotate: -3, scale: 0.95, opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
                    transition={{ type: 'spring', stiffness: 110, damping: 19, mass: 0.9 }}
                  >
                    <Card r={REVIEWS[active]} num={active + 1} total={n} />
                  </motion.article>
                </AnimatePresence>
              </div>

              {n > 1 && (
                <div className="tst-nav">
                  <div className="tst-dots" role="tablist" aria-label="Testimonials">
                    {REVIEWS.map((r, i) => (
                      <button
                        key={i}
                        role="tab"
                        aria-selected={i === active}
                        aria-label={`Show review from ${r.name}`}
                        className={i === active ? 'is-on' : ''}
                        onClick={() => setActive(i)}
                      />
                    ))}
                  </div>
                  {!reduced && !paused && (
                    <span className="tst-bar" key={active} style={{ animationDuration: `${DELAY}ms` }} aria-hidden="true" />
                  )}
                </div>
              )}
            </div>

            <Mascot name="rice" className="review-mascot" flip sizes="(max-width: 820px) 50vw, 26vw" />
          </div>
        )}
      </div>
    </section>
  )
}