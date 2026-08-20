import { Link } from 'react-router-dom'

// Dummy editorial content — swap for real posts pulled from WordPress
// (the WP backend already has a native posts API) once copy is ready.
const posts = [
  {
    id: 1,
    category: 'Buying Guide',
    title: 'True Wireless Earbuds Under ₹2,000: What Actually Matters',
    excerpt: 'Battery life, ANC, and fit beat spec-sheet numbers every time. Here is what to check before you buy your next pair of earbuds.',
    date: 'Aug 12, 2026',
    readMins: 5,
    gradient: 'from-brand-100 to-teal-100'
  },
  {
    id: 2,
    category: 'How-To',
    title: 'Fast Charging 101: GaN Chargers Explained',
    excerpt: 'Why a tiny 65W GaN charger can power your laptop and phone at once, and how to pick the right wattage for your gadgets.',
    date: 'Aug 5, 2026',
    readMins: 4,
    gradient: 'from-teal-100 to-brand-50'
  },
  {
    id: 3,
    category: 'Comparison',
    title: 'Power Bank Buying Guide: mAh, Watts, and What They Mean',
    excerpt: 'A 20,000mAh power bank does not always charge faster. We break down capacity vs output so you stop overpaying.',
    date: 'Jul 28, 2026',
    readMins: 6,
    gradient: 'from-brand-50 to-brand-100'
  },
  {
    id: 4,
    category: 'Tips',
    title: '5 Ways to Extend Your Smartwatch Battery Life',
    excerpt: 'Small settings tweaks that add hours back to your smartwatch without switching off the features you actually use.',
    date: 'Jul 19, 2026',
    readMins: 3,
    gradient: 'from-teal-50 to-brand-100'
  },
  {
    id: 5,
    category: 'New Launch',
    title: 'Inside the Knovix Vision Max: Our Most Requested Watch Yet',
    excerpt: 'A look at the design decisions behind our best-selling smartwatch — from the AMOLED display to a week-long battery.',
    date: 'Jul 9, 2026',
    readMins: 4,
    gradient: 'from-brand-100 to-teal-50'
  },
  {
    id: 6,
    category: 'Buying Guide',
    title: 'Car Charger vs Power Bank: What Should Live in Your Glovebox?',
    excerpt: 'Road trips, daily commutes, and emergencies each call for a different backup. Here is how to decide.',
    date: 'Jun 30, 2026',
    readMins: 4,
    gradient: 'from-teal-100 to-brand-100'
  }
]

export default function Blog() {
  const [featured, ...rest] = posts

  return (
    <div className="container-px max-w-7xl mx-auto py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink-900">Knovix Blog</h1>
        <p className="mt-2 text-sm text-slate-500">
          Buying guides, how-tos and product deep-dives to help you get more out of your gadgets.
        </p>
      </div>

      {/* Featured post */}
      <Link to="#" className="card overflow-hidden mt-8 grid sm:grid-cols-2 group">
        <div className={`h-48 sm:h-full bg-gradient-to-br ${featured.gradient}`} />
        <div className="p-5 sm:p-6 flex flex-col justify-center">
          <span className="inline-block w-fit bg-brand-50 text-brand-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {featured.category}
          </span>
          <h2 className="mt-3 text-lg sm:text-xl font-bold text-ink-900 group-hover:text-brand-700 transition-colors">
            {featured.title}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{featured.excerpt}</p>
          <p className="mt-3 text-xs text-slate-400">{featured.date} · {featured.readMins} min read</p>
        </div>
      </Link>

      {/* Post grid */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((post) => (
          <Link key={post.id} to="#" className="card overflow-hidden group">
            <div className={`h-36 bg-gradient-to-br ${post.gradient}`} />
            <div className="p-4">
              <span className="inline-block bg-brand-50 text-brand-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {post.category}
              </span>
              <h3 className="mt-2.5 font-semibold text-sm text-ink-900 leading-snug group-hover:text-brand-700 transition-colors">
                {post.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{post.excerpt}</p>
              <p className="mt-2.5 text-[11px] text-slate-400">{post.date} · {post.readMins} min read</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
