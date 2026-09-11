export function Field({
  label,
  marginTop = 16,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  marginTop?: number;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
}) {
  return (
    <>
      <label className="block text-[19px] font-extrabold" style={{ marginTop }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-xl border-2 border-warm-border bg-card p-4 text-[22px] font-bold text-ink"
      />
    </>
  );
}
