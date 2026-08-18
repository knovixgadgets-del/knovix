import { Link } from 'react-router-dom'

// Trending-ecommerce-style animated hero: one large "spotlight" product on
// autoplay crossfade, plus two smaller floating product cards around it.
// Every card is a real hyperlink to that product's page — this is a
// storefront hero, not a decorative banner.
export default function AnimatedHero({ products = [] }) {
  const [spotlight, ...rest] = products
  const floaters = rest.slice(0, 2)

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[5/4]">

      {/* Decorative animated gradient blobs behind the cards */}
      <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-brand-300/30 blur-2xl hero-blob" />
      <div
        className="absolute -bottom-8 -left-6 w-44 h-44 rounded-full bg-teal-300/30 blur-2xl hero-blob"
        style={{ animationDelay: '2.5s' }}
      />

      {/* Spotlight product */}
      {spotlight && (
        <Link
          to={`/product/${spotlight.id}`}
          className="hero-in absolute inset-x-6 top-0 bottom-10 sm:inset-x-10 rounded-2xl overflow-hidden bg-white shadow-card border border-slate-100 group"
        >
          <img
            src={spotlight.image}
            alt={spotlight.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-brand-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full hero-pulse-ring">
            🔥 Trending Now
          </span>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
            <p className="text-white text-sm sm:text-base font-semibold truncate">
              {spotlight.name}
            </p>

            {spotlight.price != null && (
              <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                ₹{spotlight.price.toLocaleString('en-IN')}
                {spotlight.mrp > spotlight.price && (
                  <span className="line-through text-white/50 ml-2">
                    ₹{spotlight.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </p>
            )}
          </div>
        </Link>
      )}

      {/* Floating smaller product cards */}
      {floaters.map((p, i) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          className={`hero-in ${i === 0 ? 'hero-float' : 'hero-float-delay'} absolute w-24 sm:w-32 bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden group ${
            i === 0
              ? 'top-2 -right-2 sm:-right-4 rotate-3'
              : 'bottom-4 -left-2 sm:-left-4 -rotate-3'
          }`}
          style={{ animationDelay: `${0.15 + i * 0.15}s` }}
        >
          <div className="aspect-square overflow-hidden bg-slate-50">
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          {p.price != null && (
            <p className="text-[11px] font-semibold px-2 py-1 truncate">
              ₹{p.price.toLocaleString('en-IN')}
            </p>
          )}
        </Link>
      ))}

      {!spotlight && (
        <div className="rounded-2xl w-full h-full bg-gradient-to-br from-brand-100 to-teal-100 animate-pulse" />
      )}
    </div>
  )
}
