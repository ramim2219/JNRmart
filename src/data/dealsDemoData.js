/** Demo-only products and prices: NOT real offers or inventory. */
const image = (name) => `/images/deals/${name}.svg`;

export const applianceDeals = [
  { id: 'deal-tv', slug: 'ultra-hd-smart-tv', name: '55 Inch 4K UHD Smart Google Television', image: image('television'), price: 94900, oldPrice: 109900, rating: 4.9, reviewCount: 128, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'deal-fridge', slug: 'premium-inverter-refrigerator', name: 'Premium 238L Inverter Refrigerator', image: image('refrigerator'), price: 28390, oldPrice: 42900, rating: 4.8, reviewCount: 56, deliveryText: 'Estimated delivery: 3–5 days' },
  { id: 'deal-ac', slug: 'dc-inverter-air-conditioner', name: '1.5 Ton Energy Saving DC Inverter AC', image: image('ac'), price: 43990, oldPrice: 73900, rating: 4.8, reviewCount: 82, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'deal-washer', slug: 'automatic-washing-machine', name: '7.5kg Top Loading Automatic Washing Machine', image: image('washer'), price: 20990, oldPrice: 29900, rating: 4.7, reviewCount: 34, deliveryText: 'Estimated delivery: 3–5 days' },
  { id: 'deal-fryer', slug: 'digital-air-fryer', name: '6L Digital Air Fryer with Smart Touch', image: image('airfryer'), price: 7990, oldPrice: 11990, rating: 4.9, reviewCount: 212, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'deal-microwave', slug: 'digital-microwave-oven', name: '25L Digital Microwave Oven with Grill', image: image('microwave'), price: 13490, oldPrice: 16990, rating: 4.6, reviewCount: 43, deliveryText: 'Estimated delivery: 3–5 days' },
  { id: 'deal-blender', slug: 'blender-mixer-grinder', name: 'Multi-Purpose Mixer Grinder Blender', image: image('mixer'), price: 4390, oldPrice: 5290, rating: 4.5, reviewCount: 78, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'deal-vacuum', slug: 'smart-robot-vacuum', name: 'Smart Robot Vacuum Cleaner', image: image('vacuum'), price: 18990, oldPrice: 22990, rating: 4.7, reviewCount: 33, deliveryText: 'Estimated delivery: 3–5 days' },
];

export const electronicsDeals = [
  { id: 'ele-phone', slug: '5g-smartphone', name: '5G Smartphone with AMOLED Display', image: image('phone'), price: 22990, oldPrice: 27990, rating: 4.8, reviewCount: 182, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'ele-laptop', slug: 'business-ultrabook', name: 'Lightweight Business Laptop 14 Inch', image: image('laptop'), price: 54990, oldPrice: 66990, rating: 4.9, reviewCount: 71, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'ele-tv', slug: 'ultra-hd-smart-tv', name: '55 Inch 4K UHD Smart Google Television', image: image('television'), price: 94900, oldPrice: 109900, rating: 4.9, reviewCount: 128, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'ele-ac', slug: 'dc-inverter-air-conditioner', name: '1.5 Ton Energy Saving DC Inverter AC', image: image('ac'), price: 43990, oldPrice: 73900, rating: 4.8, reviewCount: 82, deliveryText: 'Estimated delivery: 2–3 days' },
  { id: 'ele-vacuum', slug: 'smart-robot-vacuum', name: 'Smart Robot Vacuum Cleaner', image: image('vacuum'), price: 18990, oldPrice: 22990, rating: 4.7, reviewCount: 33, deliveryText: 'Estimated delivery: 3–5 days' },
  { id: 'ele-fryer', slug: 'digital-air-fryer', name: '6L Digital Air Fryer with Smart Touch', image: image('airfryer'), price: 7990, oldPrice: 11990, rating: 4.9, reviewCount: 212, deliveryText: 'Estimated delivery: 2–3 days' },
];
