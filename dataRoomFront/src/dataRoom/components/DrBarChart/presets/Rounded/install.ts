import type { PageType } from '../../../../constants/PageType'
import { getInstance as superGetInstance } from '../../install'

export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '圆角柱状图'
  chart.props.series.borderRadius = [12, 12, 0, 0]
  chart.props.series.gradient.enabled = false
  return chart
}
