import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Preloader from './components/common/Preloader';
import { StoreUIProvider } from './context/StoreUIContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

export default function App() {
  return (
    <BrowserRouter>
      <StoreUIProvider>
        <Suspense fallback={<Preloader />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="products" element={<ShopPage />} />
              <Route path="category/:slug" element={<ShopPage />} />
              <Route path="search" element={<ShopPage />} />
              <Route path="product/:slug" element={<PlaceholderPage />} />
              {['cart', 'wishlist', 'account', 'about', 'contact', 'faq', 'track-order', 'privacy-policy', 'terms'].map(path => (
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
