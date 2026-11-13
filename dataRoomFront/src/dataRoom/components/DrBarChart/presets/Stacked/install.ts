import type { PageType } from '../../../../constants/PageType'
import { getInstance as superGetInstance } from '../../install'

export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '堆叠柱状图'
  chart.props.series.displayMode = 'stack'
  chart.props.series.gradient.enabled = false
  chart.props.series.borderRadius = [0, 0, 0, 0]
  chart.props.legend.show = true
  chart.dataset.fields = { xField: ['time'], yField: ['value', 'compareValue'], seriesField: [] }
  return chart
}
