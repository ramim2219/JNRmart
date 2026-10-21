import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const StoreUIContext = createContext(null);
const formatMoney = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`;

export function StoreUIProvider({ children }) {
  const [cart, setCart] = useState([]); // demo state; connect to Laravel cart service later
  const [panel, setPanel] = useState(null); // 'menu' | 'cart' | 'search' | null
  const openPanel = useCallback((name) => setPanel(name), []);
  const closePanel = useCallback(() => setPanel(null), []);
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.id || !Number.isFinite(Number(product.price))) return;
    setCart(previous => {
      const existing = previous.find(item => item.id === product.id);
      if (existing) return previous.map(item => item.id === product.id ? { ...item, quantity: item.quantity + Math.max(1, quantity) } : item);
      return [...previous, { id: product.id, name: product.name || 'Product', price: Number(product.price), image: product.image || '', quantity: Math.max(1, quantity) }];
    });
  }, []);
  const changeQuantity = useCallback((id, delta) => setCart(previous => previous.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0)), []);
  const removeItem = useCallback(id => setCart(previous => previous.filter(item => item.id !== id)), []);
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ cart, count, total, panel, openPanel, closePanel, addToCart, changeQuantity, removeItem, formatMoney }), [cart, count, total, panel, openPanel, closePanel, addToCart, changeQuantity, removeItem]);
  return <StoreUIContext.Provider value={value}>{children}</StoreUIContext.Provider>;
}
export function useStoreUI() {
  const value = useContext(StoreUIContext);
  if (!value) throw new Error('useStoreUI must be used within StoreUIProvider');
  return value;
}
