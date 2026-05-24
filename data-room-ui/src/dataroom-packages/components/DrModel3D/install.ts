import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrModel3DPropsInterface {
  /** 模型地址 */
  modelUrl: string
  /** 封面图片 */
  coverImage: string
  /** 是否自动旋转 */
  autoRotate: boolean
  /** 是否允许交互 */
  interactionEnabled: boolean
  /** 材质配置 */
  material: {
    color: string
    roughness: number
    metalness: number
    opacity: number
    transparent: boolean
    wireframe: boolean
  }
  /** 光照配置 */
  lighting: {
    ambient: { enabled: boolean; color: string; intensity: number }
    directional: { enabled: boolean; color: string; intensity: number }
    point: { enabled: boolean; color: string; intensity: number }
  }
  /** 背景配置 */
  background: {
    type: 'color'
    value: string
  }
}

export type DrModel3DConfig = ChartConfig<DrModel3DPropsInterface>

const getInstance = (): DrModel3DConfig => {
  return createChartConfig<DrModel3DPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrModel3D',
    {
      modelUrl: '',
      coverImage: '',
      autoRotate: false,
      interactionEnabled: true,
      material: {
        color: '#4a90e2',
        roughness: 0.5,
        metalness: 0.3,
        opacity: 1.0,
        transparent: false,
        wireframe: false
      },
      lighting: {
        ambient: { enabled: true, color: '#ffffff', intensity: 0.6 },
        directional: { enabled: true, color: '#ffffff', intensity: 0.8 },
        point: { enabled: false, color: '#ff9900', intensity: 1.0 }
      },
      background: {
        type: 'color',
        value: '#1a1a2e'
      }
    },
    {
      title: '3D模型',
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
