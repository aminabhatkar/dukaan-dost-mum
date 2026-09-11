import type { CSSProperties } from "react";
import { IconBookTile, IconBoxTile, IconScooter, IconTag } from "../components/icons";

export function HomeScreen({
  todayCount,
  pendingCount,
  newCount,
  hasNew,
  newCountLabel,
  trackingSub,
  khataSub,
  ratesSub,
  onLogout,
  onGoOrders,
  onGoTracking,
  onGoKhata,
  onGoRates,
}: {
  todayCount: number;
  pendingCount: number;
  newCount: number;
  hasNew: boolean;
  newCountLabel: string;
  trackingSub: string;
  khataSub: string;
  ratesSub: string;
  onLogout: () => void;
  onGoOrders: () => void;
  onGoTracking: () => void;
  onGoKhata: () => void;
  onGoRates: () => void;
}) {
  const tileStyle: CSSProperties = {
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "var(--color-card)",
    border: "2px solid var(--color-warm-border)",
    borderRadius: 16,
    padding: "22px 18px",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(72,55,32,.14)",
    color: "var(--color-ink)",
  };
  const iconWrap = (bg: string): CSSProperties => ({
    flex: "none",
    width: 60,
    height: 60,
    borderRadius: 14,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div className="pb-28">
      <div className="bg-primary px-[22px] pb-6 pt-5.5 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-extrabold tracking-tight">DukaanDost</div>
          <button
            onClick={onLogout}
            className="cursor-pointer rounded-[10px] border-2 border-primary-foreground/60 bg-transparent px-3.5 py-2 text-[15px] font-bold text-primary-foreground"
          >
            Logout
          </button>
        </div>
        <div className="mt-4 text-[19px] font-semibold opacity-95">Aaj ka hisaab</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[14px] bg-card p-4 pb-3.5 text-ink">
            <div className="text-[52px] font-extrabold leading-none tracking-tighter">{todayCount}</div>
            <div className="mt-1.5 text-[17px] font-bold text-ink-muted">Aaj ke Order</div>
          </div>
          <div className="rounded-[14px] bg-accent p-4 pb-3.5 text-accent-foreground">
            <div className="text-[52px] font-extrabold leading-none tracking-tighter">{pendingCount}</div>
            <div className="mt-1.5 text-[17px] font-bold">Delivery Baaki</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <button onClick={onGoOrders} style={tileStyle}>
          <span style={iconWrap("var(--color-primary)")}>
            <IconBoxTile size={32} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[25px] font-extrabold tracking-tight">Naye Orders</span>
            <span className="mt-[3px] block text-[17px] font-semibold text-ink-subtle">{newCountLabel}</span>
          </span>
          {hasNew && (
            <span className="flex h-[38px] min-w-[38px] flex-none items-center justify-center rounded-full bg-destructive px-2.5 text-[20px] font-extrabold text-destructive-foreground">
              {newCount}
            </span>
          )}
        </button>

        <button onClick={onGoTracking} style={tileStyle}>
          <span style={iconWrap("var(--color-success)")}>
            <IconScooter size={34} color="#FFFFFF" strokeWidth={2.1} dotR={2.6} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[25px] font-extrabold tracking-tight">Order Tracking</span>
            <span className="mt-[3px] block text-[17px] font-semibold text-ink-subtle">{trackingSub}</span>
          </span>
        </button>

        <button onClick={onGoKhata} style={tileStyle}>
          <span style={iconWrap("var(--color-destructive)")}>
            <IconBookTile size={32} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[25px] font-extrabold tracking-tight">Grahak Khata</span>
            <span className="mt-[3px] block text-[17px] font-semibold text-ink-subtle">{khataSub}</span>
          </span>
        </button>

        <button onClick={onGoRates} style={tileStyle}>
          <span style={iconWrap("var(--color-warning)")}>
            <IconTag size={32} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[25px] font-extrabold tracking-tight">Rate List</span>
            <span className="mt-[3px] block text-[17px] font-semibold text-ink-subtle">{ratesSub}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
