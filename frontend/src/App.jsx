import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bell, ChevronDown, Clock3, Heart, MapPin, Menu, Search, ShoppingBag, ShieldCheck, Star, Truck, UserRound, X } from 'lucide-react'
import { api } from './services/api'
import { areasByState, categories, medicines } from './data'

const money = (value) => `₹${value.toLocaleString('en-IN')}`

function App() {
  const [activeView, setActiveView] = useState('home')
  const [authMode, setAuthMode] = useState('login')
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('medinear_session') || 'null'))
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedArea, setSelectedArea] = useState('Eluru')
  const [selectedState, setSelectedState] = useState('Andhra Pradesh')
  const [cart, setCart] = useState([{ ...medicines[0], quantity: 2 }, { ...medicines[1], quantity: 1 }])
  const [wishlist, setWishlist] = useState([medicines[5].id])
  const [toast, setToast] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [order, setOrder] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [cartReady, setCartReady] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    api.health().then(() => setBackendOnline(true)).catch(() => setBackendOnline(false))
  }, [])

  useEffect(() => {
    if (!session || activeView !== 'orders') return
    api.getOrders(session.access).then((orders) => {
      if (orders.length) setOrder({ id: orders[0].order_id, total: Number(orders[0].total_amount), status: orders[0].status, date: new Date(orders[0].created_at).toLocaleString() })
    }).catch(() => notify('Unable to load your orders right now'))
  }, [activeView, session])

  useEffect(() => {
    if (!session) {
      setCartReady(false)
      return
    }
    setCartReady(false)
    api.getCart(session.access).then((savedItems) => {
      setCart(savedItems.map((item) => ({ id: item.medicine, name: item.medicine_name, brand: item.brand, price: Number(item.price), oldPrice: Number(item.price), store: item.store_name, requiresPrescription: item.prescription_required, quantity: item.quantity, color: 'mint' })))
    }).catch(() => notify('Unable to load your saved cart')).finally(() => setCartReady(true))
  }, [session])

  useEffect(() => {
    if (session && cartReady) api.saveCart(cart, session.access).catch(() => notify('Unable to save your cart'))
  }, [cart, cartReady, session])

  const results = useMemo(() => api.searchMedicines(search, selectedCategory), [search, selectedCategory])
  const nearbyStores = useMemo(() => api.storesForArea(selectedArea), [selectedArea])
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const delivery = subtotal >= 500 ? 0 : 30

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const addToCart = (medicine) => {
    setCart((items) => items.some((item) => item.id === medicine.id)
      ? items.map((item) => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { ...medicine, quantity: 1 }])
    notify(`${medicine.name} added to your cart`)
  }

  const updateQuantity = (id, change) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item))
  const toggleWishlist = (id) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const placeOrder = async () => {
    if (!session) {
      setAuthMode('login')
      setActiveView('auth')
      notify('Please log in before placing an order')
      return
    }
    setOrderLoading(true)
    try {
      const savedOrder = await api.createOrder({ items: cart.map((item) => ({ medicine: item.id, quantity: item.quantity })), delivery_charge: delivery, payment_method: 'COD' }, session.access)
      setOrder({ id: savedOrder.order_id, total: Number(savedOrder.total_amount), status: savedOrder.status, date: new Date(savedOrder.created_at).toLocaleString() })
      setCart([])
      setActiveView('orders')
      notify('Your order has been saved successfully')
    } catch (error) {
      notify(error.message)
    } finally {
      setOrderLoading(false)
    }
  }

  const handleAuth = (data) => {
    localStorage.setItem('medinear_session', JSON.stringify(data))
    localStorage.setItem('medinear_access_token', data.access)
    setSession(data)
    setActiveView('home')
    notify(`Welcome to MediNear, ${data.user.name.split(' ')[0]}`)
  }

  const logout = async () => {
    try {
      await api.logout(localStorage.getItem('medinear_access_token'))
    } finally {
      localStorage.removeItem('medinear_session')
      localStorage.removeItem('medinear_access_token')
      setSession(null)
      setActiveView('home')
      notify('You have been logged out')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container nav-inner">
          <button className="brand" onClick={() => setActiveView('home')} aria-label="Go to MediNear home"><span className="brand-mark">+</span><span>Medi<span>Near</span></span></button>
          <nav className={mobileMenu ? 'main-nav is-open' : 'main-nav'}>
            {['home', 'medicines', 'stores', 'orders'].map((view) => <button key={view} className={activeView === view ? 'nav-link active' : 'nav-link'} onClick={() => { setActiveView(view); setMobileMenu(false) }}>{view === 'home' ? 'Home' : view === 'stores' ? 'Medical Stores' : view === 'orders' ? 'My Orders' : 'Medicines'}</button>)}
          </nav>
          <div className="nav-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <button className="cart-button" onClick={() => setActiveView('cart')} aria-label="Open cart"><ShoppingBag size={19} /><span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span></button>
            {session ? <button className="profile-button" onClick={() => setActiveView('profile')}><span className="avatar">{session.user.name.slice(0, 2).toUpperCase()}</span><span className="profile-name">{session.user.name.split(' ')[0]}</span><ChevronDown size={15} /></button> : <button className="login-link" onClick={() => { setAuthMode('login'); setActiveView('auth') }}>Log in</button>}
          </div>
          <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        {activeView === 'auth' && <AuthScreen mode={authMode} setMode={setAuthMode} onAuthenticated={handleAuth} />}
        {activeView === 'home' && <Home search={search} setSearch={setSearch} setActiveView={setActiveView} selectedArea={selectedArea} selectedState={selectedState} setSelectedArea={setSelectedArea} setSelectedState={setSelectedState} addToCart={addToCart} results={results} nearbyStores={nearbyStores} backendOnline={backendOnline} setSelectedCategory={setSelectedCategory} />}
        {activeView === 'medicines' && <MedicineCatalog search={search} setSearch={setSearch} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} results={results} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
        {activeView === 'stores' && <StoreDirectory selectedArea={selectedArea} setSelectedArea={setSelectedArea} stores={nearbyStores} />}
        {activeView === 'cart' && <Cart cart={cart} updateQuantity={updateQuantity} setActiveView={setActiveView} subtotal={subtotal} delivery={delivery} />}
        {activeView === 'checkout' && <Checkout cart={cart} subtotal={subtotal} delivery={delivery} placeOrder={placeOrder} orderLoading={orderLoading} setActiveView={setActiveView} />}
        {activeView === 'orders' && <Orders order={order} setActiveView={setActiveView} />}
        {activeView === 'tracking' && <Tracking order={order} setActiveView={setActiveView} />}
        {activeView === 'profile' && <Profile wishlist={wishlist} setActiveView={setActiveView} session={session} logout={logout} />}
      </main>
      <footer className="footer"><div className="container footer-inner"><div><div className="brand footer-brand"><span className="brand-mark">+</span><span>Medi<span>Near</span></span></div><p>Better access to everyday healthcare.</p></div><div className="footer-links"><span>Privacy</span><span>Help center</span><span>For pharmacies</span></div><span className="copyright">© 2025 MediNear</span></div></footer>
      {toast && <div className="toast"><ShieldCheck size={18} />{toast}</div>}
    </div>
  )
}

function Home({ search, setSearch, setActiveView, selectedArea, selectedState, setSelectedArea, setSelectedState, addToCart, results, nearbyStores, backendOnline, setSelectedCategory }) {
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span /> YOUR HEALTH, CLOSER</p><h1>Medicines near you, <em>delivered</em> to your door.</h1><p className="hero-text">Find trusted pharmacies, check availability and get what you need without the extra trip.</p><div className="hero-search"><Search size={20} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines, brands or categories" /><button onClick={() => setActiveView('medicines')}>Search</button></div><div className="location-row"><MapPin size={16} /><span>Delivering to</span><select value={selectedState} onChange={(event) => { setSelectedState(event.target.value); setSelectedArea(areasByState[event.target.value][0]) }}>{Object.keys(areasByState).map((state) => <option key={state}>{state}</option>)}</select><select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>{areasByState[selectedState].map((area) => <option key={area}>{area}</option>)}</select></div></div><div className="hero-art"><div className="art-glow" /><div className="medicine-bottle"><span>MEDI</span><strong>NEAR</strong><small>CARE, DELIVERED</small></div><div className="floating-note note-top"><ShieldCheck size={17} /><div><strong>Trusted care</strong><small>Verified pharmacies</small></div></div><div className="floating-note note-bottom"><Truck size={17} /><div><strong>Fast delivery</strong><small>At your doorstep</small></div></div></div></div></section>
    <section className="trust-strip"><div className="container trust-grid"><div><ShieldCheck /><span><strong>Verified pharmacies</strong><small>Quality you can trust</small></span></div><div><Clock3 /><span><strong>Quick delivery</strong><small>As soon as 30 minutes</small></span></div><div><Heart /><span><strong>Care first</strong><small>Support when you need it</small></span></div></div></section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">EXPLORE</p><h2>What are you looking for?</h2></div><button className="text-button" onClick={() => { setSelectedCategory(''); setActiveView('medicines') }}>View all <ArrowRight size={16} /></button></div><div className="category-grid">{categories.slice(0, 6).map((category, index) => <button className={`category-card category-${index}`} key={category} onClick={() => { setSelectedCategory(category); setActiveView('medicines') }}><span className="category-icon">{['✚', '◌', '⌁', '♡', '✦', '◉'][index]}</span><strong>{category}</strong><small>{[24, 18, 31, 16, 42, 12][index]} products</small></button>)}</div></section>
    <section className="section soft-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">POPULAR NEAR YOU</p><h2>Pharmacies in {selectedArea}</h2></div><button className="text-button" onClick={() => setActiveView('stores')}>See all stores <ArrowRight size={16} /></button></div><div className="store-grid">{nearbyStores.slice(0, 3).map((store) => <StoreCard key={store.id} store={store} />)}</div></div></section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">MOST SEARCHED</p><h2>Essentials for your shelf</h2></div><button className="text-button" onClick={() => setActiveView('medicines')}>Browse medicines <ArrowRight size={16} /></button></div><div className="medicine-grid">{results.slice(0, 4).map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} addToCart={addToCart} />)}</div></section>
  </>
}

function StoreCard({ store }) { return <article className="store-card"><div className={`store-logo ${store.accent}`}>{store.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="store-info"><div className="store-title"><h3>{store.name}</h3><span className={store.open ? 'open-dot' : 'closed-dot'}>{store.open ? 'Open' : 'Closed'}</span></div><p>{store.area} · {store.distance}</p><div className="store-meta"><span><Star size={14} fill="currentColor" /> {store.rating}</span><span><Truck size={14} /> {store.eta}</span></div></div><button className="round-arrow" aria-label={`View ${store.name}`}><ArrowRight size={17} /></button></article> }

function MedicineCard({ medicine, addToCart, wishlist, toggleWishlist }) { return <article className="medicine-card"><div className={`medicine-image ${medicine.color}`}><span>{medicine.name.split(' ')[0].slice(0, 3).toUpperCase()}</span><button className={wishlist?.includes(medicine.id) ? 'wish active' : 'wish'} onClick={() => toggleWishlist?.(medicine.id)} aria-label="Add to wishlist"><Heart size={17} fill={wishlist?.includes(medicine.id) ? 'currentColor' : 'none'} /></button></div><div className="medicine-info"><small>{medicine.brand} · {medicine.category}</small><h3>{medicine.name}</h3><div className="medicine-bottom"><div><strong>{money(medicine.price)}</strong><del>{money(medicine.oldPrice)}</del></div><button className="add-button" onClick={() => addToCart(medicine)}>+ Add</button></div></div></article> }

function MedicineCatalog({ search, setSearch, selectedCategory, setSelectedCategory, results, addToCart, wishlist, toggleWishlist }) { return <section className="page-section container"><div className="page-header"><div><p className="eyebrow">THE MEDICINE CABINET</p><h1>Find what you need.</h1><p>Compare products from verified pharmacies around you.</p></div><div className="catalog-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicines..." /></div></div><div className="filter-row"><button className={selectedCategory ? 'filter' : 'filter active'} onClick={() => setSelectedCategory('')}>All medicines</button>{categories.slice(0, 5).map((category) => <button className={selectedCategory === category ? 'filter active' : 'filter'} key={category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div><div className="medicine-grid large-grid">{results.map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />)}</div>{!results.length && <div className="empty-state"><Search size={30} /><h3>No medicines found</h3><p>Try a different name, brand or category.</p></div>}</section> }

function StoreDirectory({ selectedArea, setSelectedArea, stores }) { return <section className="page-section container"><div className="page-header"><div><p className="eyebrow">NEARBY PHARMACIES</p><h1>Care around the corner.</h1><p>Browse trusted stores and find the right delivery option.</p></div><select className="area-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>{Object.values(areasByState).flat().map((area) => <option key={area}>{area}</option>)}</select></div><div className="filter-row"><button className="filter active">All stores</button><button className="filter">Open now</button><button className="filter">Home delivery</button><button className="filter">Top rated</button></div><div className="store-list">{stores.map((store) => <StoreCard key={store.id} store={store} />)}</div></section> }

function Cart({ cart, updateQuantity, setActiveView, subtotal, delivery }) { return <section className="page-section container narrow-page"><div className="page-header compact"><div><p className="eyebrow">YOUR BAG</p><h1>Ready when you are.</h1></div></div>{cart.length ? <div className="cart-layout"><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><div className={`medicine-image small ${item.color}`}><span>{item.name.slice(0, 3).toUpperCase()}</span></div><div className="cart-item-info"><h3>{item.name}</h3><small>{item.store} · {item.requiresPrescription ? 'Prescription required' : 'No prescription needed'}</small><strong>{money(item.price)}</strong></div><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}>-</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}>+</button></div></div>)}</div><aside className="summary"><h3>Order summary</h3><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>{delivery ? money(delivery) : 'Free'}</strong></div><div className="summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><button className="primary-button full" onClick={() => setActiveView('checkout')}>Proceed to checkout <ArrowRight size={17} /></button><p className="secure-note"><ShieldCheck size={15} /> Secure checkout</p></aside></div> : <div className="empty-state"><ShoppingBag size={30} /><h3>Your cart is empty</h3><p>Add medicines to get started.</p><button className="primary-button" onClick={() => setActiveView('medicines')}>Browse medicines</button></div>}</section> }

function Orders({ order, setActiveView }) { return <section className="page-section container narrow-page"><div className="page-header compact"><div><p className="eyebrow">YOUR HEALTH LOG</p><h1>My orders</h1></div><button className="primary-button" onClick={() => setActiveView('medicines')}>Order medicines <ArrowRight size={16} /></button></div>{order ? <article className="order-card"><div className="order-top"><div><small>ORDER ID</small><h3>{order.id}</h3></div><span className="status-pill"><span />{order.status}</span></div><div className="order-progress"><span className="done">Placed</span><span>Confirmed</span><span>Preparing</span><span>Delivered</span></div><div className="order-bottom"><span>{order.date}</span><strong>{money(order.total)}</strong><button className="text-button" onClick={() => setActiveView('tracking')}>Track order <ArrowRight size={15} /></button></div></article> : <div className="empty-state"><Truck size={30} /><h3>No orders yet</h3><p>Your completed and active orders will appear here.</p><button className="primary-button" onClick={() => setActiveView('medicines')}>Explore medicines</button></div>}</section> }

function Checkout({ cart, subtotal, delivery, placeOrder, orderLoading, setActiveView }) { return <section className="page-section container narrow-page"><div className="page-header compact"><div><p className="eyebrow">CHECKOUT</p><h1>Almost there.</h1><p>Review your details and choose how you would like to pay.</p></div></div><div className="checkout-layout"><div className="checkout-form"><div className="checkout-block"><h3>Delivery address</h3><div className="address-option"><MapPin size={18} /><div><strong>Arjun Sharma</strong><p>12-4-88, Ramachandra Rao Peta, Eluru, Andhra Pradesh 534005</p><small>+91 98765 43210</small></div><span className="radio selected" /></div></div><div className="checkout-block"><h3>Delivery option</h3><div className="delivery-options"><label><input type="radio" name="delivery" defaultChecked /><span><strong>Standard delivery</strong><small>30-60 minutes</small></span><b>{delivery ? money(delivery) : 'Free'}</b></label><label><input type="radio" name="delivery" /><span><strong>Express delivery</strong><small>15-30 minutes</small></span><b>₹60</b></label><label><input type="radio" name="delivery" /><span><strong>Store pickup</strong><small>Ready in 20 minutes</small></span><b>Free</b></label></div></div><div className="checkout-block"><h3>Payment method</h3><div className="delivery-options"><label><input type="radio" name="payment" defaultChecked /><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span><b>COD</b></label><label><input type="radio" name="payment" /><span><strong>Online payment</strong><small>UPI, card or net banking</small></span><b>Secure</b></label></div></div></div><aside className="summary"><h3>Order summary</h3>{cart.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<div><span>Delivery</span><strong>{delivery ? money(delivery) : 'Free'}</strong></div><div className="summary-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><button className="primary-button full" disabled={!cart.length || orderLoading} onClick={placeOrder}>{orderLoading ? 'Saving order...' : 'Place order'} <ArrowRight size={17} /></button><button className="back-button" onClick={() => setActiveView('cart')}>Back to cart</button></aside></div></section> }

function Tracking({ order, setActiveView }) { return <section className="page-section container narrow-page"><div className="page-header compact"><div><p className="eyebrow">LIVE ORDER STATUS</p><h1>Your order is on its way.</h1><p>{order ? `${order.id} · Arriving in 30-45 minutes` : 'Place an order to see delivery updates.'}</p></div></div>{order ? <div className="tracking-card"><div className="tracking-route"><div className="route-point done"><span><ShieldCheck size={17} /></span><div><strong>Order placed</strong><small>10:42 AM</small></div></div><div className="route-line done" /><div className="route-point"><span><ShoppingBag size={17} /></span><div><strong>Store preparing</strong><small>Up next</small></div></div><div className="route-line" /><div className="route-point"><span><Truck size={17} /></span><div><strong>Out for delivery</strong><small>Pending</small></div></div><div className="route-line" /><div className="route-point"><span><MapPin size={17} /></span><div><strong>Delivered</strong><small>Pending</small></div></div></div><div className="tracking-footer"><span><Clock3 size={16} /> Estimated arrival <strong>11:15-11:30 AM</strong></span><button className="text-button" onClick={() => setActiveView('orders')}>Order details <ArrowRight size={15} /></button></div></div> : <button className="primary-button" onClick={() => setActiveView('medicines')}>Browse medicines</button>}</section> }

function AuthScreen({ mode, setMode, onAuthenticated }) {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.email || !form.password || (mode === 'register' && !form.first_name)) return setError('Please complete all required fields.')
    setLoading(true)
    try {
      const data = mode === 'login' ? await api.login(form.email, form.password) : await api.register(form)
      onAuthenticated(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <section className="auth-page"><div className="auth-panel"><div className="auth-intro"><button className="brand auth-brand" onClick={() => window.location.reload()}><span className="brand-mark">+</span><span>Medi<span>Near</span></span></button><p className="eyebrow">YOUR HEALTH, CLOSER</p><h1>{mode === 'login' ? 'Welcome back.' : 'Start your better care journey.'}</h1><p>{mode === 'login' ? 'Sign in to manage your medicines, orders and delivery addresses.' : 'Create your account and get trusted pharmacy care delivered nearby.'}</p><div className="auth-points"><span><ShieldCheck size={17} /> Verified local pharmacies</span><span><Truck size={17} /> Quick, reliable delivery</span></div></div><form className="auth-form" onSubmit={submit}><div className="auth-form-header"><p className="eyebrow">{mode === 'login' ? 'CUSTOMER LOGIN' : 'CREATE ACCOUNT'}</p><h2>{mode === 'login' ? 'Log in to MediNear' : 'Join MediNear'}</h2></div>{mode === 'register' && <div className="field-row"><label>First name<input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} placeholder="Arjun" /></label><label>Last name<input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} placeholder="Sharma" /></label></div>}<label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" autoComplete="email" /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button full" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'} <ArrowRight size={16} /></button><p className="auth-switch">{mode === 'login' ? 'New to MediNear?' : 'Already have an account?'} <button type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login') }}>{mode === 'login' ? 'Create an account' : 'Log in instead'}</button></p></form></div></section>
}

function Profile({ wishlist, setActiveView, session, logout }) { return <section className="page-section container narrow-page"><div className="page-header compact"><div><p className="eyebrow">ACCOUNT</p><h1>Good morning, {session?.user.name.split(' ')[0] || 'there'}.</h1></div><button className="secondary-button" onClick={logout}>Log out</button></div><div className="profile-layout"><div className="profile-card"><div className="profile-avatar">{session?.user.name.slice(0, 2).toUpperCase() || 'MN'}</div><h2>{session?.user.name || 'MediNear customer'}</h2><p>{session?.user.email || 'Sign in to view your account'}</p><button className="secondary-button">Edit profile</button></div><div className="settings-list"><button onClick={() => setActiveView('orders')}><ShoppingBag size={19} /><span><strong>My orders</strong><small>View your order history</small></span><ArrowRight size={17} /></button><button><Heart size={19} /><span><strong>Wishlist</strong><small>{wishlist.length} saved items</small></span><ArrowRight size={17} /></button><button><MapPin size={19} /><span><strong>Delivery addresses</strong><small>Manage your saved addresses</small></span><ArrowRight size={17} /></button></div></div></section> }

export default App
