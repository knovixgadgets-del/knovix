import { Link } from 'react-router-dom'

const cols = [
  { title: 'Company', links: [['About Us', '/about'], ['Careers', '/careers'], ['Blog', '/blog'], ['Contact Us', '/contact']] },
  { title: 'Customer Service', links: [['FAQs', '/faq'], ['Order Tracking', '/account'], ['Returns & Refunds', '/returns'], ['Shipping Policy', '/shipping']] },
  { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms'], ['Refund Policy', '/returns']] }
]

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-slate-300 mt-16">
      <div className="container-px max-w-7xl mx-auto py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <span className="text-xl font-extrabold font-display text-white">KNOVIX</span>
          <p className="mt-3 text-slate-400 text-xs leading-relaxed">
            Your one-stop destination for premium gadgets and accessories. Quality, trust and satisfaction guaranteed.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-white text-slate-400">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-white font-semibold mb-3">We Accept</h4>
          <div className="flex gap-2 text-xs">
            <span className="bg-white text-ink-900 rounded px-2 py-1">VISA</span>
            <span className="bg-white text-ink-900 rounded px-2 py-1">UPI</span>
            <span className="bg-white text-ink-900 rounded px-2 py-1">Paytm</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">🔒 100% Secure Payments</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Knovix Gadgets. All rights reserved.
      </div>
    </footer>
  )
}
