export function readLiquidData(input: unknown, valueField?: string, titleField?: string): { value: number | null; title: string } {
  const rows = Array.isArray(input) ? input : input && typeof input === 'object' && 'data' in input ? input.data : []
  const row = Array.isArray(rows) ? rows[0] : undefined
  if (!row || typeof row !== 'object') return { value: null, title: '' }
  const raw = valueField ? row[valueField] : undefined
  const value = typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '') ? Number(raw) : NaN
  const title = titleField ? row[titleField] : undefined
  return { value: Number.isFinite(value) ? value : null, title: typeof title === 'string' || typeof title === 'number' ? String(title) : '' }
}

export function liquidRatio(value: number | null, min: number, max: number): number {
  if (value === null || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}
