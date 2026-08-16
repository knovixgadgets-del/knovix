// -----------------------------------------------------------------------
// LOCAL MOCK BACKEND
// -----------------------------------------------------------------------
// This file simulates a database using localStorage + seed data, purely so
// the app is fully functional out of the box (browse, cart, checkout,
// login, admin CRUD). It is the ONLY file that touches localStorage.
//
// When you connect a real backend: delete this file's usage inside
// src/api/*.js (each function there has a REAL BACKEND comment showing the
// fetch() call to make) — you do not need to touch any component or page.
// -----------------------------------------------------------------------

import { products as seedProducts, categories, demoUsers } from './mockData'

const KEYS = {
  products: 'knovix_products',
  users: 'knovix_users',
  orders: 'knovix_orders',
  session: 'knovix_session'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
function ensureSeeded() {
  if (!localStorage.getItem(KEYS.products)) write(KEYS.products, seedProducts)
  if (!localStorage.getItem(KEYS.users)) write(KEYS.users, demoUsers)
  if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, [])
}
ensureSeeded()

// simulate network latency so loading states are visible/testable
const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))
const uid = (p = 'id') => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const localDb = {
  // ---- catalog ----
  async listCategories() {
    await delay(150)
    return categories
  },
  async listProducts({ category, search, sort } = {}) {
    await delay()
    let items = read(KEYS.products, [])
    if (category) items = items.filter((p) => p.category === category)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sort === 'price_asc') items = [...items].sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') items = [...items].sort((a, b) => b.price - a.price)
    if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating)
<<<<<<< HEAD
=======
    if (sort === 'newest') items = [...items].reverse()
>>>>>>> 5ae76121209c169f14a8210984c1ac78eedf7bb3
    return items
  },
  async getProduct(id) {
    await delay(150)
    const items = read(KEYS.products, [])
    return items.find((p) => p.id === id) || null
  },
  async createProduct(payload) {
    await delay()
    const items = read(KEYS.products, [])
    const item = { id: uid('p'), rating: 0, reviews: 0, ...payload }
    items.unshift(item)
    write(KEYS.products, items)
    return item
  },
  async updateProduct(id, payload) {
    await delay()
    const items = read(KEYS.products, [])
    const idx = items.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Product not found')
    items[idx] = { ...items[idx], ...payload }
    write(KEYS.products, items)
    return items[idx]
  },
  async deleteProduct(id) {
    await delay()
    const items = read(KEYS.products, []).filter((p) => p.id !== id)
    write(KEYS.products, items)
    return { success: true }
  },

  // ---- auth ----
  async login(email, password) {
    await delay()
    const users = read(KEYS.users, [])
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const { password: _pw, ...safe } = user
    write(KEYS.session, safe)
    return safe
  },
  async signup({ name, email, password }) {
    await delay()
    const users = read(KEYS.users, [])
    if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists')
    const user = { id: uid('u'), name, email, password, role: 'customer' }
    users.push(user)
    write(KEYS.users, users)
    const { password: _pw, ...safe } = user
    write(KEYS.session, safe)
    return safe
  },
  async logout() {
    localStorage.removeItem(KEYS.session)
  },
  async getSession() {
    return read(KEYS.session, null)
  },

  // ---- orders ----
  async createOrder(order) {
    await delay()
    const orders = read(KEYS.orders, [])
    const record = {
      id: uid('ORD'),
      status: 'placed',
      createdAt: new Date().toISOString(),
      ...order
    }
    orders.unshift(record)
    write(KEYS.orders, orders)
    return record
  },
  async listOrders({ userId } = {}) {
    await delay()
    const orders = read(KEYS.orders, [])
    return userId ? orders.filter((o) => o.userId === userId) : orders
  },
  async getOrder(id) {
    await delay(150)
    const orders = read(KEYS.orders, [])
    return orders.find((o) => o.id === id) || null
  },
  async updateOrderStatus(id, status) {
    await delay()
    const orders = read(KEYS.orders, [])
    const idx = orders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error('Order not found')
    orders[idx] = { ...orders[idx], status }
    write(KEYS.orders, orders)
    return orders[idx]
  }
}
