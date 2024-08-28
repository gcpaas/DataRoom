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
const HeatmapSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/Heatmap/panel/index.vue')
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
const RegLinePointSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RegLinePoint/panel/index.vue')
const BaseSankeySetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseSankey/panel/index.vue')
const DragSankeySetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DragSankey/panel/index.vue')
const ShapeHeatmapSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/ShapeHeatmap/panel/index.vue')
const SizeHeatmapSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/SizeHeatmap/panel/index.vue')
const PolarHeatmapSetting = () => import(/* webpackChunkName: "TextsSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/rests/PolarHeatmap/panel/index.vue')
const BaseFunnelSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseFunnel/panel/index.vue')
const CompareFunnelSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/CompareFunnel/panel/index.vue')
const FacetedFunnelSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/FacetedFunnel/panel/index.vue')
const BaseLiquidSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseLiquid/panel/index.vue')
const BaseGaugeSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseGauge/panel/index.vue')
const BaseProgressSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseProgress/panel/index.vue')
const BaseBulletSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBullet/panel/index.vue')
const StackBulletSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackBullet/panel/index.vue')
const GroupBulletSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupBullet/panel/index.vue')
const BaseTreeMapSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseTreeMap/panel/index.vue')
const DrillDownTreeMapSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/DrillDownTreeMap/panel/index.vue')
const NestTreeMapSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/NestTreeMap/panel/index.vue')
const BaseWaterfallSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseWaterfall/panel/index.vue')
const GroupRoseSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupRose/panel/index.vue')
const StackRoseSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/StackRose/panel/index.vue')
const GroupYuJueSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/GroupYuJue/panel/index.vue')
const RingProgressSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/RingProgress/panel/index.vue')
const BaseStockSetting = () => import(/* webpackChunkName: "BasePieSetting" */ '@gcpaas/data-room-ui/packages/components/G2Plots/BaseStock/panel/index.vue')

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
  HeatmapSetting,
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
  GroupRadarSetting,
  RegLinePointSetting,
  BaseSankeySetting,
  DragSankeySetting,
  ShapeHeatmapSetting,
  SizeHeatmapSetting,
  PolarHeatmapSetting,
  BaseFunnelSetting,
  CompareFunnelSetting,
  FacetedFunnelSetting,
  BaseLiquidSetting,
  BaseGaugeSetting,
  BaseProgressSetting,
  BaseBulletSetting,
  StackBulletSetting,
  GroupBulletSetting,
  BaseTreeMapSetting,
  DrillDownTreeMapSetting,
  NestTreeMapSetting,
  BaseWaterfallSetting,
  GroupRoseSetting,
  StackRoseSetting,
  GroupYuJueSetting,
  RingProgressSetting,
  BaseStockSetting
}
