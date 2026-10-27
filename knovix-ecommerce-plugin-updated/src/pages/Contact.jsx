import { useState } from 'react'
import { MailIcon, PhoneIcon, LocationIcon, ClockIcon } from '../components/Icons'
import usePageMeta from '../utils/usePageMeta'

const EMAIL = 'knovixgadgets@gmail.com'
const WHATSAPP = '919447477665'

// Verify these against the real business details.
const details = [
  { icon: LocationIcon, label: 'Store Address', lines: ['Knovixgadgets', 'Chennai, Tamil Nadu, India'] },
  { icon: PhoneIcon, label: 'Phone / WhatsApp', lines: ['+91 94474 77665'], href: 'tel:+919447477665' },
  { icon: MailIcon, label: 'Email', lines: [EMAIL], href: `mailto:${EMAIL}` },
  { icon: ClockIcon, label: 'Working Hours', lines: ['Mon – Sat: 10:00 AM – 8:00 PM', 'Sunday: 11:00 AM – 5:00 PM'] }
]

const field = 'mt-1 w-full rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400'

// This form used to show "message sent" while sending nothing anywhere. With no
// message endpoint on the backend, it now hands the message to the visitor's own
// email app or WhatsApp, so enquiries are really delivered.
export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [opened, setOpened] = useState('')
  usePageMeta('Contact Us', 'Contact Knovix for order help, product questions and bulk enquiries. Email, call or WhatsApp us.')

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function body() {
    return `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.message}`
  }

  function sendEmail(e) {
    e.preventDefault()
    const subject = form.subject || `Enquiry from ${form.name}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body())}`
    setOpened('email')
  }

  function sendWhatsApp() {
    const text = `${form.subject ? `${form.subject}\n` : ''}${body()}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setOpened('whatsapp')
  }

  return (
    <div className="container-px max-w-7xl mx-auto py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink-900">Get in Touch</h1>
        <p className="mt-2 text-sm text-slate-500">
          Have a question about an order, a product, or a bulk enquiry? Reach us any of these ways, or send us a message below.
        </p>
      </div>

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {details.map(({ icon: Icon, label, lines, href }) => {
            const inner = (
              <>
                <span className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink-900">{label}</p>
                  {lines.map((l) => <p key={l} className="text-xs text-slate-500 mt-0.5 break-words">{l}</p>)}
                </div>
              </>
            )
            return href ? (
              <a key={label} href={href} className="card p-4 flex items-start gap-3 hover:border-brand-400 transition-colors">{inner}</a>
            ) : (
              <div key={label} className="card p-4 flex items-start gap-3">{inner}</div>
            )
          })}
        </div>

        <div className="lg:col-span-3">
          <div className="card p-5 sm:p-6">
            <form onSubmit={sendEmail} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ct-name" className="text-xs font-medium text-slate-600">Full Name</label>
                  <input id="ct-name" required autoComplete="name" value={form.name} onChange={update('name')} className={`${field} h-10`} placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="ct-phone" className="text-xs font-medium text-slate-600">Phone Number</label>
                  <input id="ct-phone" required type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')} className={`${field} h-10`} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label htmlFor="ct-email" className="text-xs font-medium text-slate-600">Email Address</label>
                <input id="ct-email" required type="email" autoComplete="email" value={form.email} onChange={update('email')} className={`${field} h-10`} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="ct-subject" className="text-xs font-medium text-slate-600">Subject</label>
                <input id="ct-subject" value={form.subject} onChange={update('subject')} className={`${field} h-10`} placeholder="Order enquiry, bulk order, support..." />
              </div>
              <div>
                <label htmlFor="ct-message" className="text-xs font-medium text-slate-600">Message</label>
                <textarea id="ct-message" required rows={5} value={form.message} onChange={update('message')} className={`${field} py-2`} placeholder="How can we help? Include your order number if you have one." />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="btn-primary px-6">Send by Email</button>
                <button
                  type="button"
                  onClick={() => (form.name && form.message ? sendWhatsApp() : document.getElementById('ct-name')?.reportValidity?.())}
                  className="btn-outline px-6"
                >
                  Send on WhatsApp
                </button>
              </div>

              {opened && (
                <p role="status" className="text-sm text-slate-600 bg-brand-50 rounded-md px-3 py-2">
                  {opened === 'email'
                    ? <>Your email app should have opened with your message ready to send. If nothing happened, please email us at <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</>
                    : 'WhatsApp should have opened with your message ready to send.'}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
