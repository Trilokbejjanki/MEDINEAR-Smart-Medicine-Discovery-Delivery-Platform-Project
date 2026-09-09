export const stores = [
  { id: 1, name: 'Sri Sai Medicals', area: 'Eluru', rating: 4.8, distance: '1.2 km', eta: '25-35 min', open: true, accent: 'teal', tags: ['Home delivery', 'Prescription'] },
  { id: 2, name: 'Apollo Pharmacy', area: 'Eluru', rating: 4.6, distance: '2.4 km', eta: '30-40 min', open: true, accent: 'coral', tags: ['Home delivery'] },
  { id: 3, name: 'Care & Cure Pharmacy', area: 'Vijayawada', rating: 4.7, distance: '0.8 km', eta: '15-25 min', open: true, accent: 'gold', tags: ['Home delivery', 'Prescription'] },
  { id: 4, name: 'Wellness Point', area: 'Hyderabad', rating: 4.5, distance: '1.8 km', eta: '20-30 min', open: false, accent: 'blue', tags: ['Prescription'] },
]

export const medicines = [
  { id: 1, name: 'Paracetamol 500mg', brand: 'Calpol', category: 'Pain Relief', price: 25, oldPrice: 32, stock: 'In stock', store: 'Sri Sai Medicals', requiresPrescription: false, color: 'mint', description: 'For temporary relief from fever and mild to moderate pain.' },
  { id: 2, name: 'Vitamin C 500mg', brand: 'Limcee', category: 'Vitamins', price: 80, oldPrice: 96, stock: 'In stock', store: 'Sri Sai Medicals', requiresPrescription: false, color: 'peach', description: 'A daily vitamin C supplement for immune support.' },
  { id: 3, name: 'Azithromycin 500mg', brand: 'Azee', category: 'Tablets', price: 110, oldPrice: 125, stock: 'Prescription required', store: 'Apollo Pharmacy', requiresPrescription: true, color: 'lilac', description: 'Antibiotic medicine. Take only as prescribed by your doctor.' },
  { id: 4, name: 'Cetirizine 10mg', brand: 'Cetzine', category: 'Cold & Fever', price: 42, oldPrice: 50, stock: 'In stock', store: 'Care & Cure Pharmacy', requiresPrescription: false, color: 'sky', description: 'Helps relieve allergy symptoms such as sneezing and itching.' },
  { id: 5, name: 'Dolo 650mg', brand: 'Micro Labs', category: 'Pain Relief', price: 35, oldPrice: 40, stock: 'In stock', store: 'Sri Sai Medicals', requiresPrescription: false, color: 'yellow', description: 'Paracetamol tablets for fever and body pain relief.' },
  { id: 6, name: 'Glucometer Kit', brand: 'Dr. Morepen', category: 'Health Devices', price: 649, oldPrice: 799, stock: 'In stock', store: 'Apollo Pharmacy', requiresPrescription: false, color: 'blue', description: 'Compact blood glucose monitoring kit with strips.' },
  { id: 7, name: 'Omeprazole 20mg', brand: 'Omez', category: 'Capsules', price: 65, oldPrice: 78, stock: 'In stock', store: 'Apollo Pharmacy', requiresPrescription: false, color: 'lilac', description: 'Helps reduce excess stomach acid and heartburn.' },
  { id: 8, name: 'Cough Relief Syrup', brand: 'Benadryl', category: 'Syrups', price: 95, oldPrice: 110, stock: 'In stock', store: 'Care & Cure Pharmacy', requiresPrescription: false, color: 'peach', description: 'Soothing cough relief for day and night.' },
  { id: 9, name: 'Antiseptic Liquid 100ml', brand: 'Dettol', category: 'First Aid', price: 75, oldPrice: 88, stock: 'In stock', store: 'Sri Sai Medicals', requiresPrescription: false, color: 'mint', description: 'For cleaning minor cuts, wounds and abrasions.' },
]

export const categories = ['Tablets', 'Capsules', 'Syrups', 'First Aid', 'Vitamins', 'Pain Relief', 'Cold & Fever', 'Diabetes Care', 'Baby Care', 'Health Devices']

export const areasByState = {
  'Andhra Pradesh': ['Eluru', 'Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Rajahmundry'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Nalgonda'],
}