import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import CartProvider from './context/CartProvider';
import HomePage from './pages/HomePage';

// The admin page is loaded only when someone opens /admin.
// Customers never download the admin code, so the main site loads faster.
const AdminPage = lazy(() => import('./pages/AdminPage'));

function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center text-ink-soft">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}
