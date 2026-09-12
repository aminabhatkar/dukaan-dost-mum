import { BottomSheet } from "../components/BottomSheet";
import { Field } from "../components/Field";
import { SubmitButton } from "../components/SubmitButton";
import { IconCheck } from "../components/icons";

export interface CatChipView {
  n: string;
  bg: string;
  ink: string;
  border: string;
  onPick: () => void;
}

export interface PrefChoiceView {
  n: string;
  sub: string;
  picked: boolean;
  isTop: boolean;
  bg: string;
  border: string;
  dotBorder: string;
  dotBg: string;
  onPick: () => void;
}

export function PrefSheet({
  title,
  subtitle,
  prefCat,
  onPrefCatChange,
  catChips,
  noChoices,
  prefChoices,
  prefNote,
  onPrefNoteChange,
  onClose,
  onSubmit,
}: {
  title: string;
  subtitle: string;
  prefCat: string;
  onPrefCatChange: (v: string) => void;
  catChips: CatChipView[];
  noChoices: boolean;
  prefChoices: PrefChoiceView[];
  prefNote: string;
  onPrefNoteChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <BottomSheet title={title} subtitle={subtitle} onClose={onClose} scrollable overlayOpacity={0.5}>
      <Field label="Kis cheez ki pasand" marginTop={18} value={prefCat} onChange={onPrefCatChange} placeholder="Jaise: Sabun" />

      <div className="mt-2.5 flex flex-wrap gap-2">
        {catChips.map((ch) => (
          <button
            key={ch.n}
            onClick={ch.onPick}
            className="cursor-pointer rounded-full px-4 py-2.5 text-[17px] font-extrabold"
            style={{ background: ch.bg, color: ch.ink, border: `2px solid ${ch.border}` }}
          >
            {ch.n}
          </button>
        ))}
      </div>

      <div className="mt-4 text-[19px] font-extrabold">Kaunsa saman</div>
      {noChoices && (
        <div className="mt-2 rounded-[13px] border-2 border-warm-border-light bg-secondary p-4 px-3.5 text-[17px] font-semibold leading-relaxed text-ink-subtle">
          Upar se category chuniye, phir yahan brand dikhenge.
        </div>
      )}
      <div className="mt-2 flex flex-col gap-2">
        {prefChoices.map((c) => (
          <button
            key={c.n}
            onClick={c.onPick}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[13px] py-3.5 px-3.5 text-left text-ink"
            style={{ background: c.bg, border: `2px solid ${c.border}` }}
          >
            <span
              className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full"
              style={{ border: `2px solid ${c.dotBorder}`, background: c.dotBg }}
            >
              {c.picked && <IconCheck size={16} color="#FFFFFF" strokeWidth={4} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[20px] font-extrabold tracking-tight">{c.n}</span>
              <span className="mt-0.5 block text-base font-semibold text-ink-subtle">{c.sub}</span>
            </span>
            {c.isTop && (
              <span className="flex-none rounded-lg bg-secondary px-2 py-1.5 text-sm font-extrabold text-warning-foreground">
                SABSE ZYADA
              </span>
            )}
          </button>
        ))}
      </div>

      <Field label="Choti baat (optional)" marginTop={18} value={prefNote} onChange={onPrefNoteChange} placeholder="Jaise: hamesha bada packet" />

      <SubmitButton onClick={onSubmit}>Pasand Save Karein</SubmitButton>
    </BottomSheet>
  );
}
