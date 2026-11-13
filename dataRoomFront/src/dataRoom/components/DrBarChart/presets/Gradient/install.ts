import type { PageType } from '../../../../constants/PageType'
import { getInstance as superGetInstance } from '../../install'

export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '渐变柱状图'
  chart.props.series.gradient.enabled = true
  chart.props.series.gradient.direction = 'vertical'
  chart.props.series.gradient.startOpacity = 1
  chart.props.series.gradient.endOpacity = 0.15
  return chart
}
