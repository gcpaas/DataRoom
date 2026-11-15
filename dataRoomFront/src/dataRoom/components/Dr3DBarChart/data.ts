export interface BarData {
  categories: string[]
  series: { name: string; values: (number | null)[] }[]
}

function numeric(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

/** 相同类目/分组的有效指标求和；缺失值保持 null，不伪造零值。 */
export function buildBarData(rows: unknown[], xField: string, yFields: string[], groupField?: string): BarData {
  const valid = rows
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row))
    .filter((row) => row[xField] !== null && row[xField] !== undefined)
  const categories = [...new Set(valid.map((row) => String(row[xField])))]
  const categoryIndex = new Map(categories.map((name, index) => [name, index]))
  const metrics = [...new Set(yFields.filter(Boolean))]
  const groups = groupField ? [...new Set(valid.map((row) => String(row[groupField] ?? '未分组')))] : ['']
  const usedNames = new Set<string>()
  const series = groups.flatMap((group) =>
    metrics.map((field) => {
      const baseName = groupField ? (metrics.length > 1 ? `${group} · ${field}` : group || '空分组') : field
      let name = baseName
      let suffix = 2
      while (usedNames.has(name)) name = `${baseName} (${suffix++})`
      usedNames.add(name)
      const values: (number | null)[] = categories.map(() => null)
      for (const row of valid) {
        if (groupField && String(row[groupField] ?? '未分组') !== group) continue
        const index = categoryIndex.get(String(row[xField]))!
        const value = numeric(row[field])
        if (value === null) continue
        const total = (values[index] ?? 0) + value
        values[index] = Number.isFinite(total) ? total : null
      }
      return { name, values }
    }),
  )
  return { categories, series }
}
