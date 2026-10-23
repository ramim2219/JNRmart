import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Newsletter from '../components/common/Newsletter';
import ScrollToTop from '../components/layout/ScrollToTop';
import FloatingActions from '../components/layout/FloatingActions';
import MobileStoreUI from '../components/layout/MobileStoreUI';

export default function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="content">
        <Outlet />
      </main>
      <Newsletter />
      <Footer />
      <FloatingActions />
      <MobileStoreUI />
    </>
  );
}
