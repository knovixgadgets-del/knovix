import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './Icons'

const AUTOPLAY_MS = 5000

export default function HeroCarousel({ slides = [] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)

  const count = slides.length

  const goTo = useCallback(
    (i) => setActive(((i % count) + count) % count),
    [count]
  )
  const next = useCallback(() => goTo(active + 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])

  useEffect(() => {
    if (count <= 1 || paused) return
    const t = setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [count, paused])

  if (count === 0) {
    return (
      <div className="w-full h-[220px] sm:h-[340px] lg:h-[420px] bg-gradient-to-br from-brand-100 to-teal-100 animate-pulse" />
    )
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e) {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev())
    touchStartX.current = null
  }

  return (
    <div
      className="relative w-full h-[220px] sm:h-[340px] lg:h-[420px] overflow-hidden bg-ink-900 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide track */}
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide) => (
          <Link
            key={slide.id}
            to={slide.href}
            className={`relative shrink-0 w-full h-full flex items-center bg-gradient-to-br ${slide.gradient}`}
          >
            <div className="container-px max-w-7xl mx-auto w-full grid grid-cols-2 items-center gap-4">
              <div className="hero-in max-w-sm">
                {slide.eyebrow && (
                  <span className="inline-block bg-white/90 text-brand-700 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded mb-2 sm:mb-3">
                    {slide.eyebrow}
                  </span>
                )}
                <h2 className="text-white text-xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-white/85 text-xs sm:text-sm mt-1.5 sm:mt-3 max-w-xs hidden sm:block">
                    {slide.subtitle}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 mt-3 sm:mt-5 bg-white text-ink-900 text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-md hover:bg-white/90 transition-colors">
                  {slide.cta}
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="relative h-full flex items-center justify-center">
                {slide.image && (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="max-h-[75%] sm:max-h-[85%] w-auto object-contain drop-shadow-2xl"
                  />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Prev / Next arrows — desktop only, appear on hover of the banner */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={(e) => { e.preventDefault(); prev() }}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-ink-900 shadow"
          >
            <ChevronRightIcon className="w-4 h-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={(e) => { e.preventDefault(); next() }}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-ink-900 shadow"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => { e.preventDefault(); goTo(i) }}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
