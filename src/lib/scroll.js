import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { prefersReducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initScroll() {
  if (prefersReducedMotion() || lenis) return lenis
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis && lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function stopScroll(stop) {
  if (!lenis) {
    document.documentElement.style.overflow = stop ? 'hidden' : ''
    return
  }
  stop ? lenis.stop() : lenis.start()
}

/** Smooth-scroll to a hash / element and move focus there for keyboard + screen-reader users. */
export function scrollToTarget(target, { offset = 0, focusOnly = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  const done = () => {
    const focusEl = el.querySelector('[data-focus-target]') || el
    if (!focusEl.hasAttribute('tabindex')) focusEl.setAttribute('tabindex', '-1')
    focusEl.focus({ preventScroll: true })
  }
  if (focusOnly) done()
  else if (lenis) lenis.scrollTo(el, { offset, duration: 1.6, onComplete: done })
  else {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    done()
  }
  if (typeof target === 'string' && target.startsWith('#')) history.replaceState(null, '', target)
}

export { gsap, ScrollTrigger }

/** Instant jump (used behind the curtain transition). */
export function jumpTo(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { immediate: true, force: true })
  else el.scrollIntoView({ behavior: 'auto' })
  ScrollTrigger.update()
}
