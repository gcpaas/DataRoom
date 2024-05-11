const Texts = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/texts/index.vue')
const BaseLine = () => import(/* webpackChunkName: "BaseLine" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/index.vue')
const BaseBar = () => import(/* webpackChunkName: "BaseBar" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/index.vue')
const GroupBar = () => import(/* webpackChunkName: "GroupBar" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/index.vue')
const BaseColumn = () => import(/* webpackChunkName: "BaseColumn" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/index.vue')
const BaseArea = () => import(/* webpackChunkName: "BaseArea" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseArea/index.vue')
const BasePie = () => import(/* webpackChunkName: "BasePie" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePie/index.vue')
const BasePoint = () => import(/* webpackChunkName: "BasePoint" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePoint/index.vue')
const BaseRadar = () => import(/* webpackChunkName: "BaseRadar" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRadar/index.vue')
const BaseGrid = () => import(/* webpackChunkName: "BaseRadar" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGrid/index.vue')
const Container = () => import(/* webpackChunkName: "BaseBar" */ '@gcpaas/data-room-ui/packages/components/container/index.vue')
const Picture = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/media/picture/index.vue')
const BaseMap = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/index.vue')
const BaseTable = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/index.vue')
const Buttons = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/controls/buttons/index.vue')
const Inputs = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/controls/inputs/index.vue')
const WordCloud = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/rests/WordCloud/index.vue')
const Heatmap = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/index.vue')

// 将组件添加到对象中
export default {
  Texts,
  BaseLine,
  BaseBar,
  BaseColumn,
  BasePie,
  GroupBar,
  BaseArea,
  BasePoint,
  BaseRadar,
  BaseGrid,
  Container,
  Picture,
  BaseMap,
  BaseTable,
  Buttons,
  Inputs,
  WordCloud,
  Heatmap
}
