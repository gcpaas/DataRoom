// 根据组件的type来返回组件的默认的完整的配置信息
function getDeclarationByType (type) {
  switch (type) {
    case 'texts':
      return import(/* webpackChunkName: "textsConfig" */ '@gcpaas/data-room-ui/packages/components/texts/dashBoardDefinition.js')
    case 'BaseLine':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/dashBoardDefinition.js')
    case 'BaseBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/dashBoardDefinition.js')
    case 'GroupBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/dashBoardDefinition.js')
    case 'BaseArea':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseArea/dashBoardDefinition.js')
    case 'BasePie':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePie/dashBoardDefinition.js')
    case 'BaseRadar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRadar/dashBoardDefinition.js')
    case 'BasePoint':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePoint/dashBoardDefinition.js')
    case 'BaseGrid':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGrid/dashBoardDefinition.js')
    case 'BaseColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/dashBoardDefinition.js')
    case 'SingleColorColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/SingleColorColumn/dashBoardDefinition.js')

    case 'container':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/container/dashBoardDefinition.js')
    case 'picture':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/media/picture/dashBoardDefinition.js')
    case 'BaseMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/dashBoardDefinition.js')
    case 'BaseTable':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/dashBoardDefinition.js')
    case 'Buttons':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/controls/buttons/dashBoardDefinition.js')
    case 'inputs':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/controls/inputs/dashBoardDefinition.js')
    case 'WordCloud':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/rests/WordCloud/dashBoardDefinition.js')
    case 'Heatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/dashBoardDefinition.js')
    case 'StackBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBar/dashBoardDefinition.js')
    case 'RoundBar':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RoundBar/dashBoardDefinition.js')
    case 'StackColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackColumn/dashBoardDefinition.js')
    case 'GroupColumn':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupColumn/dashBoardDefinition')
    case 'MultiLine':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/MultiLine/dashBoardDefinition')
    case 'RaceLine':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RaceLine/dashBoardDefinition')
    case 'QuarterPie':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/QuarterPie/dashBoardDefinition')
    case 'InteractivePie':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/InteractivePie/dashBoardDefinition')
    case 'BaseDonut':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseDonut/dashBoardDefinition')
    case 'CardDonut':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CardDonut/dashBoardDefinition')
    case 'BaseRose':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRose/dashBoardDefinition')
    case 'StackArea':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackArea/dashBoardDefinition')
    case 'PercentArea':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/PercentArea/dashBoardDefinition')
    case 'BaseYuJue':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseYuJue/dashBoardDefinition')
    case 'StackYuJue':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackYuJue/dashBoardDefinition')
    case 'GroupRadar':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRadar/dashBoardDefinition')
    case 'RegLinePoint':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RegLinePoint/dashBoardDefinition')
    case 'BaseSankey':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseSankey/dashBoardDefinition')
    case 'DragSankey':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DragSankey/dashBoardDefinition')
    case 'ShapeHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/ShapeHeatmap/dashBoardDefinition')
    case 'SizeHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/SizeHeatmap/dashBoardDefinition')
    case 'PolarHeatmap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/PolarHeatmap/dashBoardDefinition')
    case 'BaseFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseFunnel/dashBoardDefinition')
    case 'CompareFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CompareFunnel/dashBoardDefinition')
    case 'FacetedFunnel':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/FacetedFunnel/dashBoardDefinition')
    case 'BaseLiquid':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLiquid/dashBoardDefinition')
    case 'BaseGauge':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGauge/dashBoardDefinition')
    case 'BaseProgress':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseProgress/dashBoardDefinition')
    case 'BaseBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBullet/dashBoardDefinition')
    case 'StackBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBullet/dashBoardDefinition')
    case 'GroupBullet':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBullet/dashBoardDefinition')
    case 'BaseTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseTreeMap/dashBoardDefinition')
    case 'DrillDownTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DrillDownTreeMap/dashBoardDefinition')
    case 'NestTreeMap':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/NestTreeMap/dashBoardDefinition')
    case 'BaseWaterfall':
      return import(/* webpackChunkName: "BaseBarConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseWaterfall/dashBoardDefinition')
    case 'GroupRose':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRose/dashBoardDefinition')
    case 'StackRose':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackRose/dashBoardDefinition')
    case 'GroupYuJue':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupYuJue/dashBoardDefinition')
    case 'RingProgress':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RingProgress/dashBoardDefinition')
    case 'BaseStock':
      return import(/* webpackChunkName: "BaseLineConfig" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseStock/dashBoardDefinition')
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
