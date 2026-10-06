import { Link } from 'react-router-dom'
import {
  ShopIcon, PhoneDeviceIcon, WatchIcon, LaptopIcon, CarIcon,
  HeadphonesIcon, BoltIcon, TagIcon, BoxIcon, CategoryIcon
} from './Icons'
import '../styles/home.css'

const ICONS = {
  bag: ShopIcon, phone: PhoneDeviceIcon, watch: WatchIcon, laptop: LaptopIcon, car: CarIcon,
  headphones: HeadphonesIcon, bolt: BoltIcon, tag: TagIcon, box: BoxIcon, category: CategoryIcon
}

// Picks an icon from a category name when tabs are built automatically.
function guessIcon(name = '') {
  const n = name.toLowerCase()
  if (/watch|wearable/.test(n)) return 'watch'
  if (/laptop|computer|tablet/.test(n)) return 'laptop'
  if (/car|bike|vehicle|auto/.test(n)) return 'car'
  if (/ear|head|audio|speaker|neckband|sound/.test(n)) return 'headphones'
  if (/charg|cable|power|bank|adapter/.test(n)) return 'bolt'
  if (/mobile|phone|case|cover/.test(n)) return 'phone'
  if (/deal|offer|sale/.test(n)) return 'tag'
  return 'category'
}

// Coloured, horizontally-scrolling icon tab bar (For You / Mobiles / ...).
// `tabs` = manual list from homeContent.js, or null to build from categories.
export default function CategoryTabs({ tabs, categories = [] }) {
  const list = tabs && tabs.length
    ? tabs
    : [
        { label: 'For You', icon: 'bag', href: '/' },
        ...categories.slice(0, 12).map((c) => ({
          label: c.name,
          icon: guessIcon(c.name),
          href: `/shop?category=${c.id}`
        }))
      ]

  return (
    <nav aria-label="Browse categories" className="home-tabs">
      <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar px-1.5 sm:px-4 lg:px-8 lg:justify-center">
        {list.map((t, i) => {
          const Icon = ICONS[t.icon] || CategoryIcon
          const active = i === 0 && t.href === '/'
          return (
            <Link
              key={`${t.label}-${i}`}
              to={t.href}
              className={`home-tab ${active ? 'is-active' : ''} shrink-0 w-[4.9rem] sm:w-24 pt-2 flex flex-col items-center`}
            >
              <span className="home-tab-box w-11 h-11 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </span>
              <span className="mt-1 text-[12.5px] font-medium max-w-full px-1 truncate">{t.label}</span>
              <span className={`home-tab-underline mt-1.5 w-12 ${active ? 'opacity-100' : 'opacity-0'}`} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
