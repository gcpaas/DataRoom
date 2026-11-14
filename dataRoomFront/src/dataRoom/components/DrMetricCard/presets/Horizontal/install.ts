import { PageType } from '../../../../constants/PageType'
import { getInstance as superGetInstance } from '../../install'

/** 只修改新实例的差异配置，不增加运行时组件类型。 */
export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '横向指标卡'
  chart.props.layout.direction = 'horizontal'
  Object.assign(chart, pageType === PageType.PAGE ? { w: 16, h: 5 } : { w: 420, h: 100 })
  return chart
}
