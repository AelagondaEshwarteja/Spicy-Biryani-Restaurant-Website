import { Flame } from 'lucide-react';

const LABELS = ['Not spicy', 'Mild', 'Medium', 'Hot'];

// Shows 1-3 small flames. Nothing is shown for non-spicy dishes.
export default function SpiceLevel({ level }: { level: number }) {
  if (level <= 0) return null;

  return (
    <span className="inline-flex items-center gap-0.5" title={`${LABELS[level]} spice`}>
      {[1, 2, 3].map((n) => (
        <Flame
          key={n}
          className={`h-3.5 w-3.5 ${n <= level ? 'fill-chili-500 text-chili-500' : 'text-ink/15'}`}
        />
      ))}
    </span>
  );
}
