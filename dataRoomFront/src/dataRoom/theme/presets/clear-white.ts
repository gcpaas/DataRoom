import { withOpacity } from '../color'
import type { ChartTheme } from '../types'

export const clearWhite: ChartTheme = {
  id: 'clear-white',
  name: '清晖白',
  description: '浅色看板 · 汇报投屏',
  color: {
    primary: '#1F78D1',
    secondary: '#36B37E',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#1D2129',
    secondary: '#6E7681',
    disabled: withOpacity('#6E7681', 0.5),
  },
  background: { primary: '#F5F7FA', secondary: '#F5F7FA' },
  border: { primary: '#D8DFE6', secondary: '#D8DFE6' },
  series: {
    colors: ['#1F78D1', '#36B37E', '#FF8C38'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
