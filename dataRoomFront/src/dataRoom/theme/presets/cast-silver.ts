import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const castSilver: ChartTheme = {
  id: 'cast-silver',
  name: '铸影银',
  description: '智能制造 · 设备监控',
  color: {
    primary: '#6E849C',
    secondary: '#96B0CC',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#86929F',
    disabled: withOpacity('#86929F', 0.5),
  },
  background: { primary: '#121418', secondary: '#121418' },
  border: { primary: '#86929F', secondary: withOpacity('#86929F', 0.15) },
  series: {
    colors: ['#6E849C', '#96B0CC', '#36C4B2'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
