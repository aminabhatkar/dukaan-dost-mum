import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-background">
      <div
        className="relative w-full max-w-[480px] min-h-screen overflow-hidden bg-card text-ink shadow-[0_0_0_1px_var(--color-warm-border),0_10px_44px_rgba(72,55,32,.14)]"
        style={{ fontSize: 17 }}
      >
        {children}
      </div>
    </div>
  );
}
