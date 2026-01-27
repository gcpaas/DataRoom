/**
 * 组件插件列表、需要手动导入、否则无法在组件库中显示
 */
import {DrTextPlugin} from '@/dataroom-packages/components/DrText/plugin.ts'
import {DrImagePlugin} from '@/dataroom-packages/components/DrImage/plugin.ts'
import type {ComponentLibTagInterface} from "@/dataroom-packages/PageDesigner/type/ComponentLibTagInterface.ts";
import {ComponentLibTagTypeConst} from "@/dataroom-packages/constant/ComponentLibTagTypeConst.ts";

const componentLibTagList: ComponentLibTagInterface[] = [
  {
    name: '折线图',
    tag: ComponentLibTagTypeConst.LINE
  },
  {
    name: '柱状图',
    tag: ComponentLibTagTypeConst.BAR
  },
  {
    name: '饼图',
    tag: ComponentLibTagTypeConst.PIE
  },
  {
    name: '散点图',
    tag: ComponentLibTagTypeConst.SCATTER
  },
  {
    name: '雷达图',
    tag: ComponentLibTagTypeConst.RADAR
  },
  {
    name: '漏斗图',
    tag: ComponentLibTagTypeConst.FUNNEL
  },
  {
    name: '仪表盘',
    tag: ComponentLibTagTypeConst.GAUGE
  },
  {
    name: '文本',
    tag: ComponentLibTagTypeConst.TEXT
  },
  {
    name: '地图',
    tag: ComponentLibTagTypeConst.MAP
  },
  {
    name: '多媒体',
    tag: ComponentLibTagTypeConst.MEDIA
  },
  {
    name: '表单',
    tag: ComponentLibTagTypeConst.FORM
  }
]
/**
 * 组件列表
 */
const pluginList = [
  new DrTextPlugin([ComponentLibTagTypeConst.TEXT]),
  new DrImagePlugin([ComponentLibTagTypeConst.MEDIA])
]

export { pluginList, componentLibTagList }
