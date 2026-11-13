import { ComponentLibTagTypeConst } from '../../../../constants/ComponentLibTagTypeConst'
import type { ChartPreset } from '../../../type/ChartPreset'
import { getInstance } from './install'
import thumbnail from './thumbnail.png'

export default {
  id: 'DrPieChartRoundedRing',
  componentType: 'DrPieChart',
  name: '圆角环形图',
  desc: '圆角环形图、ECharts',
  thumbnail,
  tags: [ComponentLibTagTypeConst.PIE],
  getInstance,
} satisfies ChartPreset
