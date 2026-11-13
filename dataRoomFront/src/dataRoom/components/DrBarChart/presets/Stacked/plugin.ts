import { ComponentLibTagTypeConst } from '../../../../constants/ComponentLibTagTypeConst'
import type { ChartPreset } from '../../../type/ChartPreset'
import { getInstance } from './install'
import thumbnail from './thumbnail.png'

export default {
  id: 'DrBarChartStacked',
  componentType: 'DrBarChart',
  name: '堆叠柱状图',
  desc: '堆叠柱状图、ECharts',
  thumbnail,
  tags: [ComponentLibTagTypeConst.BAR],
  getInstance,
} satisfies ChartPreset
