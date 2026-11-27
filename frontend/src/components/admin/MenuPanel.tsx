import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import type { MenuItem } from '../../types';
import { menuApi } from '../../services/api';
import { formatPrice } from '../../utils/format';
import VegBadge from '../common/VegBadge';

// Lets the admin change prices and mark dishes as sold out
export default function MenuPanel({ onError }: { onError: (err: unknown) => string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({}); // what is typed in each price box
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    menuApi
      .getAllFresh()
      .then((data) => setItems(data.items))
      .catch((err) => setError(onError(err)))
      .finally(() => setLoading(false));
  }, [onError]);

  const saveChanges = async (item: MenuItem, changes: Partial<MenuItem>) => {
    setSavingId(item._id);
    setError('');
    try {
      const data = await menuApi.update(item._id, changes);
      setItems((prev) => prev.map((i) => (i._id === item._id ? data.item : i)));
      setPrices((prev) => {
        const copy = { ...prev };
        delete copy[item._id];
        return copy;
      });
    } catch (err) {
      setError(onError(err));
    } finally {
      setSavingId(null);
    }
  };

  const savePrice = (item: MenuItem) => {
    const newPrice = Number(prices[item._id]);
    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      setError('Price must be a number above 0');
      return;
    }
    saveChanges(item, { price: newPrice });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-ink-soft">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading menu...
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-4 rounded-xl bg-chili-50 p-3 text-sm text-chili-700">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-cream text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Dish</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price (₹)</th>
              <th className="px-4 py-3 font-medium">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {items.map((item) => {
              const typedPrice = prices[item._id];
              const priceChanged = typedPrice !== undefined && Number(typedPrice) !== item.price;

              return (
                <tr key={item._id} className={item.isAvailable ? '' : 'bg-ink/[0.02] text-ink-soft'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-11 w-11 rounded-lg object-cover" loading="lazy" />
                      <div>
                        <p className="flex items-center gap-1.5 font-medium text-ink">
                          <VegBadge isVeg={item.isVeg} /> {item.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-ink-soft">
                          <Star className="h-3 w-3 fill-saffron-500 text-saffron-500" /> {item.rating} ·{' '}
                          {item.isBestseller ? 'Bestseller' : item.servingSize}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={typedPrice ?? item.price}
                        onChange={(e) => setPrices({ ...prices, [item._id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && priceChanged && savePrice(item)}
                        aria-label={`Price of ${item.name}`}
                        className="input w-24 px-3 py-1.5"
                      />
                      {priceChanged && (
                        <button
                          onClick={() => savePrice(item)}
                          disabled={savingId === item._id}
                          className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      )}
                    </div>
                    {priceChanged && (
                      <p className="mt-1 text-xs text-ink-soft">was {formatPrice(item.price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      role="switch"
                      aria-checked={item.isAvailable}
                      aria-label={`${item.name} available`}
                      onClick={() => saveChanges(item, { isAvailable: !item.isAvailable })}
                      disabled={savingId === item._id}
                      className={`relative h-6 w-11 rounded-full transition ${
                        item.isAvailable ? 'bg-green-600' : 'bg-ink/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          item.isAvailable ? 'left-[1.375rem]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
