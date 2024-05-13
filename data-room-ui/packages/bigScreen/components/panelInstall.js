// 右侧配置面板
const TextsSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/texts/panel/index.vue')
const BaseLineSetting = () => import(/* webpackChunkName: "BaseLineSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLine/panel/index.vue')
const BaseBarSetting = () => import(/* webpackChunkName: "BaseBarSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/panel/index.vue')
const BaseColumnSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseColumn/panel/index.vue')
const BaseAreaSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseArea/panel/index.vue')
const BasePieSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePie/panel/index.vue')
const BasePointSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BasePoint/panel/index.vue')
const BaseRadarSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRadar/panel/index.vue')
const BaseGridSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGrid/panel/index.vue')
const GroupBarSetting = () => import(/* webpackChunkName: "BaseBarSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBar/panel/index.vue')
const ContainerSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/container/panel/index.vue')
const PictureSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/media/picture/panel/index.vue')
const BaseMapSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/map/BaseMap/panel/index.vue')
const BaseTableSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/tables/BaseTable/panel/index.vue')

const WordCloudSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/rests/WordCloud/panel/index.vue')
const ButtonsSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/controls/buttons/panel/index.vue')
const HeatmapDescSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/panel/index.vue')
const InputsSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/controls/inputs/panel/index.vue')
// 将组件添加到对象中

export default {
  TextsSetting,
  BaseLineSetting,
  BaseBarSetting,
  GroupBarSetting,
  BaseGridSetting,
  ContainerSetting,
  BaseColumnSetting,
  BaseAreaSetting,
  BasePieSetting,
  BasePointSetting,
  BaseRadarSetting,
  PictureSetting,
  BaseMapSetting,
  BaseTableSetting,
  WordCloudSetting,
  HeatmapDescSetting,
  ButtonsSetting,
  InputsSetting
}
