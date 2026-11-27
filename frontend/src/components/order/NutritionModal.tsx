import type { MenuItem, Nutrition } from '../../types';
import { formatPrice } from '../../utils/format';
import Modal from '../common/Modal';
import VegBadge from '../common/VegBadge';

// Rough daily values for an adult - used to draw the bars
const DAILY_VALUES: Record<keyof Omit<Nutrition, 'calories'>, number> = {
  protein: 50,
  carbs: 275,
  fat: 70,
  fiber: 30,
};

const BAR_COLOURS = {
  protein: 'bg-sky-500',
  carbs: 'bg-saffron-500',
  fat: 'bg-chili-500',
  fiber: 'bg-green-600',
};

export default function NutritionModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const tags = [
    { show: item.isVeg, label: 'Vegetarian' },
    { show: item.isVegan, label: 'Vegan' },
    { show: item.isGlutenFree, label: 'Gluten free' },
  ].filter((tag) => tag.show);

  return (
    <Modal title={item.name} subtitle={`${item.servingSize} · ${formatPrice(item.price)}`} onClose={onClose} size="md">
      <img src={item.image} alt={item.name} className="aspect-[16/9] w-full rounded-2xl object-cover" />
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{item.description}</p>

      <div className="mt-5 flex items-end justify-between rounded-2xl bg-saffron-50 p-4">
        <div>
          <p className="text-sm text-ink-soft">Energy per serving</p>
          <p className="font-display text-3xl font-bold text-ink">
            {item.nutrition.calories} <span className="text-base font-medium text-ink-soft">kcal</span>
          </p>
        </div>
        <p className="text-sm text-ink-soft">{Math.round((item.nutrition.calories / 2000) * 100)}% of a 2,000 kcal day</p>
      </div>

      <div className="mt-5 space-y-3">
        {(Object.keys(DAILY_VALUES) as (keyof typeof DAILY_VALUES)[]).map((key) => {
          const value = item.nutrition[key];
          const percent = Math.min(100, Math.round((value / DAILY_VALUES[key]) * 100));
          return (
            <div key={key}>
              <div className="flex justify-between text-sm">
                <span className="capitalize text-ink">{key}</span>
                <span className="font-semibold">{value} g</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/10">
                <div className={`h-full rounded-full ${BAR_COLOURS[key]}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <VegBadge isVeg={item.isVeg} />
        {tags.length === 0 && <span className="text-sm text-ink-soft">Non-vegetarian</span>}
        {tags.map((tag) => (
          <span key={tag.label} className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
            {tag.label}
          </span>
        ))}
      </div>

      <p className="mt-5 text-xs text-ink-soft">
        Values are approximate and can change slightly with portion size.
      </p>
    </Modal>
  );
}
