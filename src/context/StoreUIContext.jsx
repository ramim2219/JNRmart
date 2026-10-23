import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from '../components/common/ToastProvider';

const StoreUIContext = createContext(null);
const WISHLIST_KEY = 'jnrmart:wishlist:v1';
const CART_KEY = 'jnrmart:cart:v1';
const formatMoney = (value) => `৳${Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 })}`;

function readItems(key) {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function loadCart() {
  return readItems(CART_KEY)
    .filter(item => item && item.id != null && typeof item.name === 'string')
    .map(item => ({
      id: item.id,
      slug: typeof item.slug === 'string' ? item.slug : '',
      name: item.name,
      price: Number.isFinite(Number(item.price)) && Number(item.price) >= 0 ? Number(item.price) : 0,
      image: typeof item.image === 'string' ? item.image : '',
      quantity: Number.isFinite(Number(item.quantity)) ? Math.min(999, Math.max(1, Math.trunc(Number(item.quantity)))) : 1,
      selected: item.selected !== false, // existing carts default to fully selected
    }))
    .slice(0, 150);
}

function loadWishlist() {
  return readItems(WISHLIST_KEY)
    .filter(item => item && item.id != null && typeof item.name === 'string')
    .map(item => ({
      id: item.id,
      name: item.name,
      slug: typeof item.slug === 'string' ? item.slug : '',
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
      image: typeof item.image === 'string' ? item.image : '',
      brand: typeof item.brand === 'string' ? item.brand : '',
    })).slice(0, 150);
}

function wishlistProduct(product) {
  return {
    id: product.id,
    name: product.name || product.title || 'Product',
    slug: product.slug || '',
    price: Number(product.price) || 0,
    image: product.image || product.thumbnail || '',
    brand: product.brand || '',
  };
}

export function StoreUIProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [wishlist, setWishlist] = useState(loadWishlist);
  const [panel, setPanel] = useState(null); // menu | cart | wishlist | search | null
  const toast = useToast();
  const openPanel = useCallback((name) => setPanel(name), []);
  const closePanel = useCallback(() => setPanel(null), []);

  useEffect(() => {
    try { window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }
    catch { /* Browser storage is optional. */ }
  }, [wishlist]);

  useEffect(() => {
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch { /* Cart still works in React state when storage is unavailable. */ }
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    const price = Number(product?.price);
    if (product?.id == null || !Number.isFinite(price) || price < 0) {
      toast.error('Could not add this product.', { id: 'cart-add', title: 'Invalid Product' });
      return false;
    }
    const amount = Number.isFinite(Number(quantity)) ? Math.min(999, Math.max(1, Math.floor(Number(quantity)))) : 1;
    setCart(previous => {
      const existing = previous.find(item => String(item.id) === String(product.id));
      if (existing) return previous.map(item => String(item.id) === String(product.id)
        ? { ...item, quantity: Math.min(999, item.quantity + amount) } : item);
      return [...previous, {
        id: product.id, slug: product.slug || '',
        name: product.name || product.title || 'Product',
        price, image: product.image || product.thumbnail || '', quantity: amount,
        selected: true, // every newly added product participates in checkout by default
      }];
    });
    toast.success(`${amount} × ${product.name || product.title || 'Product'} added to cart.`, {
      id: 'cart-add', title: 'Added to Cart', actionLabel: 'View Cart', onAction: () => openPanel('cart'),
    });
    return true;
  }, [openPanel, toast]);

  const changeQuantity = useCallback((id, delta) => {
    const item = cart.find(entry => String(entry.id) === String(id));
    if (!item || !Number.isInteger(delta) || delta === 0) return;
    const updated = Math.min(999, item.quantity + delta);
    setCart(previous => previous.map(entry => String(entry.id) === String(id)
      ? { ...entry, quantity: Math.min(999, entry.quantity + delta) } : entry)
      .filter(entry => entry.quantity > 0));
    if (updated <= 0) toast.info(`${item.name} removed from cart.`, { id: 'cart-quantity', title: 'Cart Updated' });
    else toast.info(`Quantity updated to ${updated}.`, { id: 'cart-quantity', title: 'Cart Updated' });
  }, [cart, toast]);

  const removeItem = useCallback(id => {
    const item = cart.find(entry => String(entry.id) === String(id));
    if (!item) return;
    setCart(previous => previous.filter(entry => String(entry.id) !== String(id)));
    toast.info(`${item.name} removed from cart.`, { id: 'cart-remove', title: 'Item Removed' });
  }, [cart, toast]);

  // Cart selections live in shared state, so the drawer and /checkout stay in sync.
  const toggleCartSelection = useCallback(id => {
    setCart(previous => previous.map(item => String(item.id) === String(id)
      ? { ...item, selected: !item.selected } : item));
  }, []);

  const selectAllCartItems = useCallback(checked => {
    setCart(previous => previous.map(item => ({ ...item, selected: Boolean(checked) })));
  }, []);

  const isWishlisted = useCallback(id => wishlist.some(item => String(item.id) === String(id)), [wishlist]);
  const addToWishlist = useCallback(product => {
    if (product?.id == null) {
      toast.error('Could not save this product.', { id: 'wishlist-invalid', title: 'Invalid Product' });
      return false;
    }
    if (wishlist.some(item => String(item.id) === String(product.id))) return true;
    setWishlist(previous => [...previous, wishlistProduct(product)]);
    toast.success(`${product.name || product.title || 'Product'} saved to wishlist.`, {
      id: 'wishlist-add', title: 'Added to Wishlist', actionLabel: 'View Wishlist', onAction: () => openPanel('wishlist'),
    });
    return true;
  }, [wishlist, openPanel, toast]);

  const removeFromWishlist = useCallback(id => {
    const item = wishlist.find(entry => String(entry.id) === String(id));
    if (!item) return;
    setWishlist(previous => previous.filter(entry => String(entry.id) !== String(id)));
    toast.info(`${item.name} removed from wishlist.`, { id: 'wishlist-remove', title: 'Wishlist Updated' });
  }, [wishlist, toast]);

  const toggleWishlist = useCallback(product => {
    if (product?.id == null) return false;
    if (wishlist.some(item => String(item.id) === String(product.id))) {
      removeFromWishlist(product.id);
      return false;
    }
    addToWishlist(product);
    return true;
  }, [wishlist, addToWishlist, removeFromWishlist]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCartItems = cart.filter(item => item.selected !== false);
  const selectedCount = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const allCartSelected = cart.length > 0 && selectedCartItems.length === cart.length;
  const wishlistCount = wishlist.length;

  const value = useMemo(() => ({
    cart, count, total, panel, openPanel, closePanel, addToCart, changeQuantity,
    removeItem, formatMoney, wishlist, wishlistCount, isWishlisted,
    addToWishlist, removeFromWishlist, toggleWishlist,
    selectedCartItems, selectedCount, selectedTotal, allCartSelected,
    toggleCartSelection, selectAllCartItems,
  }), [cart, count, total, panel, openPanel, closePanel, addToCart, changeQuantity,
    removeItem, wishlist, wishlistCount, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist,
    selectedCartItems, selectedCount, selectedTotal, allCartSelected, toggleCartSelection, selectAllCartItems]);

  return <StoreUIContext.Provider value={value}>{children}</StoreUIContext.Provider>;
}

export function useStoreUI() {
  const value = useContext(StoreUIContext);
  if (!value) throw new Error('useStoreUI must be used within StoreUIProvider');
  return value;
}
