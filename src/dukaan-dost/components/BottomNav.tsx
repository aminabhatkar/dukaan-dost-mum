import type { CSSProperties } from "react";
import type { Screen } from "../types";


function navStyle(active: boolean) {
  return active
    ? { bg: "var(--color-secondary)", ink: "var(--color-primary)" }
    : { bg: "transparent", ink: "var(--color-ink-subtle)" };
}

export function BottomNav({ screen, onGo }: { screen: Screen; onGo: (s: Screen) => void }) {
  const home = navStyle(screen === "home");
  const orders = navStyle(screen === "orders");
  const tracking = navStyle(screen === "tracking");
  const khata = navStyle(screen === "khata" || screen === "customer");
  const rates = navStyle(screen === "rates");

  const btnStyle = (bg: string, ink: string): CSSProperties => ({
    flex: 1,
    minWidth: 0,
    minHeight: 66,
    background: bg,
    color: ink,
    border: "none",
    borderRadius: 13,
    padding: "8px 2px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    cursor: "pointer",
  });

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div
        className="flex w-full max-w-[480px] gap-[3px] border-t-2 border-warm-border bg-card pb-[11px] pt-2 px-[7px]"
        style={{ boxShadow: "0 -4px 18px rgba(72,55,32,.12)" }}
      >
        <button onClick={() => onGo("home")} style={btnStyle(home.bg, home.ink)}>
          <span style={{fontSize:26}}>🏠</span>
          <span className="text-[13px] font-extrabold">Ghar</span>
        </button>
        <button onClick={() => onGo("orders")} style={btnStyle(orders.bg, orders.ink)}>
          <span style={{fontSize:26}}>📦</span>
          <span className="text-[13px] font-extrabold">Orders</span>
        </button>
        <button onClick={() => onGo("tracking")} style={btnStyle(tracking.bg, tracking.ink)}>
          <span style={{fontSize:26}}>🛵</span>
          <span className="text-[13px] font-extrabold">Delivery</span>
        </button>
        <button onClick={() => onGo("khata")} style={btnStyle(khata.bg, khata.ink)}>
          <span style={{fontSize:26}}>📒</span>
          <span className="text-[13px] font-extrabold">Khata</span>
        </button>
        <button onClick={() => onGo("rates")} style={btnStyle(rates.bg, rates.ink)}>
          <span style={{fontSize:26}}>🏷️</span>
          <span className="text-[13px] font-extrabold">Rate List</span>
        </button>
      </div>
    </div>
  );
}
