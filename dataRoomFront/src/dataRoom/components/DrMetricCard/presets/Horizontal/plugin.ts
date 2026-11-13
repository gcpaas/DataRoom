import { ComponentLibTagTypeConst } from '../../../../constants/ComponentLibTagTypeConst'
import type { ChartPreset } from '../../../type/ChartPreset'
import { getInstance } from './install'
import thumbnail from './thumbnail.png'

export default {
  id: 'DrMetricCardHorizontal',
  componentType: 'DrMetricCard',
  name: '横向指标卡',
  desc: '指标卡、KPI、单值、横向排列、紧凑布局',
  thumbnail,
  tags: [ComponentLibTagTypeConst.METRIC],
  getInstance,
} satisfies ChartPreset
