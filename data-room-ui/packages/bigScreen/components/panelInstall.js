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
const StackBarSetting = () => import(/* webpackChunkName: "BaseBarSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBar/panel/index.vue')
const RoundBarSetting = () => import(/* webpackChunkName: "BaseBarSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RoundBar/panel/index.vue')
const StackColumnSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackColumn/panel/index.vue')
const GroupColumnSetting = () => import(/* webpackChunkName: "BaseColumnSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupColumn/panel/index.vue')
const MultiLineSetting = () => import(/* webpackChunkName: "BaseLineSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/MultiLine/panel/index.vue')
const RaceLineSetting = () => import(/* webpackChunkName: "BaseLineSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RaceLine/panel/index.vue')
const QuarterPieSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/QuarterPie/panel/index.vue')
const InteractivePieSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/InteractivePie/panel/index.vue')
const BaseDonutSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseDonut/panel/index.vue')
const CardDonutSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CardDonut/panel/index.vue')
const BaseRoseSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseRose/panel/index.vue')
const StackAreaSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackArea/panel/index.vue')
const PercentAreaSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/PercentArea/panel/index.vue')
const BaseYuJueSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseYuJue/panel/index.vue')
const StackYuJueSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackYuJue/panel/index.vue')
const GroupRadarSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRadar/panel/index.vue')
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
  InputsSetting,
  StackBarSetting,
  RoundBarSetting,
  StackColumnSetting,
  GroupColumnSetting,
  MultiLineSetting,
  RaceLineSetting,
  QuarterPieSetting,
  InteractivePieSetting,
  BaseDonutSetting,
  CardDonutSetting,
  BaseRoseSetting,
  StackAreaSetting,
  PercentAreaSetting,
  BaseYuJueSetting,
  StackYuJueSetting,
  GroupRadarSetting
}
