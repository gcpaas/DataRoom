import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const nightPurple: ChartTheme = {
  id: 'night-purple',
  name: '幻夜紫',
  description: '汇报展厅 · 科技展示',
  color: {
    primary: '#8255D9',
    secondary: '#B88CFF',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A496C2',
    disabled: withOpacity('#A496C2', 0.5),
  },
  background: { primary: '#141024', secondary: '#141024' },
  border: { primary: '#A496C2', secondary: withOpacity('#A496C2', 0.15) },
  series: {
    colors: ['#8255D9', '#B88CFF', '#D888C8', '#3CD9C2'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
