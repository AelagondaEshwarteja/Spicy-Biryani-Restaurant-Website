import { Link } from 'react-router-dom';
import { Facebook, Flame, Instagram, Twitter } from 'lucide-react';
import { RESTAURANT } from '../../data/siteInfo';

export default function Footer() {
  const socials = [
    { icon: Instagram, href: RESTAURANT.social.instagram, label: 'Instagram' },
    { icon: Facebook, href: RESTAURANT.social.facebook, label: 'Facebook' },
    { icon: Twitter, href: RESTAURANT.social.x, label: 'X (Twitter)' },
  ];

  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-saffron-500 text-ink">
              <Flame className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-white">{RESTAURANT.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Authentic Hyderabadi dum biryani, kebabs and desserts - cooked fresh in Warangal and delivered hot to
            your door.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 transition hover:bg-saffron-500 hover:text-ink"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a href="#menu" className="hover:text-saffron-400">Menu</a></li>
            <li><a href="#about" className="hover:text-saffron-400">Our story</a></li>
            <li><a href="#reviews" className="hover:text-saffron-400">Reviews</a></li>
            <li><a href="#contact" className="hover:text-saffron-400">Bulk & party orders</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Opening hours</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {RESTAURANT.hours.map((h) => (
              <li key={h.days}>
                <span className="block text-white/90">{h.days}</span>
                {h.time}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Get in touch</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>{RESTAURANT.address}</li>
            <li><a href={RESTAURANT.phoneLink} className="hover:text-saffron-400">{RESTAURANT.phone}</a></li>
            <li><a href={`mailto:${RESTAURANT.email}`} className="hover:text-saffron-400">{RESTAURANT.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {RESTAURANT.name}. All rights reserved.</p>
          <p>
            Food photos from{' '}
            <a
              href="https://commons.wikimedia.org"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-saffron-400"
            >
              Wikimedia Commons
            </a>{' '}
            contributors ·{' '}
            <Link to="/admin" className="underline hover:text-saffron-400">
              Staff login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
