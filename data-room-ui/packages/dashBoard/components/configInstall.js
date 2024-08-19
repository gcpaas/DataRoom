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
