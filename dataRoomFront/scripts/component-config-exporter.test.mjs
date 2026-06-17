import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  exportComponentConfigs,
  flattenConfigFields,
  parseLiteralOptions,
  resolveFieldType
} from './component-config-exporter.mjs'

const rootDir = await mkdtemp(path.join(tmpdir(), 'dataroom-component-export-'))

try {
  assert.deepEqual(parseLiteralOptions("'left' | 'center' | 'right'"), ['left', 'center', 'right'])
  assert.deepEqual(parseLiteralOptions('"top" | "bottom"'), ['top', 'bottom'])
  assert.deepEqual(parseLiteralOptions("'item'"), ['item'])
  assert.deepEqual(parseLiteralOptions("|\n  'normal'\n  | 'bold'\n  | 'bolder'"), ['normal', 'bold', 'bolder'])
  assert.deepEqual(parseLiteralOptions("false | 'single' | 'multiple'"), [false, 'single', 'multiple'])
  assert.deepEqual(parseLiteralOptions("'normal' | 'bold' | 300 | 500 | 800"), ['normal', 'bold', 300, 500, 800])
  assert.equal(resolveFieldType('string').type, 'string')
  assert.equal(resolveFieldType('number | null').type, 'number')
  assert.equal(resolveFieldType('boolean').type, 'boolean')
  assert.equal(resolveFieldType('[number, number, number, number]').type, 'array')
  assert.equal(resolveFieldType("Array<'red' | 'blue'>").type, 'array')
  assert.deepEqual(resolveFieldType("'axis' | 'item'"), { type: 'enum', options: ['axis', 'item'] })
  assert.deepEqual(resolveFieldType("false | 'single' | 'multiple'"), { type: 'enum', options: [false, 'single', 'multiple'] })

  const fields = flattenConfigFields({
    properties: [
      { name: 'text', typeText: 'string', description: '文本内容' },
      { name: 'align', typeText: "'left' | 'center' | 'right'", description: '对齐方式' },
      {
        name: 'textStyle',
        description: '文本样式',
        properties: [
          { name: 'fontSize', typeText: 'number', description: '字体大小(px)' }
        ]
      },
      {
        name: 'padding',
        typeText: '[number, number, number, number]',
        description: '内边距'
      }
    ]
  }, {
    text: '文本占位符',
    align: 'left',
    textStyle: { fontSize: 14 },
    padding: [1, 2, 3, 4]
  })

  assert.deepEqual(fields, [
    { field: 'text', type: 'string', description: '文本内容', defaultValue: '文本占位符' },
    { field: 'align', type: 'enum', options: ['left', 'center', 'right'], description: '对齐方式', defaultValue: 'left' },
    { field: 'textStyle.fontSize', type: 'number', description: '字体大小(px)', defaultValue: 14 },
    { field: 'padding', type: 'array', description: '内边距', defaultValue: [1, 2, 3, 4] }
  ])

  const projectDir = path.join(rootDir, 'project')
  const componentsDir = path.join(projectDir, 'src/dataRoom/components')
  const registerDir = path.join(projectDir, 'src/dataRoom/_components')
  const typeDir = path.join(projectDir, 'src/dataRoom/components/type')
  const pageTypeDir = path.join(projectDir, 'src/dataRoom/PageDesigner/type')
  const visualScreenDir = path.join(projectDir, 'src/dataRoom/VisualScreenDesigner')
  const outputDir = path.join(rootDir, 'output')
  await mkdir(path.join(componentsDir, 'DrText'), { recursive: true })
  await mkdir(registerDir, { recursive: true })
  await mkdir(typeDir, { recursive: true })
  await mkdir(pageTypeDir, { recursive: true })
  await mkdir(visualScreenDir, { recursive: true })
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'RemovedComponent.config.json'), '{}', 'utf8')
  await writeFile(path.join(outputDir, 'notes.txt'), '保留非生成文件', 'utf8')

  await writeFile(path.join(registerDir, 'PluginRegister.ts'), `
import {DrTextPlugin} from '@/dataRoom/components/DrText/plugin.ts'
const pluginList = [
  new DrTextPlugin(['TEXT'])
]
export { pluginList }
`, 'utf8')

  await writeFile(path.join(typeDir, 'ChartConfig.ts'), `
export interface ChartConfig<T> {
  // 唯一标识
  id: string
  // 唯一标识，仅仪表盘类型使用
  i: string
  // 组件类型
  type: string
  // 组件显示的图层名称 或 卡片名称
  title: string
  // 宽度或占用的份数
  w: number
  // 高度或占用的份数
  h: number
  // x坐标或x轴份数
  x: number
  // y坐标或y轴份数
  y: number
  // 组件层级、层级越大、越靠前显示
  z: number
  // X轴旋转角度
  rotateX: number
  // Y轴旋转角度
  rotateY: number
  // Z轴旋转角度
  rotateZ: number
  // 图表组件个性化配置
  props: T
  // 是否隐藏组件，true 时设计器与预览不渲染
  hide?: boolean
  // 图表交互
  behaviors?: {
    [behaviorName: string]: {
      disabled: boolean
      actions: unknown[]
    }
  }
  // 数据集与字段绑定
  dataset: {
    // 数据集编码
    code: string
    // 字段绑定
    fields: {
      [key: string]: string[]
    }
    // 数据处理脚本
    script: string
    // 数据集入参、如果数据集需要入参的话
    params: {
      [key: string]: unknown
    }
  }
}
`, 'utf8')

  await writeFile(path.join(pageTypeDir, 'PageConfig.ts'), `
import type { PageBasicConfig } from './PageBasicConfig.ts'
import type { GlobalVariable } from './GlobalVariable.ts'
import type { ChartConfig } from '../../components/type/ChartConfig.ts'
export interface PageConfig {
  // 页面类型
  pageType: string
  // 页面基础配置
  basicConfig: PageBasicConfig
  // 全局变量
  globalVariableList: GlobalVariable[]
  // 图表组件配置
  chartList: ChartConfig<unknown>[]
}
`, 'utf8')

  await writeFile(path.join(pageTypeDir, 'PageBasicConfig.ts'), `
import type { PageTimer } from './PageTimer.ts'
export interface PageBasicConfig {
  // 页面背景设置
  background: {
    // 背景填充方式
    fill: string | 'image' | 'color'
    // 背景色
    color: string
    // 背景图url
    url: string
    // 背景图透明度
    opacity: number
    // 背景图填充方式
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  }
  // 定时器配置列表
  timers?: PageTimer[]
}
`, 'utf8')

  await writeFile(path.join(pageTypeDir, 'VisualScreenPageConfig.ts'), `
import type { VisualScreenPageBasicConfig } from './VisualScreenPageBasicConfig.ts'
import type { GlobalVariable } from './GlobalVariable.ts'
import type { ChartConfig } from '../../components/type/ChartConfig.ts'
export interface VisualScreenPageConfig {
  // 页面类型
  pageType: string
  // 页面基础配置
  basicConfig: VisualScreenPageBasicConfig
  // 全局变量
  globalVariableList: GlobalVariable[]
  // 图表组件配置
  chartList: ChartConfig<unknown>[]
}
`, 'utf8')

  await writeFile(path.join(pageTypeDir, 'VisualScreenPageBasicConfig.ts'), `
import type { PageTimer } from './PageTimer.ts'
import type { VisualScreenRulerConfig } from '../../VisualScreenDesigner/ruler'
export interface VisualScreenPageBasicConfig {
  // 页面背景设置
  background: {
    // 背景填充方式
    fill: string | 'image' | 'color'
    // 背景色
    color: string
    // 背景图url
    url: string
    // 背景图透明度
    opacity: number
    // 背景图填充方式
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  }
  // 大屏尺寸
  size: {
    // 宽度、单位：像素
    width: number
    // 高度，单位：像素
    height: number
    // 缩放方式
    zoom: 'fitWidth' | 'fitHeight' | 'cover' | 'contain' | 'none'
  }
  // 设计器编辑态缩放偏好
  zoom?: {
    mode: 'best' | 'fixed'
    value: number
    visiable?: boolean
  }
  // 设计器编辑态标尺与参考线配置
  ruler?: VisualScreenRulerConfig
  // 定时器配置列表
  timers?: PageTimer[]
}
`, 'utf8')

  await writeFile(path.join(pageTypeDir, 'GlobalVariable.ts'), `
export interface GlobalVariable {
  id: string
}
`, 'utf8')

  await writeFile(path.join(pageTypeDir, 'PageTimer.ts'), `
export interface PageTimer {
  id: string
}
`, 'utf8')

  await writeFile(path.join(visualScreenDir, 'ruler.ts'), `
export interface VisualScreenRulerConfig {
  visible: boolean
  guidesVisible: boolean
  guidesLocked: boolean
  verticalGuides: unknown[]
  horizontalGuides: unknown[]
}
`, 'utf8')

  await writeFile(path.join(componentsDir, 'DrText/plugin.ts'), `
import thumbnail from './images/text.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts";
export class DrTextPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrText', '文本', '文字、文本、数字', thumbnail, tags)
  }
}
`, 'utf8')

  await writeFile(path.join(componentsDir, 'DrText/install.ts'), `
import {createChartConfig} from '../type/define'
import type { ValueFormat } from '@/dataRoom/components/_shared/metric-table-utils.ts'
type TextAlign =
  | 'left'
  | 'center'
  | 'right'
type TooltipTrigger = 'item'
interface DrTextPropsInterface {
  /** 文本内容 */
  text: string
  /** 对齐方式 */
  align: TextAlign
  /** 触发方式 */
  trigger: TooltipTrigger
  /** 格式化方式 */
  format: ValueFormat
  /** 选中模式 */
  selectedMode: false | 'single' | 'multiple'
  /** 文本样式 */
  textStyle: {
    /** 字体大小(px) */
    fontSize: number
  }
}
const getInstance = () => {
  return createChartConfig<DrTextPropsInterface>('DrText', {
    text: '文本占位符',
    align: 'left',
    trigger: 'item',
    format: 'thousand',
    selectedMode: false,
    textStyle: { fontSize: 14 }
  }, { title: '文本' })
}
export {getInstance}
`, 'utf8')

  await mkdir(path.join(projectDir, 'src/dataRoom/components/_shared'), { recursive: true })
  await writeFile(path.join(projectDir, 'src/dataRoom/components/_shared/metric-table-utils.ts'), `
export type ValueFormat =
  | 'text'
  | 'value'
  | 'thousand'
`, 'utf8')

  const result = await exportComponentConfigs({
    projectRoot: projectDir,
    outputDir
  })

  assert.equal(result.components.length, 1)
  assert.equal(result.components[0].componentName, 'DrText')
  assert.equal(result.components[0].displayName, '文本')
  assert.equal(result.pageConfigs.length, 2)

  const detailFields = result.details[0].fields
  const fieldByPath = new Map(detailFields.map((field) => [field.field, field]))
  assert.equal(fieldByPath.get('type').defaultValue, 'DrText')
  assert.equal(fieldByPath.get('title').description, '组件显示的图层名称 或 卡片名称')
  assert.equal(fieldByPath.get('title').defaultValue, '文本')
  assert.equal(fieldByPath.get('w').defaultValue, 150)
  assert.equal(fieldByPath.get('behaviors').type, 'object')
  assert.deepEqual(fieldByPath.get('behaviors').defaultValue, {})
  assert.equal(fieldByPath.get('dataset.code').defaultValue, '')
  assert.equal(fieldByPath.get('dataset.fields').type, 'object')
  assert.deepEqual(fieldByPath.get('dataset.fields').defaultValue, {})
  assert.equal(fieldByPath.get('dataset.params').type, 'object')
  assert.equal(fieldByPath.get('props.text').defaultValue, '文本占位符')
  assert.deepEqual(fieldByPath.get('props.align').options, ['left', 'center', 'right'])
  assert.deepEqual(fieldByPath.get('props.trigger').options, ['item'])
  assert.deepEqual(fieldByPath.get('props.format').options, ['text', 'value', 'thousand'])
  assert.deepEqual(fieldByPath.get('props.selectedMode').options, [false, 'single', 'multiple'])
  assert.equal(fieldByPath.get('props.textStyle.fontSize').description, '字体大小(px)')
  assert.equal(fieldByPath.has('text'), false)

  const pageConfig = result.pageConfigs.find((config) => config.componentName === 'PageConfig')
  const pageFieldByPath = new Map(pageConfig.fields.map((field) => [field.field, field]))
  assert.equal(pageFieldByPath.get('pageType').defaultValue, 'page')
  assert.equal(pageFieldByPath.get('basicConfig.background.fill').defaultValue, 'color')
  assert.equal(pageFieldByPath.get('basicConfig.background.repeat').options.includes('repeat-x'), true)
  assert.deepEqual(pageFieldByPath.get('globalVariableList').defaultValue, [])
  assert.equal(pageFieldByPath.get('chartList').type, 'array')
  assert.equal(pageFieldByPath.get('chartList').description.includes('getComponentConfig(componentName)'), true)

  const visualScreenConfig = result.pageConfigs.find((config) => config.componentName === 'VisualScreenPageConfig')
  const visualFieldByPath = new Map(visualScreenConfig.fields.map((field) => [field.field, field]))
  assert.equal(visualFieldByPath.get('pageType').defaultValue, 'visualScreen')
  assert.equal(visualFieldByPath.get('basicConfig.background.color').defaultValue, '#0d1e42')
  assert.equal(visualFieldByPath.get('basicConfig.background.opacity').defaultValue, 100)
  assert.equal(visualFieldByPath.get('basicConfig.size.width').defaultValue, 1920)
  assert.equal(visualFieldByPath.get('basicConfig.size.zoom').options.includes('contain'), true)
  assert.equal(visualFieldByPath.get('basicConfig.zoom.mode').defaultValue, 'best')
  assert.equal(visualFieldByPath.get('basicConfig.ruler.visible').defaultValue, true)
  assert.deepEqual(visualFieldByPath.get('basicConfig.ruler.verticalGuides').defaultValue, [])

  const outputFiles = await readdir(outputDir)
  assert.equal(outputFiles.includes('RemovedComponent.config.json'), false)
  assert.equal(outputFiles.includes('notes.txt'), true)
  assert.equal(outputFiles.includes('PageConfig.config.json'), true)
  assert.equal(outputFiles.includes('VisualScreenPageConfig.config.json'), true)
} finally {
  await rm(rootDir, { recursive: true, force: true })
}
