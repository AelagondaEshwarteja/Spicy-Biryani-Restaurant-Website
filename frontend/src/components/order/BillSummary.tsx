import { formatPrice } from '../../utils/format';

interface BillSummaryProps {
  subtotal: number;
  deliveryFee: number;
  gst: number;
  total: number;
}

// Item total + delivery + GST = To pay
export default function BillSummary({ subtotal, deliveryFee, gst, total }: BillSummaryProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between text-ink-soft">
        <dt>Item total</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-ink-soft">
        <dt>Delivery fee</dt>
        <dd>{deliveryFee === 0 ? <span className="font-medium text-green-700">FREE</span> : formatPrice(deliveryFee)}</dd>
      </div>
      <div className="flex justify-between text-ink-soft">
        <dt>GST (5%)</dt>
        <dd>{formatPrice(gst)}</dd>
      </div>
      <div className="flex justify-between border-t border-dashed border-ink/15 pt-3 text-base font-bold text-ink">
        <dt>To pay</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
