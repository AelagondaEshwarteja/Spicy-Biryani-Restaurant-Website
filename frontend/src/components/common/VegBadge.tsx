// The green/red square symbol used on food packets in India
export default function VegBadge({ isVeg }: { isVeg: boolean }) {
  const colour = isVeg ? 'border-green-600 text-green-600' : 'border-chili-600 text-chili-600';

  return (
    <span
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px] border-2 bg-white ${colour}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}
