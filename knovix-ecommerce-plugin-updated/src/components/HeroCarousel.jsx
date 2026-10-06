import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, TruckIcon, CheckCircleIcon, BoxIcon } from './Icons'

const AUTOPLAY_MS = 4500

// Dark "Upgrade Your Everyday Tech" hero (third uploaded theme): near-black
// canvas, lime accent, script-style accent word, product shot inside a thin
// glowing ring, trust badges underneath. Slides fade/slide into each other
// and loop forever on their own; hovering (desktop) or touching pauses it.
export default function HeroCarousel({ slides = [], freeMin = null }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const count = slides.length

  const goTo = useCallback((i) => setActive(((i % count) + count) % count), [count])

  // Auto loop: always advances, wraps from the last slide back to the first.
  useEffect(() => {
    if (count <= 1 || paused) return
    const t = setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [count, paused, active])

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }
  function onTouchEnd(e) {
    if (touchStartX.current != null) {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(dx) > 40) goTo(active + (dx < 0 ? 1 : -1))
    }
    touchStartX.current = null
    setPaused(false)
  }

  const badges = [
    [CheckCircleIcon, '100% Original', 'Genuine products'],
    [BoxIcon, 'Easy Returns', '7 Days'],
    [TruckIcon, 'Free Shipping', freeMin ? `On orders above ₹${freeMin}` : 'On eligible orders'],
    [CheckCircleIcon, 'Secure Checkout', 'Safe & protected']
  ]

  return (
    <div className="relative w-full bg-[#0a1013] text-white overflow-hidden">
      {/* ambient glow + ring, matching the reference's lime-on-black look */}
      <div className="pointer-events-none absolute -right-24 top-0 w-[28rem] h-[28rem] rounded-full bg-lime-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl" />

      <div
        className="relative container-px max-w-7xl mx-auto h-[500px] sm:h-[440px] lg:h-[480px] select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, i) => {
          const on = i === active
          return (
            <div
              key={slide.id}
              aria-hidden={!on}
              className={`absolute inset-0 grid grid-rows-[auto_1fr] sm:grid-rows-1 sm:grid-cols-2 items-center gap-2 sm:gap-6 pt-6 sm:pt-0 transition-all duration-700 ease-out ${
                on ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-6 pointer-events-none'
              }`}
            >
              <div>
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-lime-300">{slide.eyebrow}</p>
                <h2 className="mt-2 sm:mt-3 font-display font-semibold text-[34px] leading-[1.05] sm:text-5xl lg:text-6xl">
                  {slide.title}{' '}
                  <span className="font-script text-lime-300 text-[44px] sm:text-6xl lg:text-7xl italic font-bold">{slide.accent}</span>
                </h2>
                <p className="mt-2.5 sm:mt-4 text-sm sm:text-base text-slate-300 max-w-sm">{slide.subtitle}</p>
                <div className="mt-4 sm:mt-6">
                  <Link
                    to={slide.href}
                    tabIndex={on ? 0 : -1}
                    className="inline-flex items-center gap-2 bg-lime-300 hover:bg-lime-200 text-ink-900 font-bold text-sm px-6 py-3 rounded-full transition-colors"
                  >
                    {slide.cta}
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <Link
                to={slide.productHref || slide.href}
                tabIndex={-1}
                className="relative h-full min-h-0 flex items-center justify-center"
              >
                <div className="absolute w-[230px] h-[230px] sm:w-[330px] sm:h-[330px] lg:w-[400px] lg:h-[400px] rounded-full border border-lime-300/50" />
                <div className="absolute w-[190px] h-[190px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] rounded-full bg-white/[0.04]" />
                {slide.image && (
                  <img
                    src={slide.image}
                    alt={slide.imageAlt || ''}
                    className={`relative max-h-[190px] sm:max-h-[300px] lg:max-h-[360px] max-w-[70%] w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] ${on ? 'hero-float' : ''}`}
                  />
                )}
              </Link>
            </div>
          )
        })}

        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-7 bg-lime-300' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trust badges */}
      <div className="relative container-px max-w-7xl mx-auto pb-6 pt-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {badges.map(([Icon, title, sub]) => (
            <div key={title} className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 shrink-0 rounded-full border border-lime-300/40 bg-lime-300/10 text-lime-300 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-xs font-semibold truncate">{title}</span>
                <span className="block text-[11px] text-slate-400 truncate">{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
