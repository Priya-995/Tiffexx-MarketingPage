import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion, asset } from '../lib/env'
import Split from './Split'
import './order-panel.css' // maroon panel that sits over the existing yellow background

const STORES = [
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

export default function Order() {
  const root = useRef()

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      // phone rises out of the box: starts tucked inside (clipped by .order-visual) and slides up past the top edge
      gsap.from('.order-phone', {
        yPercent: 70,
        duration: 1.5,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.order-panel', start: 'top 70%' },
      })
      gsap.from('.order-get > *', {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.order-get', start: 'top 85%' },
      })
      gsap.from('.order-panel', {
        y: 60,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.order-panel', start: 'top 90%' },
      })
      // no idle bob on the phone: its bottom edge stays glued to the box so it reads as coming out of it
    }, root)
    return () => ctx.revert()
  }, [])

  // Measure Mockup.png once: find the phone's real top/bottom (ignoring transparent padding and the soft halo)
  // so it sits exactly on the card's bottom edge with nothing cut off, and fits the card height.
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = 200
        const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth))
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0, w, h)
        const d = ctx.getImageData(0, 0, w, h).data
        const rowHas = (y) => {
          for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 200) return true
          return false
        }
        let top = 0
        while (top < h && !rowHas(top)) top++
        let bottom = h - 1
        while (bottom > top && !rowHas(bottom)) bottom--
        if (bottom <= top) return
        const el = root.current
        if (!el) return
        el.style.setProperty('--phone-sink', (((h - 1 - bottom) / h) * 100).toFixed(2) + '%')
        el.style.setProperty('--phone-vis', (((bottom - top + 1) / h) * (img.naturalHeight / img.naturalWidth)).toFixed(3))
      } catch {
        /* keep the CSS fallbacks */
      }
    }
    img.src = asset('Mockup.png')
  }, [])

  return (
    <section className="order" id="order" ref={root}>
      {/* yellow section background stays as it is; this maroon panel sits on top and holds all the content */}
      <div className="container order-wrap">
       <div className="order-panel">
        <div className="order-grid">
          <div className="order-copy">
            <Split text={'Get the Tiffexx app\n*in a tap.*'} className="display h-xl" />
            <p className="order-lede" data-reveal="">
              Browse the menu, pick your plan and get piping-hot home-style tiffins at your door. Download Tiffexx on your phone.
            </p>

            <div className="order-get">
              <div className="order-stores">
                {STORES.map((s) => (
                  <a key={s.label} className="order-store" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    <img src={asset(s.img)} alt={s.label} height="64" draggable="false" />
                  </a>
                ))}
              </div>

              <div className="order-qr">
                <img src={asset('Frame 1171275513.png')} alt="QR code to download the Tiffexx app" width="132" height="132" loading="lazy" />
                <p>
                  <strong>
                    Scan to<br />download
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="order-visual">
            <div className="order-phone">
              <div className="order-phone-float">
                <img
                  src={asset('Frame_3.png')}
                  alt="Tiffexx app home screen showing free delivery and subscription plans"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </div>
       </div>
      </div>
    </section>
  )
}