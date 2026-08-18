import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ImageCarousel({ slides = [], intervalMs = 4000 }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return

    const t = setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, intervalMs)

    return () => clearInterval(t)
  }, [slides.length, intervalMs])

  if (slides.length === 0) {
    return (
      <div className="rounded-2xl w-full aspect-[4/3] bg-gradient-to-br from-brand-100 to-teal-100 animate-pulse" />
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
      {slides.map((slide, i) => (
        <Link
          key={slide.id}
          to={`/product/${slide.id}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? 'auto' : 'none' }}
          aria-hidden={i !== active}
        >
          <img
            src={slide.image}
            alt={slide.name}
            className="w-full h-full object-cover"
          />

          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-ink-900 text-xs font-medium px-3 py-1.5 rounded-full">
            {slide.name}
          </span>
        </Link>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === active ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
