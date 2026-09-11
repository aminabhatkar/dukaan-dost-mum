import { BackButton } from "./BackButton";

export function TopBar({
  backLabel,
  onBack,
  title,
}: {
  backLabel: string;
  onBack: () => void;
  title: string;
}) {
  return (
    <div
      className="flex items-center gap-4 bg-primary px-[18px] py-4 pb-5 text-primary-foreground"
    >
      <BackButton label={backLabel} onBack={onBack} />
      <div className="text-[26px] font-extrabold tracking-tight">{title}</div>
    </div>
  );
}
