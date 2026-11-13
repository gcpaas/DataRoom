import type { PageType } from '../../../../constants/PageType'
import { getInstance as superGetInstance } from '../../install'

export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '平滑折线图'
  chart.props.series.lineType = 'smooth'
  return chart
}
