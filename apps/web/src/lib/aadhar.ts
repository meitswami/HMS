/** Strip non-digits and cap at 12 — used before submit/API calls. */
export function normalizeAadharDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 12);
}

/** Format as XXXX-XXXX-XXXX while typing; user-typed dashes are ignored. */
export function formatAadharInput(value: string): string {
  const digits = normalizeAadharDigits(value);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
}
