export interface PieDatum {
  name: string
  value: number
}
export interface PieSlice extends PieDatum {
  start: number
  end: number
  percent: number
}

/** 分类按首次出现顺序聚合；非负有限数值才能参与饼图。 */
export function toPieData(rows: unknown[], nameField: string, valueField: string): PieDatum[] {
  if (!nameField || !valueField) return []
  const sums = new Map<string, number>()
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    const record = row as Record<string, unknown>
    const name = record[nameField]
    const raw = record[valueField]
    if ((typeof name !== 'string' && typeof name !== 'number') || String(name).trim() === '') continue
    if ((typeof raw !== 'string' && typeof raw !== 'number') || String(raw).trim() === '') continue
    const value = Number(raw)
    if (!Number.isFinite(value) || value < 0) continue
    const sum = (sums.get(String(name)) ?? 0) + value
    if (Number.isFinite(sum)) sums.set(String(name), sum)
  }
  return [...sums].map(([name, value]) => ({ name, value }))
}

export function sliceData(data: PieDatum[], selected: Record<string, boolean>, rotation: number, gap: number): PieSlice[] {
  const visible = data.filter((item) => selected[item.name] !== false && item.value > 0)
  const max = visible.reduce((value, item) => Math.max(value, item.value), 0)
  // 归一化后求和，避免多个极大数相加溢出。
  const total = max ? visible.reduce((sum, item) => sum + item.value / max, 0) : 0
  let angle = (rotation * Math.PI) / 180
  return data.map((item) => {
    const ratio = total && selected[item.name] !== false ? item.value / max / total : 0
    const sweep = ratio * Math.PI * 2
    // 单个分类为完整圆环，不留人工切缝；极小扇区仍保留可见面积。
    const inset = visible.length > 1 ? Math.min((Math.max(0, gap) * Math.PI) / 180, sweep * 0.4) / 2 : 0
    const start = angle + inset
    angle += sweep
    return { ...item, start, end: angle - inset, percent: ratio * 100 }
  })
}
