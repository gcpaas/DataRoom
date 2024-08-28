// 根据组件的type来返回组件的默认的完整的配置信息
function getDeclarationByType (type) {
  switch (type) {
    case 'texts':
      return import(/* webpackChunkName: "textsConfig" */ '@gcpaas/data-room-ui/packages/components/texts/bigScreenDefinition.js')
    case 'BaseLine':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/bigScreenDefinition.js')
    case 'BaseBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/bigScreenDefinition.js')
    case 'GroupBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/bigScreenDefinition.js')
    case 'BaseArea':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseArea/bigScreenDefinition.js')
    case 'BasePie':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePie/bigScreenDefinition.js')
    case 'BaseRadar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRadar/bigScreenDefinition.js')
    case 'BasePoint':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePoint/bigScreenDefinition.js')
    case 'BaseGrid':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGrid/bigScreenDefinition.js')
    case 'BaseColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/bigScreenDefinition.js')
    case 'SingleColorColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/SingleColorColumn/bigScreenDefinition.js')

    case 'container':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/container/bigScreenDefinition.js')
    case 'picture':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/media/picture/bigScreenDefinition.js')
    case 'BaseMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/bigScreenDefinition.js')
    case 'BaseTable':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/bigScreenDefinition.js')
    case 'Buttons':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/controls/buttons/bigScreenDefinition.js')
    case 'inputs':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/controls/inputs/bigScreenDefinition.js')
    case 'WordCloud':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/rests/WordCloud/bigScreenDefinition.js')
    case 'Heatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/bigScreenDefinition.js')
    case 'StackBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBar/bigScreenDefinition.js')
    case 'RoundBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RoundBar/bigScreenDefinition.js')
    case 'StackColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackColumn/bigScreenDefinition.js')
    case 'GroupColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupColumn/bigScreenDefinition')
    case 'MultiLine':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/MultiLine/bigScreenDefinition')
    case 'RaceLine':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RaceLine/bigScreenDefinition')
    case 'QuarterPie':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/QuarterPie/bigScreenDefinition')
    case 'InteractivePie':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/InteractivePie/bigScreenDefinition')
    case 'BaseDonut':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseDonut/bigScreenDefinition')
    case 'CardDonut':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CardDonut/bigScreenDefinition')
    case 'BaseRose':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRose/bigScreenDefinition')
    case 'StackArea':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackArea/bigScreenDefinition')
    case 'PercentArea':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/PercentArea/bigScreenDefinition')
    case 'BaseYuJue':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseYuJue/bigScreenDefinition')
    case 'StackYuJue':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackYuJue/bigScreenDefinition')
    case 'GroupRadar':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRadar/bigScreenDefinition')
    case 'RegLinePoint':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RegLinePoint/bigScreenDefinition')
    case 'BaseSankey':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseSankey/bigScreenDefinition')
    case 'DragSankey':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DragSankey/bigScreenDefinition')
    case 'ShapeHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/ShapeHeatmap/bigScreenDefinition.js')
    case 'SizeHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/SizeHeatmap/bigScreenDefinition.js')
    case 'PolarHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/PolarHeatmap/bigScreenDefinition.js')
    case 'BaseFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseFunnel/bigScreenDefinition.js')
    case 'CompareFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CompareFunnel/bigScreenDefinition.js')
    case 'FacetedFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/FacetedFunnel/bigScreenDefinition.js')
    case 'BaseLiquid':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLiquid/bigScreenDefinition.js')
    case 'BaseGauge':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGauge/bigScreenDefinition.js')
    case 'BaseProgress':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseProgress/bigScreenDefinition.js')
    case 'BaseBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBullet/bigScreenDefinition.js')
    case 'StackBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBullet/bigScreenDefinition.js')
    case 'GroupBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBullet/bigScreenDefinition.js')
    case 'BaseTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseTreeMap/bigScreenDefinition.js')
    case 'DrillDownTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DrillDownTreeMap/bigScreenDefinition.js')
    case 'NestTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/NestTreeMap/bigScreenDefinition.js')
    case 'BaseWaterfall':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseWaterfall/bigScreenDefinition.js')
    case 'GroupRose':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRose/bigScreenDefinition')
    case 'StackRose':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackRose/bigScreenDefinition')
    case 'GroupYuJue':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupYuJue/bigScreenDefinition')
    case 'RingProgress':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RingProgress/bigScreenDefinition')
    case 'BaseStock':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseStock/bigScreenDefinition')
  }
}

export function getDeclaration (type) {
  return new Promise((resolve, reject) => {
    getDeclarationByType(type)
      .then((configModule) => {
        resolve(configModule.default())
      })
      .catch((error) => {
        reject(error)
      })
  })
}
