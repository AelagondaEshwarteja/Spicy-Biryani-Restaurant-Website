import { Bike, Check, ChefHat, ClipboardCheck, PackageCheck, XCircle } from 'lucide-react';
import type { Order } from '../../types';
import { formatTime, STATUS_FLOW, STATUS_LABELS } from '../../utils/format';

const ICONS = {
  pending: ClipboardCheck,
  confirmed: Check,
  preparing: ChefHat,
  out_for_delivery: Bike,
  delivered: PackageCheck,
};

// The vertical progress line: Order placed -> Confirmed -> Cooking -> On the way -> Delivered
export default function OrderStatusSteps({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-5 text-red-800">
        <XCircle className="h-6 w-6 flex-shrink-0" />
        <div>
          <p className="font-semibold">This order was cancelled</p>
          <p className="text-sm">If you paid already or think this is a mistake, please call us.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);

  // When did each step happen? (taken from the status history saved by the backend)
  const timeFor = (status: string) => order.statusHistory.find((h) => h.status === status)?.changedAt;

  return (
    <ol className="relative">
      {STATUS_FLOW.map((status, index) => {
        const Icon = ICONS[status as keyof typeof ICONS];
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const time = timeFor(status);

        return (
          <li key={status} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Line connecting the circles */}
            {index < STATUS_FLOW.length - 1 && (
              <span
                className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 ${
                  index < currentIndex ? 'bg-green-600' : 'bg-ink/10'
                }`}
              />
            )}
            <span
              className={`relative grid h-10 w-10 flex-shrink-0 place-items-center rounded-full ${
                done ? 'bg-green-600 text-white' : 'bg-ink/5 text-ink/30'
              } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="pt-2">
              <p className={`font-semibold ${done ? 'text-ink' : 'text-ink/40'}`}>{STATUS_LABELS[status]}</p>
              {done && time && <p className="text-xs text-ink-soft">{formatTime(time)}</p>}
              {isCurrent && status !== 'delivered' && (
                <p className="mt-0.5 text-xs font-medium text-green-700">In progress...</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
