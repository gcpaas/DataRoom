// 右侧配置面板
const TextsSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/texts/panel/index.vue')
const BaseLineSetting = () => import(/* webpackChunkName: "BaseLineSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/panel/index.vue')
const BaseBarSetting = () => import(/* webpackChunkName: "BaseBarSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/panel/index.vue')
const GroupBarSetting = () => import(/* webpackChunkName: "BaseBarSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/panel/index.vue')
const ContainerSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/container/panel/index.vue')
const PictureSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/media/picture/panel/index.vue')
const BaseMapSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/panel/index.vue')
const BaseTableSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/panel/index.vue')

// 将组件添加到对象中

export default {
  TextsSetting,
  BaseLineSetting,
  BaseBarSetting,
  GroupBarSetting,
  ContainerSetting,
  PictureSetting,
  BaseMapSetting,
  BaseTableSetting
}
