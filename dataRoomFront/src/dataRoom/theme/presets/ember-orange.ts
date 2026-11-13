import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const emberOrange: ChartTheme = {
  id: 'ember-orange',
  name: '熔光橙',
  description: '能源工业 · 预警监测',
  color: {
    primary: '#FF7D29',
    secondary: '#FFB04D',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B8A79E',
    disabled: withOpacity('#B8A79E', 0.5),
  },
  background: { primary: '#1A1412', secondary: '#1A1412' },
  border: { primary: '#B8A79E', secondary: withOpacity('#B8A79E', 0.15) },
  series: {
    colors: ['#FF7D29', '#FFB04D', '#E64C3C', '#36CFC9'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
