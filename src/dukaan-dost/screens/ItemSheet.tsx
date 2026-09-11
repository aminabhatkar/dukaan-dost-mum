import { BottomSheet } from "../components/BottomSheet";
import { Field } from "../components/Field";
import { SubmitButton } from "../components/SubmitButton";

export function ItemSheet({
  title,
  itName,
  itUnit,
  itPrice,
  onItNameChange,
  onItUnitChange,
  onItPriceChange,
  onClose,
  onSubmit,
}: {
  title: string;
  itName: string;
  itUnit: string;
  itPrice: string;
  onItNameChange: (v: string) => void;
  onItUnitChange: (v: string) => void;
  onItPriceChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <BottomSheet title={title} onClose={onClose} overlayOpacity={0.5}>
      <Field label="Saman ka Naam" marginTop={18} value={itName} onChange={onItNameChange} placeholder="Jaise: Doodh (full cream)" />
      <Field label="Kitne ka" marginTop={16} value={itUnit} onChange={onItUnitChange} placeholder="Jaise: per litre" />
      <Field label="Rate (rupaye)" marginTop={16} value={itPrice} onChange={onItPriceChange} placeholder="66" inputMode="numeric" />
      <SubmitButton onClick={onSubmit}>Rate Save Karein</SubmitButton>
    </BottomSheet>
  );
}
