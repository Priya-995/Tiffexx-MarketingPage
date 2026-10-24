import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../lib/scroll'
import { isSmall, isCoarse, prefersReducedMotion } from '../lib/env'

/*
 * Custom cursor for the .story section only (hero + subscription):
 *   - big ring that eases after the pointer, with a small dot that is exact
 *   - ring grows + turns orange over links/buttons, shrinks on press
 *   - a tapered ink trail that fades out behind the pointer
 *   - a ripple on click
 * Disabled on touch/small screens and with prefers-reduced-motion (native cursor stays).
 * Rendered through a portal so ancestor transforms can't break `position: fixed`.
 */

const INK = '61, 9, 5' // rgb of #3d0905 (--tfx-ink)
const LIFE = 650 // ms a trail point lives
const MAX_POINTS = 90
const SCOPE = '.story'
const HOT = 'a, button, [role="button"]'

export default function Cursor() {
  const wrap = useRef(null)
  const ring = useRef(null)
  const dot = useRef(null)
  const cv = useRef(null)
  const [enabled] = useState(() => !(isSmall() || isCoarse() || prefersReducedMotion()))

  useEffect(() => {
    if (!enabled) return
    const html = document.documentElement
    const ringEl = ring.current
    const dotEl = dot.current
    const canvas = cv.current
    const g = canvas.getContext('2d')

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    html.classList.add('tfx-cursor-on')
    gsap.set([ringEl, dotEl], { xPercent: -50, yPercent: -50, autoAlpha: 0 })

    const rx = gsap.quickTo(ringEl, 'x', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(ringEl, 'y', { duration: 0.5, ease: 'power3.out' })
    const dx = gsap.quickTo(dotEl, 'x', { duration: 0.08, ease: 'power2.out' })
    const dy = gsap.quickTo(dotEl, 'y', { duration: 0.08, ease: 'power2.out' })

    const pts = []
    let shown = false
    let painted = false

    const setShown = (v) => {
      if (v === shown) return
      shown = v
      gsap.to([ringEl, dotEl], { autoAlpha: v ? 1 : 0, duration: 0.25, overwrite: 'auto' })
      if (!v) pts.length = 0
    }

    const move = (e) => {
      const over = !!e.target.closest?.(SCOPE)
      if (!over) return setShown(false)
      if (!shown) gsap.set([ringEl, dotEl], { x: e.clientX, y: e.clientY })
      setShown(true)
      rx(e.clientX)
      ry(e.clientY)
      dx(e.clientX)
      dy(e.clientY)
      ringEl.classList.toggle('is-hot', !!e.target.closest(HOT))
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (pts.length > MAX_POINTS) pts.shift()
    }

    const pulse = (x, y) => {
      const s = document.createElement('span')
      s.className = 'tfx-cursor-pulse'
      s.style.left = `${x}px`
      s.style.top = `${y}px`
      wrap.current.appendChild(s)
      gsap.fromTo(s, { scale: 0.3, autoAlpha: 0.8 }, { scale: 2.4, autoAlpha: 0, duration: 0.7, ease: 'power2.out', onComplete: () => s.remove() })
    }
    const down = (e) => {
      if (!e.target.closest?.(SCOPE)) return
      ringEl.classList.add('is-down')
      pulse(e.clientX, e.clientY)
    }
    const up = () => ringEl.classList.remove('is-down')
    const leave = () => setShown(false)

    // trail: tapered, fading line behind the pointer (draws only while there is something to draw)
    const draw = () => {
      const now = performance.now()
      while (pts.length && now - pts[0].t > LIFE) pts.shift()
      if (!pts.length && !painted) return
      g.clearRect(0, 0, w, h)
      painted = pts.length > 1
      g.lineCap = 'round'
      g.lineJoin = 'round'
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const life = 1 - (now - b.t) / LIFE
        g.strokeStyle = `rgba(${INK}, ${0.5 * life})`
        g.lineWidth = 1.5 + 11 * life
        g.beginPath()
        g.moveTo(a.x, a.y)
        g.lineTo(b.x, b.y)
        g.stroke()
      }
    }
    gsap.ticker.add(draw)

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('resize', resize)
    document.addEventListener('mouseleave', leave)
    return () => {
      gsap.ticker.remove(draw)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mouseleave', leave)
      html.classList.remove('tfx-cursor-on')
      gsap.killTweensOf([ringEl, dotEl])
    }
  }, [enabled])

  if (!enabled || typeof document === 'undefined') return null

  return createPortal(
    <div ref={wrap} className="tfx-cursor" aria-hidden="true">
      <canvas ref={cv} className="tfx-cursor-trail" />
      <div ref={ring} className="tfx-cursor-ring">
        <i />
      </div>
      <div ref={dot} className="tfx-cursor-dot" />
    </div>,
    document.body
  )
}