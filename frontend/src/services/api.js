import { medicines, stores } from '../data'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const authHeaders = (accessToken) => accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

// This adapter is intentionally small: replace these functions with Axios calls when the Django API is ready.
export const api = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/login/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Invalid email or password.')
    return data
  },
  async register(payload) {
    const response = await fetch(`${API_URL}/register/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json()
    if (!response.ok) throw new Error(Object.values(data).flat().join(' ') || 'Registration failed.')
    return data
  },
  async logout(accessToken) {
    const response = await fetch(`${API_URL}/logout/`, { method: 'POST', headers: authHeaders(accessToken) })
    if (!response.ok && response.status !== 401) throw new Error('Logout failed.')
  },
  async createOrder(payload, accessToken) {
    const response = await fetch(`${API_URL}/orders/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders(accessToken) }, body: JSON.stringify(payload) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Unable to place order.')
    return data
  },
  async getOrders(accessToken) {
    const response = await fetch(`${API_URL}/orders/`, { headers: authHeaders(accessToken) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Unable to load orders.')
    return data
  },
  async getCart(accessToken) {
    const response = await fetch(`${API_URL}/cart/`, { headers: authHeaders(accessToken) })
    if (!response.ok) throw new Error('Unable to load your cart.')
    return response.json()
  },
  async saveCart(items, accessToken) {
    const response = await fetch(`${API_URL}/cart/`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders(accessToken) }, body: JSON.stringify({ items: items.map((item) => ({ medicine: item.id, quantity: item.quantity })) }) })
    if (!response.ok) throw new Error('Unable to save your cart.')
    return response.json()
  },
  async health() {
    const response = await fetch(`${API_URL}/health/`)
    if (!response.ok) throw new Error('API unavailable')
    return response.json()
  },
  async medicinesFromBackend(query = '') {
    const response = await fetch(`${API_URL}/medicines/?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Medicines unavailable')
    return response.json()
  },
  searchMedicines(query = '', category = '') {
    const normalized = query.trim().toLowerCase()
    const normalizedCategory = category.trim().toLowerCase()
    return medicines.filter((medicine) => {
      const matchesQuery = !normalized || `${medicine.name} ${medicine.brand} ${medicine.category}`.toLowerCase().includes(normalized)
      const matchesCategory = !normalizedCategory || medicine.category.toLowerCase() === normalizedCategory
      return matchesQuery && matchesCategory
    })
  },
  storesForArea(area) {
    return area ? stores.filter((store) => store.area === area) : stores
  },
}