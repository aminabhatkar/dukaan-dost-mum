import { TopBar } from "../components/TopBar";
import { IconClock, IconCheck } from "../components/icons";

export interface TrackingOrderView {
  id: string;
  cust: string;
  summary: string;
  totalText: string;
  onToggle: () => void;
}

export function TrackingScreen({
  pendingCount,
  pendingOrders,
  deliveredCount,
  deliveredOrders,
  onGoHome,
}: {
  pendingCount: number;
  pendingOrders: TrackingOrderView[];
  deliveredCount: number;
  deliveredOrders: TrackingOrderView[];
  onGoHome: () => void;
}) {
  return (
    <div className="pb-28">
      <TopBar backLabel="Ghar" onBack={onGoHome} title="Order Tracking" />

      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <span className="h-4 w-4 rounded-full border-2 border-warm-border bg-accent" />
        <span className="text-[22px] font-extrabold">Delivery Baaki ({pendingCount})</span>
      </div>
      <div className="flex flex-col gap-3.5 px-4">
        {pendingOrders.map((o) => (
          <div
            key={o.id}
            className="rounded-2xl border-2 border-warm-border bg-card p-4"
            style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[23px] font-extrabold tracking-tight">{o.cust}</div>
                <div className="mt-1 text-base font-semibold text-ink-subtle">{o.summary}</div>
              </div>
              <div className="whitespace-nowrap text-[25px] font-extrabold">{o.totalText}</div>
            </div>
            <div className="mt-3.5 flex items-center gap-3.5 border-t-2 border-dashed border-warm-border-light pt-3.5">
              <div className="min-w-0 flex-1 text-[19px] font-extrabold leading-tight">
                Order Deliver
                <br />
                Ho Gaya?
              </div>
              <button
                onClick={o.onToggle}
                className="flex flex-none cursor-pointer items-center gap-2.5 rounded-full border-2 border-warm-border bg-accent py-1.5 pl-2 pr-4 text-accent-foreground"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-warm-border bg-card">
                  <IconClock size={24} color="var(--color-accent-foreground)" />
                </span>
                <span className="text-[19px] font-extrabold">Nahi</span>
              </button>
            </div>
          </div>
        ))}
        {pendingOrders.length === 0 && (
          <div className="rounded-[14px] bg-secondary p-6 text-center text-xl font-bold text-ink-muted">
            Sab delivery ho gayi. Shabaash!
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 px-4 pt-6 pb-2">
        <span className="h-4 w-4 rounded-full border-2 border-warm-border bg-success" />
        <span className="text-[22px] font-extrabold">Deliver Ho Gaye ({deliveredCount})</span>
      </div>
      <div className="flex flex-col gap-3 px-4">
        {deliveredOrders.map((o) => (
          <div key={o.id} className="rounded-2xl border-[3px] border-success bg-success/10 p-4 px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[21px] font-extrabold text-success">{o.cust}</div>
                <div className="mt-1 text-base font-semibold text-success/80">{o.summary}</div>
              </div>
              <div className="whitespace-nowrap text-[23px] font-extrabold text-success">{o.totalText}</div>
            </div>
            <div className="mt-3 flex items-center gap-3.5 border-t-2 border-dashed border-success/30 pt-3">
              <div className="min-w-0 flex-1 text-[19px] font-extrabold text-success">Deliver Ho Gaya</div>
              <button
                onClick={o.onToggle}
                className="flex flex-none cursor-pointer items-center gap-2.5 rounded-full border-2 border-success/60 bg-success py-1.5 pl-4 pr-2 text-success-foreground"
              >
                <span className="text-[19px] font-extrabold">Haan</span>
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-success/60 bg-card">
                  <IconCheck size={26} color="var(--color-success)" strokeWidth={3.4} />
                </span>
              </button>
            </div>
          </div>
        ))}
        {deliveredOrders.length === 0 && (
          <div className="rounded-[14px] bg-secondary p-5 text-center text-[19px] font-bold text-ink-muted">
            Abhi tak koi delivery mark nahi hui.
          </div>
        )}
      </div>
    </div>
  );
}
