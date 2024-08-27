// 根据组件的type来返回组件的默认的完整的交互信息
function getInteractionInstall (type) {
  switch (type) {
    case 'BaseBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/interaction/index')
    case 'GroupBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/interaction/index')
    case 'BaseLine':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/interaction/index')

    case 'BaseColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/interaction/index')
    case 'BaseArea':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseArea/interaction/index')
    case 'BasePie':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePie/interaction/index')
    case 'BasePoint':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePoint/interaction/index')
    case 'BaseRadar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRadar/interaction/index')
    case 'BaseGrid':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGrid/interaction/index')
    case 'texts':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/texts/interaction/index')
    case 'BaseMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/index')
    case 'BaseTable':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/index')
    case 'buttons':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/controls/buttons/index')
    case 'inputs':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/controls/inputs/index')
    case 'WordCloud':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/rests/WordCloud/index')
    case 'Heatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/index')
    case 'StackBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBar/interaction/index')
    case 'RoundBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RoundBar/interaction/index')
    case 'StackColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackColumn/interaction/index')
    case 'GroupColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupColumn/interaction/index')
    case 'MultiLine':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/MultiLine/interaction/index')
    case 'RaceLine':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RaceLine/interaction/index')
    case 'QuarterPie':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/QuarterPie/interaction/index')
    case 'InteractivePie':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/InteractivePie/interaction/index')
    case 'BaseDonut':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseDonut/interaction/index')
    case 'CardDonut':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CardDonut/interaction/index')
    case 'BaseRose':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRose/interaction/index')
    case 'StackArea':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackArea/interaction/index')
    case 'PercentArea':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/PercentArea/interaction/index')
    case 'BaseYuJue':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseYuJue/interaction/index')
    case 'StackYuJue':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackYuJue/interaction/index')
    case 'GroupRadar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRadar/interaction/index')
    case 'RegLinePoint':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RegLinePoint/interaction/index')
    case 'BaseSankey':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseSankey/interaction/index')
    case 'DragSankey':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DragSankey/interaction/index')
    case 'ShapeHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/ShapeHeatmap/index')
    case 'SizeHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/SizeHeatmap/index')
    case 'PolarHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/PolarHeatmap/index')
    case 'BaseFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseFunnel/interaction/index')
    case 'CompareFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CompareFunnel/interaction/index')
    case 'FacetedFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/FacetedFunnel/interaction/index')
    case 'BaseLiquid':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLiquid/interaction/index')
    case 'BaseGauge':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGauge/interaction/index')
    case 'BaseProgress':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseProgress/interaction/index')
    case 'BaseBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBullet/interaction/index')
    case 'StackBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBullet/interaction/index')
    case 'GroupBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBullet/interaction/index')
    case 'BaseTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseTreeMap/interaction/index')
    case 'DrillDownTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DrillDownTreeMap/interaction/index')
    case 'NestTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/NestTreeMap/interaction/index')
    case 'BaseWaterfall':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseWaterfall/interaction/index')
    case 'GroupRose':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRose/interaction/index')
    case 'StackRose':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackRose/interaction/index')
    case 'GroupYuJue':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupYuJue/interaction/index')
    case 'RingProgress':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RingProgress/interaction/index')
    case 'BaseStock':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseStock/interaction/index')
    case 'VerticalBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/VerticalBullet/interaction/index')
  }
}
export function getInteraction (type) {
  return new Promise((resolve, reject) => {
    getInteractionInstall(type)
      .then((configModule) => {
        resolve(configModule.default)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
