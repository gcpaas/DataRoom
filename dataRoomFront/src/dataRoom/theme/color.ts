/** 替换 alpha 而非叠乘，兼容颜色选择器的 hex/rgb/rgba 输出。 */
export function withOpacity(value: string, opacity: number): string {
  let parsed: number[] | undefined
  const hex = value.trim().match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i)?.[1]
  if (hex) {
    const expanded = hex.length <= 4 ? [...hex].map(part => part + part).join('') : hex
    parsed = [0, 2, 4].map(index => parseInt(expanded.slice(index, index + 2), 16))
  } else {
    const rgb = value.trim().match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)$/i)
    if (rgb) parsed = rgb.slice(1, 4).map(Number)
  }
  if (!parsed) return value
  return `rgba(${parsed[0]}, ${parsed[1]}, ${parsed[2]}, ${Math.max(0, Math.min(1, opacity))})`
}

export function gradientStops(value: string, start: number, end: number) {
  return [
    { offset: 0, color: withOpacity(value, start) },
    { offset: 1, color: withOpacity(value, end) },
  ]
}
