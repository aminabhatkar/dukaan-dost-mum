import { BottomSheet } from "../components/BottomSheet";

export interface KeyView {
  label: string;
  bg: string;
  onTap: () => void;
}

export function PaySheet({
  payAmountText,
  payHint,
  keys,
  onClose,
  onSubmit,
}: {
  payAmountText: string;
  payHint: string;
  keys: KeyView[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <BottomSheet title="Kitna Paisa Mila?" onClose={onClose}>
      <div className="mt-3.5 rounded-[14px] border-2 border-warm-border bg-card p-4 text-center">
        <div className="text-[44px] font-extrabold leading-none tracking-tighter">{payAmountText}</div>
        <div className="mt-1 text-base font-bold text-ink-subtle">{payHint}</div>
      </div>
      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {keys.map((k, i) => (
          <button
            key={i}
            onClick={k.onTap}
            className="cursor-pointer rounded-xl border-2 border-warm-border py-4 text-[26px] font-extrabold text-ink"
            style={{ background: k.bg }}
          >
            {k.label}
          </button>
        ))}
      </div>
      <button
        onClick={onSubmit}
        className="mt-3.5 w-full cursor-pointer rounded-[14px] border-2 border-warm-border bg-success p-5 text-[22px] font-extrabold text-success-foreground"
        style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
      >
        Khate Mein Likh Dein
      </button>
    </BottomSheet>
  );
}
