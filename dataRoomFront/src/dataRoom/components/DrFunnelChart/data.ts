/** 漏斗面积仅接受有限非负数，保留零值和原始阶段顺序。 */
export function toFunnelData(rows: unknown[], nameField?: string, valueField?: string) {
  if (!nameField || !valueField) return []
  return rows.flatMap(row => {
    if (!row || typeof row !== 'object') return []
    const record = row as Record<string, unknown>
    const rawValue = record[valueField]
    if (typeof rawValue !== 'number' && typeof rawValue !== 'string') return []
    if (typeof rawValue === 'string' && !rawValue.trim()) return []
    const value = Number(rawValue)
    if (!Number.isFinite(value) || value < 0) return []
    return [{ name: String(record[nameField] ?? ''), value }]
  })
}
