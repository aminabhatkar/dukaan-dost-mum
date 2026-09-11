import { IconChevronLeft } from "./icons";

export function BackButton({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex flex-none items-center gap-2 rounded-xl bg-card px-4 py-3 text-[17px] font-extrabold text-primary cursor-pointer"
    >
      <IconChevronLeft size={20} />
      {label}
    </button>
  );
}
