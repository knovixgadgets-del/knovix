import { Link } from 'react-router-dom'
import '../styles/home.css'

const inr = (n) => Number(n || 0).toLocaleString('en-IN')

// Tinted rounded panel with a row of compact product cards
// ("Still looking for these?" in the reference). Colours: src/styles/home.css
export default function MiniProductRail({ title, products = [] }) {
  if (!products.length) return null
  return (
    <section className="container-px max-w-7xl mx-auto py-2.5">
      <div className="home-rail rounded-3xl p-4 sm:p-5">
        <h2 className="home-rail-title text-xl sm:text-2xl font-bold leading-tight">{title}</h2>

        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar snap-x -mx-1 px-1 pb-1">
          {products.map((p) => {
            const mrp = Number(p.mrp) || 0
            const price = Number(p.price) || 0
            const percent = mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0
            return (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="relative snap-start shrink-0 w-[8.4rem] sm:w-40 lg:w-44 rounded-2xl bg-white p-1.5 shadow-card"
              >
                {percent > 0 && (
                  <span className="home-rail-tag absolute top-0 left-0 z-[1] rounded-tl-2xl rounded-br-xl px-2 py-1 text-xs font-bold">
                    ↓{percent}%
                  </span>
                )}
                <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-300">No image</span>
                  )}
                </div>
                <p className="mt-2 px-1 text-sm text-slate-500 truncate">{p.name}</p>
                <p className="px-1 pb-1 text-lg font-bold text-ink-900">₹{inr(price)}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
