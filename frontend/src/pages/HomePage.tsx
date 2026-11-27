import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import MenuSection from '../components/home/MenuSection';
import About from '../components/home/About';
import Testimonials from '../components/home/Testimonials';
import Contact from '../components/home/Contact';
import CartDrawer from '../components/order/CartDrawer';
import CheckoutModal from '../components/order/CheckoutModal';
import OrderTrackingModal from '../components/order/OrderTrackingModal';

// Only one popup is open at a time, so we keep its name in a single state value
type Popup = 'none' | 'cart' | 'checkout' | 'tracking';

export default function HomePage() {
  const [popup, setPopup] = useState<Popup>('none');
  const [trackingDetails, setTrackingDetails] = useState<{ orderNumber: string; phone: string } | null>(null);

  const closePopup = () => setPopup('none');

  const openTracking = () => {
    setTrackingDetails(null);
    setPopup('tracking');
  };

  // Called from the "Order placed" screen
  const trackNewOrder = (orderNumber: string, phone: string) => {
    setTrackingDetails({ orderNumber, phone });
    setPopup('tracking');
  };

  return (
    <>
      <Navbar onCartClick={() => setPopup('cart')} onTrackClick={openTracking} />

      <main>
        <Hero onTrackClick={openTracking} />
        <MenuSection />
        <About />
        <Testimonials />
        <Contact />
      </main>

      <Footer />

      {popup === 'cart' && <CartDrawer onClose={closePopup} onCheckout={() => setPopup('checkout')} />}

      {popup === 'checkout' && <CheckoutModal onClose={closePopup} onTrackOrder={trackNewOrder} />}

      {popup === 'tracking' && (
        <OrderTrackingModal
          onClose={closePopup}
          initialOrderNumber={trackingDetails?.orderNumber}
          initialPhone={trackingDetails?.phone}
        />
      )}
    </>
  );
}
