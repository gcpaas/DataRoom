import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const clearSea: ChartTheme = {
  id: 'clear-sea',
  name: '澄海青',
  description: '水利流域 · 海洋水务',
  color: {
    primary: '#12A8C8',
    secondary: '#44D0E8',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#84A8B8',
    disabled: withOpacity('#84A8B8', 0.5),
  },
  background: { primary: '#071520', secondary: '#071520' },
  border: { primary: '#84A8B8', secondary: withOpacity('#84A8B8', 0.15) },
  series: {
    colors: ['#12A8C8', '#44D0E8', '#0F6880'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
