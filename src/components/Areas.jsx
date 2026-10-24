import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { prefersReducedMotion, asset } from '../lib/env'
import Split from './Split'

export default function Areas() {
  const root = useRef()

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.map-tilt',
        { rotateX: 38, scale: 0.88, y: 80 },
        { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.map-wrap', start: 'top bottom', end: 'center 60%', scrub: 0.6 } }
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="areas" id="areas" ref={root}>
      <div className="container">
        
          <Split text={'Now serving *3 cities.*'} className="display h-xl" />
        

        <div className="map-wrap">
          <div className="map-tilt">
            <img
              className="map-img"
              src={asset('service-map-sm.png')}
              srcSet={`${asset('service-map-sm.png')} 900w, ${asset('service-map-sm.png')} 1821w`}
              sizes="100vw"
              width="1821"
              height="864"
              alt="Tiffexx service map showing Ghaziabad, Noida and Greater Noida, connected by a dotted delivery route"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  )
}