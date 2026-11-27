import { Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '../../data/siteInfo';

export default function Testimonials() {
  return (
    <section id="reviews" className="bg-ink py-24 text-white">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow text-saffron-400">
            <span className="h-px w-8 bg-saffron-400" /> Reviews
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">What our guests say</h2>
          <p className="mt-4 text-lg text-white/70">Rated 4.8 out of 5 by thousands of biryani lovers across Warangal.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((review) => (
            <figure key={review.name} className="flex flex-col rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
              <Quote className="h-8 w-8 text-saffron-400" />
              <div className="mt-4 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${n <= review.rating ? 'fill-saffron-400 text-saffron-400' : 'text-white/20'}`}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-white/85">&ldquo;{review.text}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-saffron-500 font-bold text-ink">
                  {review.name.charAt(0)}
                </span>
                <span>
                  <span className="block font-semibold">{review.name}</span>
                  <span className="block text-sm text-white/60">
                    {review.area} · ordered {review.dish}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
