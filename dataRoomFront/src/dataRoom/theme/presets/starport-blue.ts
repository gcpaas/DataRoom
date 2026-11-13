import type { ChartTheme } from '../types'
import { withOpacity } from '../color'

export const starportBlue: ChartTheme = {
  id: 'starport-blue',
  name: '星港蓝',
  description: '政务指挥 · 深蓝科技',
  color: {
    primary: '#0F76E8',
    secondary: '#36B8FF',
    success: '#00C896',
    warning: '#FFB04D',
    danger: '#FF4D4F',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#8BA3C7',
    disabled: withOpacity('#8BA3C7', 0.5),
  },
  background: { primary: '#081429', secondary: '#081429' },
  border: { primary: '#8BA3C7', secondary: withOpacity('#8BA3C7', 0.15) },
  series: {
    colors: ['#0F76E8', '#36B8FF', '#48E4F8'],
    barGradient: { startOpacity: 1, endOpacity: 0.5 },
    gradient: { startOpacity: 0.2, endOpacity: 0 },
    point: { fillOpacity: 0.2 },
  },
}
