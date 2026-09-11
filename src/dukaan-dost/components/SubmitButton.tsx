import type { ReactNode } from "react";

export function SubmitButton({
  onClick,
  bg = "var(--color-success)",
  children,
}: {
  onClick: () => void;
  bg?: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-5 w-full cursor-pointer rounded-2xl border-2 border-warm-border p-5 text-[22px] font-extrabold text-white"
      style={{ background: bg, boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
    >
      {children}
    </button>
  );
}
