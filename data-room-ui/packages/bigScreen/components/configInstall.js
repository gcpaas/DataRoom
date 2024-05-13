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
