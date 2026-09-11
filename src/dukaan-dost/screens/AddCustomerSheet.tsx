import { BottomSheet } from "../components/BottomSheet";
import { Field } from "../components/Field";
import { SubmitButton } from "../components/SubmitButton";

export function AddCustomerSheet({
  newName,
  newPhone,
  onNameChange,
  onPhoneChange,
  onClose,
  onSubmit,
}: {
  newName: string;
  newPhone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <BottomSheet title="Naya Grahak Judiye" onClose={onClose}>
      <Field label="Grahak ka Naam" marginTop={18} value={newName} onChange={onNameChange} placeholder="Jaise: Sunita Devi" />
      <Field label="Phone Number" marginTop={16} value={newPhone} onChange={onPhoneChange} placeholder="98XXX XXXXX" inputMode="numeric" />
      <SubmitButton onClick={onSubmit} bg="var(--color-primary)">
        Grahak Save Karein
      </SubmitButton>
    </BottomSheet>
  );
}
