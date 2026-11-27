import { Info, Plus, Star } from 'lucide-react';
import type { MenuItem } from '../../types';
import { useCart } from '../../hooks/useCart';
import { formatCount, formatPrice } from '../../utils/format';
import VegBadge from '../common/VegBadge';
import SpiceLevel from '../common/SpiceLevel';
import QuantityStepper from '../common/QuantityStepper';

interface MenuCardProps {
  item: MenuItem;
  onShowDetails: (item: MenuItem) => void;
}

export default function MenuCard({ item, onShowDetails }: MenuCardProps) {
  const { addItem, increase, decrease, getQuantity } = useCart();
  const quantity = getQuantity(item._id);

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-saffron-50">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          width={500}
          height={375}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            item.isAvailable ? '' : 'grayscale'
          }`}
        />

        {item.isBestseller && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-saffron-500 px-3 py-1 text-xs font-bold text-ink shadow">
            <Star className="h-3 w-3 fill-current" /> Bestseller
          </span>
        )}

        <button
          onClick={() => onShowDetails(item)}
          aria-label={`Nutrition details for ${item.name}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
        >
          <Info className="h-4 w-4" />
        </button>

        {!item.isAvailable && (
          <div className="absolute inset-0 grid place-items-center bg-ink/50">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink">Sold out today</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <VegBadge isVeg={item.isVeg} />
          <span>{item.servingSize}</span>
          <span className="ml-auto">
            <SpiceLevel level={item.spiceLevel} />
          </span>
        </div>

        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink">{item.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-md bg-green-700 px-1.5 py-0.5 text-xs font-bold text-white">
            {item.rating.toFixed(1)} <Star className="h-3 w-3 fill-current" />
          </span>
          <span className="text-ink-soft">{formatCount(item.ratingCount)} ratings</span>
          <span className="ml-auto text-xs text-ink-soft">{item.nutrition.calories} kcal</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-xl font-bold text-ink">{formatPrice(item.price)}</span>

          {quantity === 0 ? (
            <button
              onClick={() => addItem(item)}
              disabled={!item.isAvailable}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          ) : (
            <QuantityStepper
              quantity={quantity}
              onIncrease={() => increase(item._id)}
              onDecrease={() => decrease(item._id)}
            />
          )}
        </div>
      </div>
    </article>
  );
}
