import { Flame, Leaf, ShieldCheck, Soup } from 'lucide-react';
import { IMAGES } from '../../data/siteInfo';

const STEPS = [
  {
    icon: Leaf,
    title: 'Marinated overnight',
    text: 'Meat rests for 12 hours in curd, ginger-garlic and our own garam masala.',
  },
  {
    icon: Soup,
    title: 'Layered by hand',
    text: 'Aged basmati, saffron milk, fried onions and fresh mint go in layer by layer.',
  },
  {
    icon: Flame,
    title: 'Sealed & cooked on dum',
    text: 'The handi is sealed with dough and cooked on low flame so nothing escapes.',
  },
  {
    icon: ShieldCheck,
    title: 'Packed hot & safe',
    text: 'Sealed, tamper-proof boxes so it reaches you hot and exactly as it left us.',
  },
];

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <div className="relative">
          <img
            src={IMAGES.spices}
            alt="Whole Indian spices used in our biryani masala"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-3xl object-cover shadow-card sm:aspect-[4/3] lg:aspect-[4/5]"
          />
          <figure className="card absolute -bottom-8 right-4 w-52 overflow-hidden p-2 sm:right-8 sm:w-60">
            <img
              src={IMAGES.dumPot}
              alt="Biryani handi sealed with dough for dum cooking"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <figcaption className="px-2 py-2 text-xs text-ink-soft">
              The handi is sealed with dough - that&apos;s what &ldquo;dum&rdquo; means.
            </figcaption>
          </figure>
        </div>

        <div>
          <span className="eyebrow">
            <span className="h-px w-8 bg-saffron-500" /> Our story
          </span>
          <h2 className="section-title mt-4">
            A Hyderabadi recipe,
            <span className="block text-chili-600">made in Warangal.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Spicy Biryani started with one simple idea: biryani should taste the same on a Tuesday afternoon as it
            does at a wedding. So we cook it the slow way - no shortcuts, no colours, no ready-made masala.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Our spice mix is roasted and ground in the kitchen every week, and each biryani is cooked in small
            handis through the day so it is always fresh.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex gap-4">
                <span className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-saffron-50 text-saffron-600">
                  <Icon className="h-5 w-5" />
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
