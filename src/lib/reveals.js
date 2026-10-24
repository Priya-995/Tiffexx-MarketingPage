import { gsap, ScrollTrigger } from './scroll'
import { prefersReducedMotion } from './env'

/** Wires every [data-split] heading and [data-reveal] block on the page to scroll-triggered reveals. */
export function initReveals(root = document) {
  if (prefersReducedMotion()) return () => {}
  const ctx = gsap.context(() => {
    root.querySelectorAll('[data-split]:not([data-split-manual])').forEach((el) => {
      gsap.from(el.querySelectorAll('.split-char'), {
        yPercent: 115,
        rotate: 6,
        duration: 1,
        ease: 'expo.out',
        stagger: el.dataset.split === 'chars' ? 0.022 : 0.07,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    })
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      const kids = el.dataset.reveal === 'stagger' ? el.children : [el]
      gsap.from(kids, {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    })
    root.querySelectorAll('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.parallax) || -20,
        ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
  }, root)
  ScrollTrigger.refresh()
  return () => ctx.revert()
}
