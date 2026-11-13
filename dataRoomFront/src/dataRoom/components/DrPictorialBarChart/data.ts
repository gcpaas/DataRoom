export interface PictorialRow {
  name: string
  value: number | null
  image: string
}

/** 不接受可执行协议；相对素材路径留给统一资源解析器处理。 */
export function imageAddress(value: unknown): string {
  if (typeof value !== 'string') return ''
  const url = value.trim()
  if (!url || /[\u0000-\u001f\u007f]/.test(url) || url.startsWith('//') || url.includes('\\')) return ''
  if (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^https?:\/\//i.test(url)) return ''
  return url.replace(/^https?:/i, (protocol) => protocol.toLowerCase())
}

export function toPictorialData(rows: unknown[], nameField?: string, valueField?: string, imageField?: string): PictorialRow[] {
  if (!nameField || !valueField) return []
  return rows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    .map((row) => {
      const raw = row[valueField]
      const number = typeof raw === 'number' || (typeof raw === 'string' && raw.trim()) ? Number(raw) : NaN
      return {
        name: String(row[nameField] ?? ''),
        value: Number.isFinite(number) && number >= 0 ? number : null,
        image: imageAddress(imageField ? row[imageField] : ''),
      }
    })
}
