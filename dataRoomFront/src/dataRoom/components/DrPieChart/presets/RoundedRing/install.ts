import type { PageType } from '../../../../constants/PageType'
import { getInstance as superGetInstance } from '../../install'

export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '圆角环形图'
  chart.props.pie.innerRadius = 45
  chart.props.pie.outerRadius = 70
  chart.props.pie.roseType = false
  chart.props.pie.borderRadius = 10
  return chart
}
