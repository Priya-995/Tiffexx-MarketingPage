import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FAQS } from '../content'
import Split from './Split'
import Mascot from './Mascot'

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <div className="faq-side">
          <p className="eyebrow">FAQ</p>
          <Split text={'Got\n*questions?*'} className="display h-xl" />
          <p className="faq-side-p" data-reveal="">Fair. Here’s the short version.</p>
          <Mascot name="roti" className="faq-mascot" sizes="(max-width: 820px) 40vw, 18vw" data-parallax="-25" />
        </div>
        <ul className="faq-list" data-reveal="stagger">
          {FAQS.map((f, i) => {
            const on = open === i
            return (
              <li key={i} className={`faq-item ${on ? 'is-open' : ''}`}>
                <h3>
                  <button aria-expanded={on} aria-controls={`faq-${i}`} id={`faq-b-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                    <span>{f.q}</span>
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-${i}`}
                      role="region"
                      aria-labelledby={`faq-b-${i}`}
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
