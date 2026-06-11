/** Nest ValidationPipe implicit conversion can turn missing query nums into NaN. */
export function normalizePage(value?: number | string, fallback = 1): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeLimit(value?: number | string, fallback = 20, max = 100): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export function getPagination(page?: number | string, limit?: number | string, defaultLimit = 20) {
  const safePage = normalizePage(page);
  const safeLimit = normalizeLimit(limit, defaultLimit);
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}
