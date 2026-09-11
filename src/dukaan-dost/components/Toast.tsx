export function Toast({ text, onUndo }: { text: string; onUndo: () => void }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[104px] pointer-events-none"
    >
      <div
        className="flex w-full max-w-[456px] items-center gap-3 rounded-2xl bg-ink p-4 pl-[18px] text-cream pointer-events-auto"
        style={{ animation: "dd-up .18s ease-out" }}
      >
        <span className="min-w-0 flex-1 text-[19px] font-bold">{text}</span>
        <button
          onClick={onUndo}
          className="flex-none cursor-pointer rounded-xl bg-accent px-4 py-3 text-[18px] font-extrabold text-accent-foreground"
        >
          Wapas Karein
        </button>
      </div>
    </div>
  );
}
