// Seed data used by the local mock backend (src/data/localStore.js).
// Replace this entirely once real data is available — the shapes here
// (Product, Category, Order, User) are the contract the UI expects.

export const categories = [
  { id: 'mobile-accessories', name: 'Mobile Accessories', image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400' },
  { id: 'chargers', name: 'Chargers', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400' },
  { id: 'earbuds', name: 'Earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
  { id: 'smart-watches', name: 'Smart Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
  { id: 'power-banks', name: 'Power Banks', image: 'https://images.unsplash.com/photo-1609592424916-3a34a2c2f10a?w=400' },
  { id: 'phone-cases', name: 'Phone Cases', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400' },
  { id: 'car-accessories', name: 'Car Accessories', image: 'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=400' },
  { id: 'laptop-accessories', name: 'Laptop Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' }
]

const img = (seed) => `https://images.unsplash.com/${seed}?w=600&auto=format`

export const products = [
  { id: 'p1', name: 'Knovix AirBeat Pro Wireless Earbuds', category: 'earbuds', price: 1299, mrp: 2499, rating: 4.5, reviews: 128, stock: 42, image: img('photo-1590658268037-6bf12165a8df'), description: 'Active noise cancellation, 32-hour battery life with case, IPX5 sweat resistance, and touch controls.', featured: true, bestSeller: false },
  { id: 'p2', name: 'Knovix Vision Max Smart Watch', category: 'smart-watches', price: 2499, mrp: 4499, rating: 4.4, reviews: 96, stock: 30, image: img('photo-1523275335684-37898b6baf30'), description: '1.8" AMOLED display, heart-rate & SpO2 tracking, 7-day battery, 100+ sport modes.', featured: true, bestSeller: false },
  { id: 'p3', name: 'Knovix 67W GaN Fast Charger', category: 'chargers', price: 1299, mrp: 2499, rating: 4.6, reviews: 84, stock: 60, image: img('photo-1583863788434-e58a36330cf0'), description: 'Compact GaN charger, dual-port PD/QC fast charging for phones, tablets and laptops.', featured: true, bestSeller: false },
  { id: 'p4', name: 'Knovix 20000mAh Power Bank', category: 'power-banks', price: 1199, mrp: 2199, rating: 4.3, reviews: 112, stock: 55, image: img('photo-1609592424916-3a34a2c2f10a'), description: '22.5W fast charging, digital display, dual USB-A + USB-C output.', featured: true, bestSeller: false },
  { id: 'p5', name: 'Knovix 100W Type-C to Type-C Cable', category: 'chargers', price: 499, mrp: 999, rating: 4.4, reviews: 76, stock: 90, image: img('photo-1585055408651-529489f2e6d8'), description: 'Braided nylon cable rated for 100W PD charging and 480Mbps data transfer, 1.2m.', featured: true, bestSeller: false },
  { id: 'p6', name: 'Knovix Bluetooth Speaker', category: 'mobile-accessories', price: 1299, mrp: 1999, rating: 4.5, reviews: 64, stock: 25, image: img('photo-1608043152269-423dbba4e7e1'), description: 'Portable speaker with deep bass, 12-hour playtime and IPX7 waterproof body.', featured: false, bestSeller: true },
  { id: 'p7', name: 'Knovix Neckband Pro', category: 'earbuds', price: 799, mrp: 1499, rating: 4.2, reviews: 51, stock: 70, image: img('photo-1590658268037-6bf12165a8df'), description: 'Magnetic in-ear neckband with deep bass and 40-hour battery backup.', featured: false, bestSeller: true },
  { id: 'p8', name: 'Knovix Car Charger 38W', category: 'car-accessories', price: 599, mrp: 899, rating: 4.3, reviews: 39, stock: 80, image: img('photo-1567016526105-22da7c13161a'), description: 'Dual-port fast car charger with LED voltmeter display.', featured: false, bestSeller: true },
  { id: 'p9', name: 'Knovix 10000mAh Power Bank Slim', category: 'power-banks', price: 899, mrp: 1499, rating: 4.1, reviews: 47, stock: 65, image: img('photo-1609592424916-3a34a2c2f10a'), description: 'Ultra-slim pocket power bank, 20W fast output.', featured: false, bestSeller: true },
  { id: 'p10', name: 'Knovix Magnetic Wireless Charger', category: 'chargers', price: 1199, mrp: 1899, rating: 4.4, reviews: 33, stock: 40, image: img('photo-1583863788434-e58a36330cf0'), description: 'MagSafe-compatible 15W magnetic wireless charging puck.', featured: false, bestSeller: true },
  { id: 'p11', name: 'Knovix Clear Armor Phone Case', category: 'phone-cases', price: 399, mrp: 799, rating: 4.2, reviews: 58, stock: 100, image: img('photo-1601593346740-925612772716'), description: 'Shockproof clear case with reinforced corners, wireless-charging compatible.', featured: false, bestSeller: false },
  { id: 'p12', name: 'Knovix Commuter Laptop Backpack', category: 'laptop-accessories', price: 1799, mrp: 2999, rating: 4.5, reviews: 44, stock: 20, image: img('photo-1553062407-98eeb64c6a62'), description: 'Water-resistant 15.6" laptop backpack with USB charging port.', featured: false, bestSeller: false }
]

export const testimonials = [
  { name: 'Anand Krishna', text: 'Excellent quality products and super fast delivery. Highly recommended!', rating: 5 },
  { name: 'Navya K S', text: 'Knovix Gadgets never disappoints. Best place for all tech accessories.', rating: 5 },
  { name: 'Gokul T V', text: 'Good product, affordable price and great customer support.', rating: 5 }
]

export const demoUsers = [
  { id: 'u_admin', name: 'Admin', email: 'admin@knovix.com', password: 'admin123', role: 'admin' },
  { id: 'u_demo', name: 'Demo Customer', email: 'demo@knovix.com', password: 'demo1234', role: 'customer' }
]
