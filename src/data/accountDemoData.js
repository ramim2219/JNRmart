/**
 * Display-only sample order history. Nothing here belongs to a real customer.
 * Replace this module with orders fetched from Laravel after authentication.
 */
import { shopProducts } from './shopDemoData';
import { applianceDeals } from './dealsDemoData';

const sampleLine = (product, quantity) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  image: product.image,
  price: product.price,
  quantity,
});

export const demoOrders = [
  {
    id: 'JNR-20481', date: '2026-10-18', status: 'On the way', payment: 'Cash on delivery',
    deliveryFee: 80, tracking: 'Sample tracking: preparing for delivery',
    items: [sampleLine(shopProducts[18], 1), sampleLine(shopProducts[26], 2)],
  },
  {
    id: 'JNR-20420', date: '2026-10-11', status: 'Delivered', payment: 'Cash on delivery',
    deliveryFee: 70, tracking: 'Sample delivery completed',
    items: [sampleLine(shopProducts[22], 1), sampleLine(shopProducts[29], 1)],
  },
  {
    id: 'JNR-20397', date: '2026-10-04', status: 'Processing', payment: 'Cash on delivery',
    deliveryFee: 120, tracking: 'Sample order being prepared',
    items: [sampleLine(applianceDeals[4], 1)],
  },
  {
    id: 'JNR-20251', date: '2026-09-29', status: 'Cancelled', payment: 'Cash on delivery',
    deliveryFee: 0, tracking: 'Sample order was cancelled',
    items: [sampleLine(shopProducts[0], 1)],
  },
];

export const orderAmount = (order) => (
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.deliveryFee
);
export const money = amount => `৳${Number(amount || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
export const dateLabel = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
});

export const blankAddress = {
  id: '', label: 'Home', recipient: '', phone: '', street: '', area: '', city: '', region: '', postalCode: '', isDefault: false,
};
