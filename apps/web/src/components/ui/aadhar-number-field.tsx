import { formatAadharInput } from '@/lib/aadhar';

interface AadharNumberFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  labelClassName?: string;
  inputClassName?: string;
}

export function AadharNumberField({
  value,
  onChange,
  required,
  labelClassName = 'block text-sm text-slate-400 mb-1',
  inputClassName = 'w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm',
}: AadharNumberFieldProps) {
  return (
    <div>
      <label className={labelClassName}>Aadhar Number</label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(formatAadharInput(e.target.value))}
        required={required}
        placeholder="1234-5678-9012"
        maxLength={14}
        className={inputClassName}
      />
    </div>
  );
}
