import { useCallback, useEffect, useState } from 'react'
import { initScroll, ScrollTrigger } from './lib/scroll'
import { initReveals } from './lib/reveals'
import Preloader from './components/Preloader'
import Nav from './components/Nav'
import Curtain from './components/Curtain'
import Story from './components/Story'
import Marquee from './components/Marquee'
import About from './components/About'
import HowItWorks from './components/HowItWorks'
import Areas from './components/Areas'
import Reviews from './components/Reviews'
import FAQ from './components/FAQ'
import Order from './components/Order'
import Footer from './components/Footer'

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    history.scrollRestoration = 'manual'
    scrollTo(0, 0)
    initScroll()
    const kill = initReveals()
    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(document.body)
    return () => (kill(), ro.disconnect())
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', !ready)
    if (ready && location.hash && location.hash.length > 1) setTimeout(() => window.dispatchEvent(new CustomEvent('tx:go', { detail: location.hash })), 100)
  }, [ready])

  return (
    <>
      <Preloader onDone={done} />
      <Curtain />
      <Nav />
      <main id="main">
        <Story started={ready} />
        <Marquee />
        <About />
        <HowItWorks />
        <Areas />
        <Reviews />
        <FAQ />
        <Order />
      </main>
      <Footer />
    </>
  )
}
