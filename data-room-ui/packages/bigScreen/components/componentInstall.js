const Texts = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/texts/index.vue')
const BaseLine = () => import(/* webpackChunkName: "BaseLine" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/index.vue')
const BaseBar = () => import(/* webpackChunkName: "BaseBar" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/index.vue')
const GroupBar = () => import(/* webpackChunkName: "BaseBar" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/index.vue')
const Container = () => import(/* webpackChunkName: "BaseBar" */ '@gcpaas/data-room-ui/packages/components/container/index.vue')
const Picture = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/media/picture/index.vue')
const BaseMap = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/index.vue')
const BaseTable = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/index.vue')
const Buttons = () => import(/* webpackChunkName: "Texts" */ '@gcpaas/data-room-ui/packages/components/controls/buttons/index.vue')

// 将组件添加到对象中
export default {
  Texts,
  BaseLine,
  BaseBar,
  GroupBar,
  Container,
  Picture,
  BaseMap,
  BaseTable,
  Buttons
}
