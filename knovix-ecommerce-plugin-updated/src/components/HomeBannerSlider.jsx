import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './Icons'
import '../styles/banner.css' // banner text + size look — edit src/styles/banner.css

const BANNER_MS = 4500

// Rounded banner slider (reference-style): picture fills the card (cover,
// centred), optional text on top, pill-dash progress dots underneath.
// Content: src/data/homeBanners.js   Look: src/styles/banner.css
export default function HomeBannerSlider({ slides = [] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)
  const count = slides.length

  const goTo = useCallback((i) => setActive(((i % count) + count) % count), [count])

  useEffect(() => {
    if (count <= 1 || paused) return
    const t = setInterval(() => setActive((i) => (i + 1) % count), BANNER_MS)
    return () => clearInterval(t)
  }, [count, paused, active])

  if (!count) return null
  const current = slides[active] || slides[0]

  function onTouchStart(e) {
    touchX.current = e.touches[0].clientX
    setPaused(true)
  }
  function onTouchEnd(e) {
    if (touchX.current != null) {
      const dx = e.changedTouches[0].clientX - touchX.current
      if (Math.abs(dx) > 40) goTo(active + (dx < 0 ? 1 : -1))
    }
    touchX.current = null
    setPaused(false)
  }

  return (
    <section className="container-px max-w-7xl mx-auto pt-3 sm:pt-4">
      <div
        className={`hb-theme-${current.theme || 'default'} hb-frame relative overflow-hidden rounded-2xl bg-ink-900 text-white`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* pictures — cover + centred, cross-fade */}
        {slides.map((sl, i) => sl.image && (
          <picture key={sl.id} className="contents">
            {sl.imageMobile && <source media="(max-width: 639px)" srcSet={sl.imageMobile} />}
            <img
              src={sl.image}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{ objectPosition: sl.imagePosition || 'center center' }}
              className={`pointer-events-none absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
            />
          </picture>
        ))}

        {/* dark overlay only where text sits on the picture */}
        {slides.some((sl) => sl.image) && (
          <div className={`hb-overlay pointer-events-none absolute inset-0 transition-opacity duration-700 ${current.image && current.showText !== false ? 'opacity-100' : 'opacity-0'}`} />
        )}

        {/* whole active banner is clickable */}
        <Link to={current.href || '/shop'} aria-label={current.title || 'Open banner'} className="absolute inset-0 z-[1]" />

        {/* text layer */}
        <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center px-6 sm:px-16">
          {slides.map((slide, i) => {
            const on = i === active
            if (slide.showText === false) return null
            return (
              <div
                key={slide.id}
                aria-hidden={!on}
                className={`hb-slide col-start-1 row-start-1 transition-all duration-700 ease-out ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              >
                {slide.eyebrow && <p className="hb-eyebrow">{slide.eyebrow}</p>}
                <h2 className="hb-title">
                  {slide.title}{' '}
                  {slide.accent && <span className="hb-accent">{slide.accent}</span>}
                </h2>
                {slide.subtitle && <p className="hb-subtitle">{slide.subtitle}</p>}
                {slide.cta && (
                  <Link to={slide.href || '/shop'} tabIndex={on ? 0 : -1} className="hb-cta pointer-events-auto">
                    {slide.cta}
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {count > 1 && (
          <>
            <button type="button" aria-label="Previous banner" onClick={() => goTo(active - 1)}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-14 items-center justify-center rounded-md bg-black/25 hover:bg-black/45 text-white backdrop-blur-sm transition-colors">
              <ChevronRightIcon className="w-5 h-5 rotate-180" />
            </button>
            <button type="button" aria-label="Next banner" onClick={() => goTo(active + 1)}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-[3] w-10 h-14 items-center justify-center rounded-md bg-black/25 hover:bg-black/45 text-white backdrop-blur-sm transition-colors">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="hb-dots" style={{ '--hb-ms': `${BANNER_MS}ms`, '--hb-play': paused ? 'paused' : 'running' }}>
          {slides.map((sl, i) => (
            <button
              key={sl.id}
              type="button"
              aria-label={`Go to banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={`hb-dash ${i === active ? 'is-active' : ''}`}
            >
              <span className="hb-dash-fill" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
