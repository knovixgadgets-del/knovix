import { Link } from 'react-router-dom'
import { useShippingRules } from '../utils/shipping'
import { inr } from '../utils/format'
import usePageMeta from '../utils/usePageMeta'

// Customer-facing policy pages. These are sensible starting drafts that match the
// promises made elsewhere on the site (free shipping threshold from WooCommerce,
// 7-day replacement, COD). Have them reviewed against your real operations and,
// for Privacy / Terms, by a legal professional before relying on them.
const EMAIL = 'knovixgadgets@gmail.com'

const H = ({ children }) => <h2 className="text-lg font-semibold text-ink-900 mt-8 mb-2">{children}</h2>
const P = ({ children }) => <p className="text-slate-600 leading-relaxed mt-3 text-sm sm:text-base">{children}</p>
const UL = ({ items }) => (
  <ul className="list-disc pl-5 mt-3 space-y-1.5 text-slate-600 text-sm sm:text-base">
    {items.map((i) => <li key={i}>{i}</li>)}
  </ul>
)
const Contact = () => (
  <P>Questions? Email <a className="text-brand-700 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> or visit our <Link className="text-brand-700 underline" to="/contact">contact page</Link>.</P>
)

function Shipping() {
  const { freeMin, fee } = useShippingRules()
  return (
    <>
      <P>We deliver across India. Shipping is calculated from your state and pincode at checkout, before you place the order.</P>
      <H>Shipping charges</H>
      <UL items={[
        freeMin ? `Free delivery on orders of ₹${inr(freeMin)} and above.` : 'Free delivery is available on eligible orders — the amount is shown at checkout.',
        fee ? `Below that, a delivery fee of ₹${inr(fee)} applies (this can vary by location).` : 'Below that, a delivery fee applies based on your location.',
        'Some pincodes may not be serviceable; checkout tells you before you pay.'
      ]} />
      <H>Delivery time</H>
      <P>Orders are dispatched after confirmation. Delivery time depends on your location and the courier; the estimated window is shown on your order page. Delays caused by weather, strikes or courier issues are outside our control, but we will help you track any order.</P>
      <H>Cash on delivery</H>
      <P>Cash on Delivery is available at checkout. Please keep the exact amount ready for the delivery partner.</P>
      <Contact />
    </>
  )
}

function Returns() {
  return (
    <>
      <P>We offer an easy 7-day replacement on eligible products.</P>
      <H>What qualifies</H>
      <UL items={[
        'Products that arrive damaged, defective or different from what you ordered.',
        'You must contact us within 7 days of delivery.',
        'The product should be unused, with original packaging, accessories and invoice.'
      ]} />
      <H>What doesn’t qualify</H>
      <UL items={[
        'Damage caused by misuse, water, drops or unauthorised repair.',
        'Products returned without original packaging or with missing accessories.'
      ]} />
      <H>How to request a replacement</H>
      <UL items={[
        `Email ${EMAIL} or message us on WhatsApp with your order number and photos/video of the issue.`,
        'We will review it and tell you the next steps and pickup/return instructions.',
        'Once the item is received and checked, we send the replacement. If a replacement is not possible, we will arrange a refund to your original payment method (or as agreed for Cash on Delivery orders).'
      ]} />
      <Contact />
    </>
  )
}

function Faq() {
  const faqs = [
    ['How do I place an order?', 'Add products to your cart, go to checkout, sign in with your mobile number (OTP), enter your delivery address and place the order.'],
    ['Do I need an account?', 'Checkout uses your mobile number and a one-time password. If you are new, your account is created automatically.'],
    ['What payment options are available?', 'Cash on Delivery, UPI and card options are shown at checkout.'],
    ['How much is shipping?', 'It depends on your location and order value. The exact amount is shown at checkout before you pay — see our Shipping Policy for the free-delivery threshold.'],
    ['How do I track my order?', 'Open My Orders from your account to see the status of every order.'],
    ['Can I cancel an order?', `Contact us as soon as possible at ${EMAIL} with your order number. Orders that have not shipped can usually be cancelled.`],
    ['What if my product arrives damaged or faulty?', 'Contact us within 7 days of delivery with photos. See our Returns & Refunds page for details.'],
    ['How can I contact you?', `Email ${EMAIL}, call/WhatsApp +91 94474 77665, or use the contact page.`]
  ]
  return (
    <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
      {faqs.map(([q, a]) => (
        <details key={q} className="group py-4">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium text-ink-900">
            {q}
            <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none" aria-hidden="true">+</span>
          </summary>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  )
}

function Privacy() {
  return (
    <>
      <P>This policy explains what information Knovix collects when you use this website and how we use it.</P>
      <H>Information we collect</H>
      <UL items={[
        'Contact and delivery details you provide: name, mobile number, email (if any), address, city, state and pincode.',
        'Order details: products, amounts, payment method and order status.',
        'Technical data stored in your browser, such as your cart, wishlist, recently viewed products and sign-in session.'
      ]} />
      <H>How we use it</H>
      <UL items={[
        'To verify your mobile number, process, deliver and support your orders.',
        'To contact you about your orders and answer your enquiries.',
        'To keep the website secure and working properly.'
      ]} />
      <H>Sharing</H>
      <P>We do not sell your personal information. We share only what is needed with delivery partners, payment providers and hosting/service providers to fulfil your order, or when required by law.</P>
      <H>Your choices</H>
      <P>You can clear your cart, wishlist and sign-in data by signing out and clearing your browser storage. To ask us to access, correct or delete your personal data, contact us.</P>
      <Contact />
    </>
  )
}

function Terms() {
  return (
    <>
      <P>By using this website and placing an order you agree to these terms.</P>
      <H>Products and pricing</H>
      <P>We try to keep product details, prices and availability accurate. If an item is priced or described incorrectly or becomes unavailable, we may cancel the order and refund any amount paid.</P>
      <H>Orders</H>
      <P>An order is confirmed once it is accepted by Knovix. We may decline or cancel orders for reasons such as stock issues, suspected fraud or non-serviceable locations.</P>
      <H>Shipping, returns and refunds</H>
      <P>These are governed by our <Link className="text-brand-700 underline" to="/shipping">Shipping Policy</Link> and <Link className="text-brand-700 underline" to="/returns">Returns &amp; Refunds</Link> policy.</P>
      <H>Your account</H>
      <P>You are responsible for activity on your account and for keeping your mobile number and OTP confidential.</P>
      <H>Liability and governing law</H>
      <P>To the extent permitted by law, Knovix is not liable for indirect or consequential losses. These terms are governed by the laws of India.</P>
      <Contact />
    </>
  )
}

function Careers() {
  return (
    <>
      <P>We are a small team building a friendly place to buy useful gadgets. We don’t have listed openings right now, but we’re always happy to hear from good people.</P>
      <P>Send a short note about yourself and your CV to <a className="text-brand-700 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</P>
    </>
  )
}

function About() {
  return (
    <>
      <P>
        Knovix is an Indian online store for smart gadgets, electronics, mobile accessories, toys and everyday
        technology products. We source and curate gadgets that make everyday life a little smarter — from earbuds and
        smartwatches to chargers, mobile accessories and more — and ship them across India with easy replacement and
        secure payment options.
      </P>
      <P>Our goal is simple: help you find quality tech without the guesswork, backed by responsive customer support and fast delivery.</P>
    </>
  )
}

const pages = {
  about: { title: 'About Knovix', body: About, desc: 'Knovix is an Indian online store for smart gadgets, mobile accessories and everyday tech.' },
  careers: { title: 'Careers', body: Careers },
  faq: { title: 'Frequently Asked Questions', body: Faq },
  returns: { title: 'Returns & Refunds', body: Returns },
  shipping: { title: 'Shipping Policy', body: Shipping },
  privacy: { title: 'Privacy Policy', body: Privacy },
  terms: { title: 'Terms & Conditions', body: Terms }
}

export default function StaticPage({ slug }) {
  const page = pages[slug]
  usePageMeta(page?.title, page?.desc)
  if (!page) return null
  const Body = page.body

  return (
    <div className="container-px max-w-3xl mx-auto py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink-900">{page.title}</h1>
      <Body />
    </div>
  )
}
