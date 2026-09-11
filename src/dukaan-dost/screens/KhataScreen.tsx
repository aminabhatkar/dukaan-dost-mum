import { TopBar } from "../components/TopBar";
import { IconPlus } from "../components/icons";

export interface CustomerRowView {
  id: string;
  name: string;
  phone: string;
  initial: string;
  dueText: string;
  dueLabel: string;
  dueColor: string;
  onOpen: () => void;
}

export function KhataScreen({
  totalDueText,
  customers,
  onGoHome,
  onOpenAddCustomer,
}: {
  totalDueText: string;
  customers: CustomerRowView[];
  onGoHome: () => void;
  onOpenAddCustomer: () => void;
}) {
  return (
    <div className="pb-[196px]">
      <TopBar backLabel="Ghar" onBack={onGoHome} title="Grahak Khata" />

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-warm-border bg-destructive p-4 px-[18px] text-destructive-foreground">
          <span className="text-[19px] font-bold">Kul Baaki Rakam</span>
          <span className="text-[30px] font-extrabold tracking-tight">{totalDueText}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={c.onOpen}
            className="flex w-full cursor-pointer items-center gap-3.5 rounded-[14px] border-2 border-warm-border bg-card p-4 text-left text-ink"
            style={{ boxShadow: "0 3px 10px rgba(72,55,32,.12)" }}
          >
            <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border-2 border-warm-border bg-secondary text-[22px] font-extrabold">
              {c.initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[22px] font-extrabold tracking-tight">{c.name}</span>
              <span className="mt-[3px] block text-base font-semibold text-ink-subtle">{c.phone}</span>
            </span>
            <span className="flex-none text-right">
              <span className="block text-2xl font-extrabold" style={{ color: c.dueColor }}>
                {c.dueText}
              </span>
              <span className="mt-0.5 block text-[15px] font-bold text-ink-subtle">{c.dueLabel}</span>
            </span>
          </button>
        ))}
      </div>

      <div
        className="sticky bottom-[92px] p-4"
        style={{ background: "linear-gradient(to top,#FCF8F0 62%,rgba(245,237,223,0))" }}
      >
        <button
          onClick={onOpenAddCustomer}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-warm-border bg-primary p-5 text-[22px] font-extrabold text-primary-foreground"
          style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
        >
          <IconPlus size={26} />
          Naya Grahak Judiye
        </button>
      </div>
    </div>
  );
}
