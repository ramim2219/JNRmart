import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Preloader from './components/common/Preloader';
import { StoreUIProvider } from './context/StoreUIContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const ComboDetailsPage = lazy(() => import('./pages/ComboDetailsPage'));
const OfferProductsPage = lazy(() => import('./pages/OfferProductsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StoreUIProvider>
        <Suspense fallback={<Preloader />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="products" element={<ShopPage />} />
              <Route path="category/:slug" element={<ShopPage />} />
              <Route path="search" element={<ShopPage />} />
              <Route path="product/:slug" element={<ProductDetailsPage />} />
              <Route path="product/combo/:comboId" element={<ComboDetailsPage />} />
              <Route path="offers" element={<OfferProductsPage />} />
              <Route path="offers/:offerId" element={<OfferProductsPage />} />
              <Route path="combos" element={<Navigate to="/shop?category=combo" replace />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="account/*" element={<AccountPage />} />
              {['cart', 'wishlist', 'about', 'contact', 'faq', 'track-order', 'privacy-policy', 'terms'].map(path => (
                <Route key={path} path={path} element={<PlaceholderPage />} />
              ))}
              <Route path="*" element={<PlaceholderPage />} />
            </Route>
          </Routes>
        </Suspense>
      </StoreUIProvider>
    </BrowserRouter>
  );
}
