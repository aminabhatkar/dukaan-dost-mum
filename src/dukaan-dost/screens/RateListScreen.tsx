import { useRef } from "react";
import { TopBar } from "../components/TopBar";
import { IconCheck, IconImage, IconPlus, IconUpload } from "../components/icons";

export interface RateItemView {
  n: string;
  u: string;
  priceText: string;
  onEdit: () => void;
}

export function RateListScreen({
  hasUpload,
  uploadName,
  onFileChosen,
  itemCount,
  rateItems,
  onOpenAddItem,
  onGoHome,
}: {
  hasUpload: boolean;
  uploadName: string;
  onFileChosen: (file: File) => void;
  itemCount: number;
  rateItems: RateItemView[];
  onOpenAddItem: () => void;
  onGoHome: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pb-[196px]">
      <TopBar backLabel="Ghar" onBack={onGoHome} title="Rate List" />

      <div className="px-4 pt-4">
        <div className="rounded-2xl border-2 border-dashed border-warning/70 bg-card p-5 px-[18px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <IconImage size={34} color="var(--color-warning-foreground)" />
          </div>
          <div className="mt-3.5 text-[22px] font-extrabold">Purani list ka photo daaliye</div>
          <div className="mt-2 text-[17px] font-semibold leading-relaxed text-ink-subtle">
            Copy wali rate list ka photo kheench kar daal dijiye. Hum saare rate bhar denge.
          </div>
          <input
            type="file"
            ref={fileRef}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) onFileChosen(f);
            }}
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,.csv,.xlsx"
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-warm-border bg-primary p-4 text-[20px] font-extrabold text-primary-foreground"
            style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
          >
            <IconUpload size={24} color="currentColor" />
            Photo Ya File Chuniye
          </button>
          {hasUpload && (
            <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border-2 border-success/60 bg-success/10 p-3 px-3.5 text-left">
              <IconCheck size={24} color="var(--color-success)" strokeWidth={3.2} />
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-[17px] font-bold text-success">
                {uploadName}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 px-4 pt-5.5">
        <span className="text-[22px] font-extrabold">Dukaan ke Rate ({itemCount})</span>
        <span className="text-[15px] font-bold text-ink-subtle">Aaj update</span>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-3">
        {rateItems.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-[14px] border-2 border-warm-border bg-card p-3.5 pl-4"
            style={{ boxShadow: "0 3px 10px rgba(72,55,32,.10)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="text-[21px] font-extrabold tracking-tight">{it.n}</div>
              <div className="mt-[3px] text-base font-semibold text-ink-subtle">{it.u}</div>
            </div>
            <div className="flex-none whitespace-nowrap text-2xl font-extrabold">{it.priceText}</div>
            <button
              onClick={it.onEdit}
              className="flex-none cursor-pointer rounded-[11px] border-2 border-warm-border bg-secondary px-3.5 py-3 text-base font-extrabold text-ink"
            >
              Badlein
            </button>
          </div>
        ))}
      </div>

      <div
        className="sticky bottom-[92px] p-4"
        style={{ background: "linear-gradient(to top,#FCF8F0 62%,rgba(252,248,240,0))" }}
      >
        <button
          onClick={onOpenAddItem}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-warm-border bg-destructive p-5 text-[22px] font-extrabold text-destructive-foreground"
          style={{ boxShadow: "0 3px 10px rgba(72,55,32,.14)" }}
        >
          <IconPlus size={26} />
          Naya Item Jodiye
        </button>
      </div>
    </div>
  );
}
