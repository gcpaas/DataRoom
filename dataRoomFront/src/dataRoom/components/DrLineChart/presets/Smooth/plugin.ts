import { ComponentLibTagTypeConst } from '../../../../constants/ComponentLibTagTypeConst'
import type { ChartPreset } from '../../../type/ChartPreset'
import { getInstance } from './install'
import thumbnail from './thumbnail.png'

export default {
  id: 'DrLineChartSmooth',
  componentType: 'DrLineChart',
  name: '平滑折线图',
  desc: '平滑折线图、ECharts',
  thumbnail,
  tags: [ComponentLibTagTypeConst.LINE],
  getInstance,
} satisfies ChartPreset
