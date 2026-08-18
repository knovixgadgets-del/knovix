import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChevronLeft, IconChevronRight } from './Icons'

const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format',
    name: 'Wireless Earbuds',
  },
  {
    id: 'fallback-2',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format',
    name: 'Smart Watches',
  },
  {
    id: 'fallback-3',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&auto=format',
    name: 'Fast Chargers',
  },
]

export default function HeroCarousel({ products = [], intervalMs = 4000 }) {
  const slides =
    products.length > 0
      ? products.slice(0, 6).map((p) => ({ id: p.id, image: p.image, name: p.name, link: `/product/${p.id}` }))
      : FALLBACK_SLIDES.map((s) => ({ ...s, link: '/shop' }))

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [paused, slides.length, intervalMs])

  // Keep index in range if the slide count changes (e.g. products finish loading)
  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [slides.length, index])

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length)
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <Link
          key={slide.id}
          to={slide.link}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs sm:text-sm font-medium rounded-full px-3 py-1.5">
            {slide.name} →
          </span>
        </Link>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); prev() }}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); next() }}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
          >
            <IconChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={(e) => { e.preventDefault(); setIndex(i) }}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
