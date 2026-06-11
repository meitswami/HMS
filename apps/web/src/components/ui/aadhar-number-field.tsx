'use client';

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
  const display = formatAadharInput(value);

  const apply = (raw: string) => {
    onChange(formatAadharInput(raw));
  };

  return (
    <div>
      <label className={labelClassName}>Aadhar Number</label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={(e) => apply(e.target.value)}
        onInput={(e) => apply((e.target as HTMLInputElement).value)}
        onPaste={(e) => {
          e.preventDefault();
          const input = e.currentTarget;
          const pasted = e.clipboardData.getData('text');
          const start = input.selectionStart ?? display.length;
          const end = input.selectionEnd ?? display.length;
          apply(display.slice(0, start) + pasted + display.slice(end));
        }}
        onBlur={(e) => apply(e.target.value)}
        required={required}
        placeholder="1234-5678-9012"
        className={inputClassName}
      />
    </div>
  );
}
