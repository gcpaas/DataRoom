import {type Component} from 'vue'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";

type ComponentMap = {
  [key: string]: Component
}

type PanelComponentMap = {
  [key: string]: Component
}

type ComponentInstanceMap = {
  [key: string]: () => ChartConfig<unknown>
}

type BehaviorMap = {
  [key: string]: Behavior[]
}

type datasetFieldMap = {
  [key: string]: ChartDatasetField[]
}


// 使用 Vite 的 import.meta.glob 自动导入所有组件目录下的 install.ts
const installModules = import.meta.glob<{
  [key: string]: Component | (() => ChartConfig<unknown>)
}>('./**/install.ts', {eager: true})

// 存储组件、控制面板组件、实例方法和交互定义
const components: ComponentMap = {}
const panelComponents: PanelComponentMap = {}
const componentInstances: ComponentInstanceMap = {}
const behaviors: BehaviorMap = {}
const datasetFields: datasetFieldMap = {}

// 组件自动注册
Object.entries(installModules).forEach(([path, module]) => {
  // 从路径中提取组件名称，例如：./DrText/install.ts -> DrText
  const match = path.match(/\.\/([^/]+)\/install\.ts$/)
  if (!match) return
  const componentName = match[1]
  if (!componentName) {
    console.error('组件路径%s未能够解析出组件名', path)
    return
  }
  // 注册主组件
  if (module['component']) {
    components[componentName] = module['component'] as Component
  }
  // 注册控制面板组件
  if (module['controlPanel']) {
    panelComponents[componentName] = module['controlPanel'] as Component
  }
  // 注册实例方法
  const instanceMethodName = `getInstance`
  if (module[instanceMethodName]) {
    componentInstances[componentName] = module[instanceMethodName] as () => ChartConfig<unknown>
  }

  // 注册交互定义
  const behaviorDefineName = `behaviors`
  if (module[behaviorDefineName]) {
    behaviors[componentName] = module[behaviorDefineName] as Behavior[]
  }

  // 注册图表数据集字段定义
  const datasetFieldDefineName = `datasetFields`
  if (module[datasetFieldDefineName]) {
    datasetFields[componentName] = module[datasetFieldDefineName] as ChartDatasetField[]
  }
})

const getPanelComponent = (name: string | undefined) => {
  console.log("获取配置面板", name, panelComponents)
  if (name) {
    return panelComponents[name]
  }
  return null
}

const getComponent = (name: string) => {
  return components[name]
}

const getComponentInstance = (name: string): ChartConfig<unknown> => {
  const instanceFn = componentInstances[name]!
  if (instanceFn) {
    return instanceFn()
  }
  console.error(`未找到组件 ${name} 对应的实例化方法`)
  return {} as ChartConfig<unknown>
}


const getComponentBehaviors = (name: string): Behavior[] => {
  const behavior = behaviors[name]
  return behavior || [] as Behavior[]
}


const getComponentDatasetFields = (name: string): ChartDatasetField[] => {
  const fields = datasetFields[name]
  return fields || [] as ChartDatasetField[]
}

export {
  components,
  panelComponents,
  componentInstances,
  getComponentBehaviors,
  getComponent,
  getPanelComponent,
  getComponentInstance,
  getComponentDatasetFields
}
