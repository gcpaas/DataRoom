import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const forestGreen: ChartTheme = {
  id: 'forest-green',
  name: '森境绿',
  description: '生态环保 · 电力能源',
  color: {
    primary: '#00C896',
    secondary: '#39E8B8',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#86B8AA',
    disabled: withOpacity('#86B8AA', 0.5),
  },
  background: { primary: '#0A1A18', secondary: '#0A1A18' },
  border: { primary: '#86B8AA', secondary: withOpacity('#86B8AA', 0.15) },
  series: {
    colors: ['#00C896', '#39E8B8', '#187A66', '#289DE8'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
