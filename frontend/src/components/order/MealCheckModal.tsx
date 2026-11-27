import { useEffect, useState } from 'react';
import { CheckCircle2, Info, Lightbulb, Loader2 } from 'lucide-react';
import type { CartItem, MealAnalysis } from '../../types';
import { nutritionApi } from '../../services/api';
import Modal from '../common/Modal';

const TIP_STYLES = {
  good: { icon: CheckCircle2, style: 'bg-green-50 text-green-900' },
  tip: { icon: Lightbulb, style: 'bg-saffron-50 text-saffron-700' },
  info: { icon: Info, style: 'bg-sky-50 text-sky-900' },
};

// Sends the cart to the backend, which adds up the nutrition and returns simple tips
export default function MealCheckModal({ items, onClose }: { items: CartItem[]; onClose: () => void }) {
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    nutritionApi
      .analyze(items)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [items]);

  return (
    <Modal title="Check my meal" subtitle="Nutrition for everything in your cart" onClose={onClose} size="md">
      {!result && !error && (
        <div className="flex items-center justify-center gap-3 py-12 text-ink-soft">
          <Loader2 className="h-5 w-5 animate-spin" /> Adding up your meal...
        </div>
      )}

      {error && <p className="rounded-xl bg-chili-50 p-4 text-sm text-chili-700">{error}</p>}

      {result && (
        <>
          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="text-sm text-white/70">Total energy</p>
            <p className="font-display text-4xl font-bold">
              {result.totals.calories.toLocaleString('en-IN')} <span className="text-lg font-medium">kcal</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-saffron-400"
                style={{ width: `${Math.min(100, result.dailyCaloriePercent)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/70">{result.dailyCaloriePercent}% of an average 2,000 kcal day</p>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {(['protein', 'carbs', 'fat', 'fiber'] as const).map((key) => (
              <div key={key} className="rounded-xl bg-cream p-3">
                <p className="text-lg font-bold">{result.totals[key]}g</p>
                <p className="text-xs capitalize text-ink-soft">{key}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-semibold">Quick tips</h3>
          <ul className="mt-3 space-y-2">
            {result.tips.map((tip) => {
              const { icon: Icon, style } = TIP_STYLES[tip.type];
              return (
                <li key={tip.text} className={`flex gap-3 rounded-xl p-3 text-sm ${style}`}>
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {tip.text}
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-xs text-ink-soft">
            General guidance only, not medical advice. Values are approximate.
          </p>
        </>
      )}
    </Modal>
  );
}
