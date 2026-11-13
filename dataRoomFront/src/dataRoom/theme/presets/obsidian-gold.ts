import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const obsidianGold: ChartTheme = {
  id: 'obsidian-gold',
  name: '曜石金',
  description: '金融指挥 · 高端展厅',
  color: {
    primary: '#D4AF37',
    secondary: '#FFD770',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A89E8A',
    disabled: withOpacity('#A89E8A', 0.5),
  },
  background: { primary: '#0C0C16', secondary: '#0C0C16' },
  border: { primary: '#A89E8A', secondary: withOpacity('#A89E8A', 0.15) },
  series: {
    colors: ['#D4AF37', '#FFD770', '#3888E8'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
