import { useEffect, useState } from 'react';
import { Flame, Menu as MenuIcon, Package, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { RESTAURANT } from '../../data/siteInfo';

interface NavbarProps {
  onCartClick: () => void;
  onTrackClick: () => void;
}

const LINKS = [
  { href: '#menu', label: 'Menu' },
  { href: '#about', label: 'Our Story' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({ onCartClick, onTrackClick }: NavbarProps) {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The navbar is see-through on top of the dark hero, and turns solid when you scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solid = scrolled || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-cream/95 shadow-sm backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="container-x flex h-[4.5rem] items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron-500 text-ink">
            <Flame className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className={`block font-display text-xl font-bold ${solid ? 'text-ink' : 'text-white'}`}>
              {RESTAURANT.name}
            </span>
            <span className={`block text-[11px] uppercase tracking-[0.2em] ${solid ? 'text-ink-soft' : 'text-white/70'}`}>
              {RESTAURANT.tagline}
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-saffron-500 ${
                solid ? 'text-ink' : 'text-white/90'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTrackClick}
            className={`hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition sm:inline-flex ${
              solid ? 'text-ink hover:bg-ink/5' : 'text-white hover:bg-white/10'
            }`}
          >
            <Package className="h-4 w-4" />
            Track order
          </button>

          <button onClick={onCartClick} className="btn-gold relative px-4 py-2.5 text-sm sm:px-5">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-chili-600 px-1 text-xs font-bold text-white ring-2 ring-cream">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
            className={`grid h-10 w-10 place-items-center rounded-full md:hidden ${solid ? 'text-ink' : 'text-white'}`}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-ink/10 bg-cream md:hidden">
          <div className="container-x flex flex-col py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-3 font-medium text-ink hover:bg-ink/5"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onTrackClick();
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-3 text-left font-medium text-ink hover:bg-ink/5"
            >
              <Package className="h-4 w-4" /> Track your order
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
