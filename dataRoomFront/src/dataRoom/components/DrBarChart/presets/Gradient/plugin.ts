import { ComponentLibTagTypeConst } from '../../../../constants/ComponentLibTagTypeConst'
import type { ChartPreset } from '../../../type/ChartPreset'
import { getInstance } from './install'
import thumbnail from './thumbnail.png'

export default {
  id: 'DrBarChartGradient',
  componentType: 'DrBarChart',
  name: '渐变柱状图',
  desc: '渐变柱状图、ECharts',
  thumbnail,
  tags: [ComponentLibTagTypeConst.BAR],
  getInstance,
} satisfies ChartPreset
