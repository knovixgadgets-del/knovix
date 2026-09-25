import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './Icons'

const AUTOPLAY_MS = 5000

// Full-bleed, edge-to-edge banner — the same "wide strip stretching past
// the page margins" treatment Amazon and Flipkart both use for their top
// hero, rather than a rounded card inset inside the content column.
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
      <div className="w-full h-[240px] sm:h-[340px] lg:h-[400px] bg-gradient-to-br from-brand-50 to-brand-100 animate-pulse" />
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
    <div className="w-full">
      <div
        className="relative w-full h-[240px] sm:h-[340px] lg:h-[420px] overflow-hidden bg-gradient-to-br from-brand-50 via-brand-50 to-teal-50 select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Soft decorative blob, echoing the leafy/rounded backdrop on the
            reference banner without pulling in an external image asset. */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full bg-brand-200/40 blur-2xl" />
        <div className="pointer-events-none absolute right-10 bottom-0 w-56 h-56 rounded-full border-[10px] border-white/60" />

        {/* Soft fade at the bottom edge — the same trick Amazon's full-bleed
            banner uses so it reads as blending into the page rather than
            ending in a hard line. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-black/10 to-transparent" />

        {/* Slide track */}
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="relative shrink-0 w-full h-full flex items-center">
              <div className="container-px w-full grid grid-cols-2 items-center gap-4">
                <div className="hero-in max-w-sm">
                  {slide.eyebrow && (
                    <span className="inline-block bg-white text-brand-700 text-[11px] sm:text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full mb-2 sm:mb-3 shadow-sm">
                      {slide.eyebrow}
                    </span>
                  )}
                  <h2 className="text-ink-900 text-xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-slate-600 text-xs sm:text-sm mt-1.5 sm:mt-3 max-w-xs hidden sm:block">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 mt-3 sm:mt-5">
                    <Link
                      to={slide.href}
                      className="inline-flex items-center gap-1 bg-brand-600 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-md hover:bg-brand-700 transition-colors"
                    >
                      {slide.cta}
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/shop?sort=price_asc"
                      className="hidden sm:inline-flex items-center bg-white text-ink-900 text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Explore Deals
                    </Link>
                  </div>
                </div>

                <Link to={slide.href} className="relative h-full flex items-center justify-center">
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="max-h-[70%] sm:max-h-[80%] w-auto object-contain drop-shadow-2xl"
                    />
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next arrows — desktop only, appear on hover of the banner */}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={(e) => { e.preventDefault(); prev() }}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-ink-900 shadow"
            >
              <ChevronRightIcon className="w-4 h-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={(e) => { e.preventDefault(); next() }}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-ink-900 shadow"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {count > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 flex items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={(e) => { e.preventDefault(); goTo(i) }}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-6 bg-brand-600' : 'w-1.5 bg-brand-300 hover:bg-brand-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
