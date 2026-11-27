import { ArrowRight, Bike, ChefHat, Clock, Package, ShieldCheck } from 'lucide-react';
import { IMAGES, RESTAURANT } from '../../data/siteInfo';
import { FREE_DELIVERY_ABOVE } from '../../utils/format';

const HIGHLIGHTS = [
  { icon: ChefHat, title: 'Cooked fresh', text: 'Every handi is made after you order' },
  { icon: Clock, title: '35 min delivery', text: 'Across Warangal & Hanamkonda' },
  { icon: Bike, title: 'Free delivery', text: `On orders above ₹${FREE_DELIVERY_ABOVE}` },
  { icon: ShieldCheck, title: 'Clean kitchen', text: 'FSSAI hygiene standards followed' },
];

export default function Hero({ onTrackClick }: { onTrackClick: () => void }) {
  return (
    <>
      <section id="home" className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink">
        <img
          src={IMAGES.hero}
          alt="Hyderabadi biryani served in a copper handi"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        {/* Dark gradient so the white text is easy to read */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        <div className="container-x relative pb-28 pt-32">
          <div className="max-w-2xl">
            <span className="eyebrow text-saffron-400">
              <span className="h-px w-8 bg-saffron-400" />
              Authentic Hyderabadi Dum Biryani
            </span>

            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Slow-cooked on dum.
              <span className="block text-saffron-400">Served with love.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Long-grain basmati, hand-ground spices and meat marinated overnight - sealed in a handi and
              cooked slowly over low flame, exactly the way it is done in Hyderabad.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#menu" className="btn-gold px-7 py-3.5 text-base">
                Order now <ArrowRight className="h-5 w-5" />
              </a>
              <button
                onClick={onTrackClick}
                className="btn border border-white/30 px-7 py-3.5 text-base text-white hover:bg-white/10"
              >
                <Package className="h-5 w-5" /> Track your order
              </button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {RESTAURANT.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl font-bold text-white">{stat.value}</dd>
                  <dd className="mt-1 text-sm text-white/60">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Highlights strip that overlaps the bottom of the hero */}
      <div className="container-x relative z-10 -mt-14">
        <div className="card grid grid-cols-2 divide-ink/10 lg:grid-cols-4 lg:divide-x">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 p-5 sm:p-6">
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
