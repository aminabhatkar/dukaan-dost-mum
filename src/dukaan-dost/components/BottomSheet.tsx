import type { ReactNode } from "react";

export function BottomSheet({
  title,
  subtitle,
  onClose,
  children,
  scrollable = false,
  overlayOpacity = 0.55,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  scrollable?: boolean;
  overlayOpacity?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: `rgba(27,23,18,${overlayOpacity})` }}
    >
      <div
        className="w-full max-w-[480px] rounded-t-[20px] border-t-2 border-warm-border bg-card px-4 pb-6 pt-[18px]"
        style={{
          animation: "dd-sheet .18s ease-out",
          ...(scrollable ? { maxHeight: "88vh", overflow: "auto" as const } : {}),
        }}
      >
        <div className="flex items-center justify-between gap-3">
          {subtitle !== undefined ? (
            <div className="min-w-0">
              <div className="text-2xl font-extrabold">{title}</div>
              <div className="mt-[3px] text-base font-semibold text-ink-subtle">{subtitle}</div>
            </div>
          ) : (
            <div className="text-2xl font-extrabold">{title}</div>
          )}
          <button
            onClick={onClose}
            className="flex-none rounded-xl border-2 border-warm-border bg-card px-4 py-2.5 text-[17px] font-extrabold text-ink cursor-pointer"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
