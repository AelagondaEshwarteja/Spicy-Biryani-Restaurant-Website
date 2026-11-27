import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'sm' | 'md';
}

// The "- 2 +" control used on menu cards and in the cart
export default function QuantityStepper({ quantity, onIncrease, onDecrease, size = 'md' }: QuantityStepperProps) {
  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';

  return (
    <div className="inline-flex items-center rounded-full bg-chili-600 p-1 text-white shadow-md">
      <button
        onClick={onDecrease}
        aria-label="Remove one"
        className={`grid place-items-center rounded-full transition hover:bg-white/20 ${buttonSize}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2rem] text-center font-semibold" aria-live="polite">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        aria-label="Add one more"
        disabled={quantity >= 20}
        className={`grid place-items-center rounded-full transition hover:bg-white/20 disabled:opacity-50 ${buttonSize}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
