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