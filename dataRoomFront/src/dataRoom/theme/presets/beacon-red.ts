import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const beaconRed: ChartTheme = {
  id: 'beacon-red',
  name: '赤烽红',
  description: '应急消防 · 风险监测',
  color: {
    primary: '#D83838',
    secondary: '#FF6B6B',
    success: '#36B37E',
    warning: '#FFB04D',
    danger: '#D83838',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B28C8C',
    disabled: withOpacity('#B28C8C', 0.5),
  },
  background: { primary: '#180E10', secondary: '#180E10' },
  border: { primary: '#B28C8C', secondary: withOpacity('#B28C8C', 0.15) },
  series: {
    colors: ['#D83838', '#FF6B6B', '#F2B04E'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
