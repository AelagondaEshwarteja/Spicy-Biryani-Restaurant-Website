import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw, Search, UtensilsCrossed } from 'lucide-react';
import type { Category, MenuItem } from '../../types';
import { menuApi } from '../../services/api';
import { CATEGORIES } from '../../data/siteInfo';
import MenuCard from './MenuCard';
import NutritionModal from '../order/NutritionModal';

export default function MenuSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const loadMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await menuApi.getAll();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Filtering happens in the browser - the whole menu is small, so this is instant
  const visibleItems = useMemo(() => {
    const text = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (vegOnly && !item.isVeg) return false;
      if (text && !`${item.name} ${item.description}`.toLowerCase().includes(text)) return false;
      return true;
    });
  }, [items, category, search, vegOnly]);

  const countFor = (id: Category | 'all') =>
    id === 'all' ? items.length : items.filter((item) => item.category === id).length;

  return (
    <section id="menu" className="py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <UtensilsCrossed className="h-4 w-4" /> Our menu
          </span>
          <h2 className="section-title mt-4">From the handi to your home</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Biryanis, kebabs and Hyderabadi classics - cooked in small batches through the day so nothing sits
            around.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === cat.id
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30'
                }`}
              >
                {cat.label}
                {!loading && <span className="ml-1.5 opacity-60">{countFor(cat.id)}</span>}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                aria-label="Search dishes"
                className="input rounded-full py-2.5 pl-10"
              />
            </label>

            <button
              onClick={() => setVegOnly(!vegOnly)}
              aria-pressed={vegOnly}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ring-1 transition ${
                vegOnly ? 'bg-green-50 text-green-800 ring-green-600' : 'bg-white text-ink ring-ink/10'
              }`}
            >
              <span
                className={`relative h-5 w-9 rounded-full transition ${vegOnly ? 'bg-green-600' : 'bg-ink/20'}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    vegOnly ? 'left-[1.125rem]' : 'left-0.5'
                  }`}
                />
              </span>
              Veg only
            </button>
          </div>
        </div>

        {/* Loading: grey placeholder cards */}
        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse overflow-hidden">
                <div className="aspect-[4/3] bg-ink/10" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-ink/10" />
                  <div className="h-4 w-full rounded bg-ink/10" />
                  <div className="h-4 w-1/2 rounded bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error: show a retry button */}
        {!loading && error && (
          <div className="card mx-auto mt-10 max-w-md p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-chili-500" />
            <p className="mt-4 font-semibold text-ink">We couldn&apos;t load the menu</p>
            <p className="mt-1 text-sm text-ink-soft">{error}</p>
            <button onClick={loadMenu} className="btn-primary mt-6">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        )}

        {!loading && !error && visibleItems.length === 0 && (
          <p className="mt-16 text-center text-ink-soft">No dishes match your search. Try another word.</p>
        )}

        {!loading && !error && visibleItems.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <MenuCard key={item._id} item={item} onShowDetails={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

      {selectedItem && <NutritionModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  );
}
