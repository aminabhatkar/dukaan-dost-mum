import { useState } from "react";
import { BackButton } from "../components/BackButton";
import { IconPhone, IconPlus, IconRupeeArrow } from "../components/icons";

export interface PrefRowView {
  cat: string;
  item: string;
  note: string;
  onEdit: () => void;
}

export interface EntryRowView {
  label: string;
  sub: string;
  glyph: string;
  dotBg: string;
  dotInk: string;
  amtText: string;
  amtColor: string;
}

export interface CustomerDetailView {
  name: string;
  phone: string;
  telHref: string;
  dueText: string;
  dueColor: string;
  prefCount: number;
  prefs: PrefRowView[];
  entries: EntryRowView[];
  onEditName: (newName: string) => void;
}

export function CustomerScreen({
  cust,
  onGoKhata,
  onOpenAddPref,
  onOpenPay,
}: {
  cust: CustomerDetailView;
  onGoKhata: () => void;
  onOpenAddPref: () => void;
  onOpenPay: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(cust.name);

  return (
    <div className="pb-[200px]">
      <div className="bg-primary px-[18px] pb-5 pt-4 text-primary-foreground">
        <div className="flex items-center gap-3.5">
          <BackButton onBack={onGoKhata} label="Khata" />
          {editing ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameVal.trim()) { cust.onEditName(nameVal.trim()); setEditing(false); }
                  if (e.key === 'Escape') { setNameVal(cust.name); setEditing(false); }
                }}
                autoFocus
                className="min-w-0 flex-1 rounded-xl border-2 border-primary-foreground/60 bg-transparent px-3 py-1.5 text-[22px] font-extrabold text-primary-foreground outline-none"
              />
              <button
                onClick={() => { if (nameVal.trim()) { cust.onEditName(nameVal.trim()); setEditing(false); } }}
                className="flex-none rounded-xl border-2 border-primary-foreground/60 bg-transparent px-3 py-1.5 text-[15px] font-extrabold text-primary-foreground"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="min-w-0 overflow-hidden text-[26px] font-extrabold tracking-tight text-ellipsis whitespace-nowrap">
                {cust.name}
              </div>
              <button
                onClick={() => { setNameVal(cust.name); setEditing(true); }}
                className="flex-none cursor-pointer rounded-lg border-2 border-primary-foreground/40 bg-transparent px-2.5 py-1 text-[13px] font-bold text-primary-foreground/80"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-[14px] bg-card p-4 px-[18px] text-ink">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-ink-subtle">Baaki Rakam</div>
              <div className="mt-1 text-[40px] font-extrabold tracking-tighter" style={{ color: cust.dueColor }}>
                {cust.dueText}
              </div>
            </div>
            <a
              href={cust.telHref}
              className="flex flex-none flex-col items-center gap-1 rounded-xl border-2 border-warm-border bg-success p-3 px-4 no-underline text-success-foreground"
            >
              <IconPhone size={24} color="currentColor" />
              <span className="text-[15px] font-extrabold">Phone</span>
            </a>
          </div>
          <div className="mt-2.5 text-[17px] font-bold text-ink-subtle">{cust.phone}</div>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 px-4 pt-5">
        <span className="text-[22px] font-extrabold">Iski Pasand</span>
        <span className="text-[15px] font-bold text-ink-subtle">{cust.prefCount} saved</span>
      </div>
      <div className="px-4 pt-1.5 text-base font-semibold leading-relaxed text-ink-subtle">
        Jab yeh "wahi wala" bolein, app yahi bhejegi.
      </div>
      <div className="flex flex-col gap-2.5 px-4 pt-3">
        {cust.prefs.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[14px] border-2 border-warm-border bg-card p-3.5 pl-4"
            style={{ boxShadow: "0 3px 10px rgba(72,55,32,.10)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-ink-subtle">{p.cat}</div>
              <div className="mt-[3px] text-[21px] font-extrabold tracking-tight">{p.item}</div>
              <div className="mt-[3px] text-base font-semibold text-ink-subtle">{p.note}</div>
            </div>
            <button
              onClick={p.onEdit}
              className="flex-none cursor-pointer rounded-[11px] border-2 border-warm-border bg-secondary px-3.5 py-3 text-base font-extrabold text-ink"
            >
              Badlein
            </button>
          </div>
        ))}
        <button
          onClick={onOpenAddPref}
          className="flex cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed border-warning/70 bg-card py-4 text-[19px] font-extrabold text-warning-foreground"
        >
          <IconPlus size={22} />
          Pasand Jodiye
        </button>
      </div>

      <div className="px-4 pt-6 text-[22px] font-extrabold">Purana Hisaab</div>
      <div className="flex flex-col px-4 pt-3.5">
        {cust.entries.map((e, i) => (
          <div key={i} className="flex gap-3.5">
            <div className="flex w-11 flex-none flex-col items-center">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-warm-border text-[20px] font-extrabold"
                style={{ background: e.dotBg, color: e.dotInk }}
              >
                {e.glyph}
              </span>
              <span className="min-h-3.5 w-[3px] flex-1 bg-warm-border-light" />
            </div>
            <div className="min-w-0 flex-1 pb-4.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[20px] font-extrabold">{e.label}</span>
                <span className="whitespace-nowrap text-[21px] font-extrabold" style={{ color: e.amtColor }}>
                  {e.amtText}
                </span>
              </div>
              <div className="mt-[3px] text-base font-semibold text-ink-subtle">{e.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="sticky bottom-[92px] p-4"
        style={{ background: "linear-gradient(to top,#FCF8F0 62%,rgba(245,237,223,0))" }}
      >
        <button
          onClick={onOpenPay}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-warm-border bg-success p-5 text-[22px] font-extrabold text-success-foreground"
          style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
        >
          <IconRupeeArrow size={26} />
          Paisa Mila — Likhein
        </button>
      </div>
    </div>
  );
}
