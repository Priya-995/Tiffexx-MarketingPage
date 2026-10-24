import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion, asset } from '../lib/env'
import Split from './Split'

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
      gsap.from('.order-phone', {
        y: 120,
        rotate: 8,
        autoAlpha: 0,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.order-phone', start: 'top 85%' },
      })
      gsap.from('.order-get > *', {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.order-get', start: 'top 85%' },
      })
      gsap.to('.order-phone-float', { y: -16, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="order" id="order" ref={root}>
      <div className="container order-grid">
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
                <strong>Scan to download</strong>
                <span>Point your phone camera at the code</span>
              </p>
            </div>
          </div>
        </div>

        <div className="order-visual">
          <div className="order-phone">
            <div className="order-phone-float">
              <img
                src={asset('Mockup.png')}
                alt="Tiffexx app home screen showing free delivery and subscription plans"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}