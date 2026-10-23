import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts";
import type {MaterialConfig, LightingConfig, BackgroundConfig, ModelTransformConfig} from "@/dataRoom/three/modelConfig.ts";
import {parseModelAppearanceConfig} from "@/dataRoom/three/modelConfig.ts";

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrModel3DPropsInterface extends ModelTransformConfig {
  /** 模型地址 */
  modelUrl: string
  /** 模型格式: glb | gltf | obj | stl，留空时按模型地址后缀推断 */
  modelFormat: string
  /** 封面图片 */
  coverImage: string
  /** 是否自动旋转 */
  autoRotate: boolean
  /** 是否允许交互 */
  interactionEnabled: boolean
  /** 材质配置 */
  material: MaterialConfig
  /** 光照配置 */
  lighting: LightingConfig
  /** 背景配置 */
  background: BackgroundConfig
}

export type DrModel3DConfig = ChartConfig<DrModel3DPropsInterface>

const getInstance = (): DrModel3DConfig => {
  const appearance = parseModelAppearanceConfig(null)
  return createChartConfig<DrModel3DPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrModel3D',
    {
      modelScale: appearance.modelScale,
      modelPosition: appearance.modelPosition,
      modelUrl: '',
      modelFormat: '',
      coverImage: '',
      autoRotate: false,
      interactionEnabled: true,
      material: appearance.material,
      lighting: appearance.lighting,
      background: appearance.background,
    },
    {
      title: '3D模型',
      w: 320,
      h: 240,
    }
  )
}

const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '鼠标点击模型时触发',
    method: 'click',
    paramsList: []
  }
]

const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
