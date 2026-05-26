export type DateTimeFormat = 'yyyy-MM-dd' | 'yyyy-MM-dd HH:mm' | 'yyyy-MM-dd HH:mm:ss'

export const dateTimeFormatOptions: { label: string; value: DateTimeFormat }[] = [
  {label: 'yyyy-MM-dd', value: 'yyyy-MM-dd'},
  {label: 'yyyy-MM-dd HH:mm', value: 'yyyy-MM-dd HH:mm'},
  {label: 'yyyy-MM-dd HH:mm:ss', value: 'yyyy-MM-dd HH:mm:ss'},
]

const pad2 = (value: number): string => String(value).padStart(2, '0')

export const formatDateTime = (date: Date, format: DateTimeFormat): string => {
  const yyyy = String(date.getFullYear())
  const MM = pad2(date.getMonth() + 1)
  const dd = pad2(date.getDate())
  const HH = pad2(date.getHours())
  const mm = pad2(date.getMinutes())
  const ss = pad2(date.getSeconds())

  if (format === 'yyyy-MM-dd') {
    return `${yyyy}-${MM}-${dd}`
  }
  if (format === 'yyyy-MM-dd HH:mm') {
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}`
  }
  if (format === 'yyyy-MM-dd HH:mm:ss') {
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
  }
  return ''
}
