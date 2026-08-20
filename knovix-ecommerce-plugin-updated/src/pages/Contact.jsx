import { useState } from 'react'
import { MailIcon, PhoneIcon, LocationIcon, ClockIcon } from '../components/Icons'

// Placeholder contact details — swap for the real store address, numbers
// and hours once the business finalizes them.
const details = [
  {
    icon: LocationIcon,
    label: 'Store Address',
    lines: ['Knovix Gadgets, No. 24, 2nd Floor, Ambattur Industrial Estate Road', 'Chennai, Tamil Nadu 600058, India']
  },
  {
    icon: PhoneIcon,
    label: 'Phone / WhatsApp',
    lines: ['+91 98765 43210', '+91 91234 56789']
  },
  {
    icon: MailIcon,
    label: 'Email',
    lines: ['support@knovixgadgets.in', 'orders@knovixgadgets.in']
  },
  {
    icon: ClockIcon,
    label: 'Working Hours',
    lines: ['Mon – Sat: 10:00 AM – 8:00 PM', 'Sunday: 11:00 AM – 5:00 PM']
  }
]

export default function Contact() {
  const [sent, setSent] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="container-px max-w-7xl mx-auto py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink-900">Get in Touch</h1>
        <p className="mt-2 text-sm text-slate-500">
          Have a question about an order, a product, or a bulk enquiry? Reach us any of these ways, or send a message and we'll get back within 24 hours.
        </p>
      </div>

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-3">
          {details.map(({ icon: Icon, label, lines }) => (
            <div key={label} className="card p-4 flex items-start gap-3">
              <span className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-ink-900">{label}</p>
                {lines.map((l) => (
                  <p key={l} className="text-xs text-slate-500 mt-0.5">{l}</p>
                ))}
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div className="card overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-brand-50 to-teal-50 flex items-center justify-center text-slate-400 text-xs">
              Map — Ambattur Industrial Estate, Chennai
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <div className="card p-5 sm:p-6">
            {sent ? (
              <div className="py-10 text-center">
                <p className="text-lg font-semibold text-ink-900">Thanks — message sent!</p>
                <p className="text-sm text-slate-500 mt-1">This is a demo form; our team will follow up by email shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Full Name</label>
                    <input required type="text" placeholder="Your name" className="mt-1 w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Phone Number</label>
                    <input required type="tel" placeholder="+91 98765 43210" className="mt-1 w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Email Address</label>
                  <input required type="email" placeholder="you@example.com" className="mt-1 w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Subject</label>
                  <input type="text" placeholder="Order enquiry, bulk order, support..." className="mt-1 w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Message</label>
                  <textarea required rows={5} placeholder="How can we help?" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400" />
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto px-6">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
