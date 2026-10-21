import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Preloader from './components/common/Preloader';
import { StoreUIProvider } from './context/StoreUIContext';
const HomePage = lazy(() => import('./pages/HomePage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
export default function App() {
  return <BrowserRouter><StoreUIProvider><Suspense fallback={<Preloader/>}><Routes><Route element={<MainLayout/>}><Route index element={<HomePage/>}/><Route path="category/:slug" element={<PlaceholderPage/>}/>{['cart','wishlist','account','about','contact','search','faq','track-order','privacy-policy','terms'].map(path=><Route key={path} path={path} element={<PlaceholderPage/>}/>)}<Route path="*" element={<PlaceholderPage/>}/></Route></Routes></Suspense></StoreUIProvider></BrowserRouter>;
}
