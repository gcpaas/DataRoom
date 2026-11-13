import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  exportComponentConfigs,
  flattenConfigFields,
  parseLiteralOptions,
  resolveFieldType
} from './component-config-exporter.mjs'

function assertAllowedKeys(value, allowed) {
  assert.deepEqual(Object.keys(value).filter((key) => !allowed.includes(key)), [])
}

async function assertOutputSchema(outputDir) {
  const index = JSON.parse(await readFile(path.join(outputDir, 'index.json'), 'utf8'))
  for (const summary of index) assertAllowedKeys(summary, ['componentName', 'displayName', 'description'])
  for (const file of (await readdir(outputDir)).filter((file) => file.endsWith('.config.json'))) {
    const detail = JSON.parse(await readFile(path.join(outputDir, file), 'utf8'))
    assertAllowedKeys(detail, ['componentName', 'displayName', 'description', 'fields', 'datasetFields'])
    for (const field of detail.fields) {
      assertAllowedKeys(field, ['field', 'type', 'options', 'description', 'defaultValue'])
    }
    for (const field of detail.datasetFields ?? []) {
      assertAllowedKeys(field, ['name', 'desc', 'required', 'multiple'])
    }
    // options/defaultValue 为 Java Object 值，不将业务对象内部键误判为 schema 字段。
  }
}

function assertDimensions(detail, page, visualScreen) {
  for (const [index, dimension] of ['w', 'h'].entries()) {
    const field = detail.fields.find((field) => field.field === dimension)
    assert.equal(field.defaultValue, visualScreen[index])
    assert.ok(field.description.includes(`page=${page[index]}（网格份数），visualScreen=${visualScreen[index]}（像素）`))
  }
}

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
  const registerDir = path.join(projectDir, 'src/dataRoom/designer/registry')
  const typeDir = path.join(projectDir, 'src/dataRoom/components/type')
  const datasetDir = path.join(projectDir, 'src/dataRoom/dataset')
  const pageTypeDir = path.join(projectDir, 'src/dataRoom/page-designer/type')
  const visualScreenDir = path.join(projectDir, 'src/dataRoom/visual-screen-designer')
  const outputDir = path.join(rootDir, 'output')
  await mkdir(path.join(componentsDir, 'DrText'), { recursive: true })
  await mkdir(registerDir, { recursive: true })
  await mkdir(typeDir, { recursive: true })
  await mkdir(datasetDir, { recursive: true })
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

  await mkdir(path.join(projectDir, 'src/dataRoom/constants'), { recursive: true })
  await writeFile(path.join(projectDir, 'src/dataRoom/constants/PageType.ts'), `
export const PageType = { PAGE: 'page', VISUAL_SCREEN: 'visualScreen' } as const
export type PageType = typeof PageType[keyof typeof PageType]
`)
  await writeFile(path.join(typeDir, 'define.ts'), `
import {v4} from 'uuid'
import {PageType} from '@/dataRoom/constants/PageType.ts'
export function createChartConfig(type, props, overrides, pageType: PageType, pageSize = {w: 16, h: 5}) {
  if (pageType !== PageType.PAGE && pageType !== PageType.VISUAL_SCREEN) throw new Error('缺少有效 pageType')
  const id = v4()
  const config = {
    id, i: id, type, props, title: '未命名组件', w: 150, h: 100, x: 100, y: 100, z: 100,
    rotateX: 0, rotateY: 0, rotateZ: 0, behaviors: {},
    dataset: {code: '', datasetType: '', fields: {}, script: '', params: {}},
    ...overrides
  }
  if (pageType === PageType.PAGE) Object.assign(config, pageSize)
  return config
}
`)

  await writeFile(path.join(typeDir, 'ChartConfig.ts'), `
import type { DatasetType } from '@/dataRoom/dataset/api.ts'
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
    // 数据集类型，历史配置可为空
    datasetType?: DatasetType
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

  await writeFile(path.join(datasetDir, 'api.ts'), `
export type DatasetType = '' | 'directory' | 'json' | 'http' | 'sql' | 'excel' | 'es' | 'websocket' | 'mqtt'
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
import type { VisualScreenRulerConfig } from '../../visual-screen-designer/ruler'
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
  // 设计器编辑态是否允许 iframe 内部交互
  iframeInteractionEnabled?: boolean
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
import type {PageType} from '@/dataRoom/constants/PageType.ts'
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
const getInstance = (pageType: PageType) => {
  return createChartConfig<DrTextPropsInterface>('DrText', {
    text: '文本占位符',
    align: 'left',
    trigger: 'item',
    format: 'thousand',
    selectedMode: false,
    textStyle: { fontSize: 14 }
  }, { title: '文本' }, pageType)
}
const datasetFields = []
export {getInstance}
`, 'utf8')

  await mkdir(path.join(projectDir, 'src/dataRoom/components/_shared'), { recursive: true })
  await writeFile(path.join(projectDir, 'src/dataRoom/components/_shared/metric-table-utils.ts'), `
export type ValueFormat =
  | 'text'
  | 'value'
  | 'thousand'
`, 'utf8')

  let result
  let exportError
  try {
    result = await exportComponentConfigs({
      projectRoot: projectDir,
      outputDir
    })
  } catch (error) {
    exportError = error
  }

  assert.equal(exportError, undefined)

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
  assert.equal(fieldByPath.get('dataset.datasetType').type, 'enum')
  assert.deepEqual(fieldByPath.get('dataset.datasetType').options, ['', 'directory', 'json', 'http', 'sql', 'excel', 'es', 'websocket', 'mqtt'])
  assert.equal(fieldByPath.get('dataset.datasetType').defaultValue, '')
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
  assert.equal(visualFieldByPath.get('basicConfig.iframeInteractionEnabled').defaultValue, false)

  const outputFiles = await readdir(outputDir)
  assert.equal(outputFiles.includes('RemovedComponent.config.json'), false)
  assert.equal(outputFiles.includes('notes.txt'), true)
  assert.equal(outputFiles.includes('PageConfig.config.json'), true)
  assert.equal(outputFiles.includes('VisualScreenPageConfig.config.json'), true)
  assertDimensions(result.details[0], [16, 5], [150, 100])
  await assertOutputSchema(outputDir)
  assert.equal(fieldByPath.has('id') && Object.hasOwn(fieldByPath.get('id'), 'defaultValue'), false)

  const presetDir = path.join(componentsDir, 'DrMetricCard/presets/Horizontal')
  await mkdir(presetDir, {recursive: true})
  await writeFile(path.join(componentsDir, 'DrMetricCard/plugin.ts'), `
export class DrMetricCardPlugin extends ChartPlugin { constructor(tags) { super('DrMetricCard', '指标卡', '指标数值', '', tags) } }
`)
  const parentInstall = `
import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {PageType} from '@/dataRoom/constants/PageType.ts'
const component = defineAsyncComponent(() => import('./不存在的视图.vue'))
export interface DrMetricCardPropsInterface {
  layout: {direction: 'vertical' | 'horizontal'; gap: number}
  value: {defaultValue: number}
}
const defaults = {layout: {direction: 'vertical', gap: 8}, value: {defaultValue: 1280}}
export const getInstance = (pageType: PageType) => createChartConfig('DrMetricCard',
  JSON.parse(JSON.stringify(defaults)), {title: '指标卡', w: 280, h: 140, x: 0, y: 0, z: 0}, pageType, {w: 4, h: 5})
const datasetFields = [{name: 'valueField', desc: '指标数值字段', required: true, multiple: false}]
`
  await writeFile(path.join(componentsDir, 'DrMetricCard/install.ts'), parentInstall)
  const presetInstall = `
import {getInstance as superGetInstance} from '../../install'
import {PageType} from '@/dataRoom/constants/PageType.ts'
export const getInstance = (pageType: PageType) => {
  const chart = superGetInstance(pageType)
  chart.title = '横向指标卡'
  chart.props.layout.direction = 'horizontal'
  Object.assign(chart, pageType === PageType.PAGE ? {w: 8, h: 3} : {w: 420, h: 100})
  return chart
}
`
  const presetPlugin = `
import thumbnail from './thumbnail.svg'
import type {ChartPreset} from '@/dataRoom/components/type/ChartPreset.ts'
import {getInstance} from './install'
export default {
  id: 'DrMetricCardHorizontal', componentType: 'DrMetricCard', name: '横向指标卡',
  desc: '横向显示指标', thumbnail, tags: ['METRIC'], getInstance
} satisfies ChartPreset
`
  await writeFile(path.join(presetDir, 'install.ts'), presetInstall)
  await writeFile(path.join(presetDir, 'plugin.ts'), presetPlugin)
  await writeFile(path.join(presetDir, 'thumbnail.svg'), '<svg/>')
  const registry = `
import {DrTextPlugin} from '@/dataRoom/components/DrText/plugin.ts'
import {DrMetricCardPlugin} from '@/dataRoom/components/DrMetricCard/plugin.ts'
import horizontalMetricCardPreset from '@/dataRoom/components/DrMetricCard/presets/Horizontal/plugin.ts'
// new DrUnregisteredPlugin([]) 不得被当作注册组件
const unused = () => new DrAlsoUnregisteredPlugin([])
const pluginList = [new DrTextPlugin([]), new DrMetricCardPlugin([])]
const presetList = [horizontalMetricCardPreset] satisfies ChartPreset[]
`
  await writeFile(path.join(registerDir, 'PluginRegister.ts'), registry)
  const exportFixture = async () => {
    const result = await exportComponentConfigs({projectRoot: projectDir, outputDir})
    await assertOutputSchema(outputDir)
    return result
  }
  result = await exportFixture()
  const metric = result.details.find((item) => item.componentName === 'DrMetricCard')
  const horizontal = result.details.find((item) => item.componentName === 'DrMetricCardHorizontal')
  const getField = (detail, field) => detail.fields.find((item) => item.field === field)
  assert.equal(result.components.length, 3)
  assert.match(getField(horizontal, 'type').description, /ChartConfig.type 必须为 DrMetricCard，不可使用预设 id/)
  assert.equal(getField(horizontal, 'type').defaultValue, 'DrMetricCard')
  assert.equal(getField(horizontal, 'title').defaultValue, '横向指标卡')
  assert.equal(getField(horizontal, 'props.layout.direction').defaultValue, 'horizontal')
  assert.equal(getField(metric, 'props.layout.direction').defaultValue, 'vertical')
  assert.deepEqual(getField(horizontal, 'props.value.defaultValue'), getField(metric, 'props.value.defaultValue'))
  assert.deepEqual(horizontal.fields.map((item) => item.field), metric.fields.map((item) => item.field))
  assert.deepEqual(horizontal.datasetFields, metric.datasetFields)
  assertDimensions(metric, [4, 5], [280, 140])
  assertDimensions(horizontal, [8, 3], [420, 100])
  assert.match(horizontal.description, /fields.defaultValue 默认对应 visualScreen/)
  assert.match(horizontal.description, /两种页面的默认值差异见字段 description/)
  assert.match(horizontal.description, /ChartConfig.type 必须为 DrMetricCard/)
  assert.match(getField(horizontal, 'h').description, /网格份数.*像素/)
  const index = JSON.parse(await readFile(path.join(outputDir, 'index.json'), 'utf8'))
  assert.deepEqual(index, result.components)
  for (const summary of index) assert.deepEqual(Object.keys(summary), ['componentName', 'displayName', 'description'])
  assert.deepEqual(JSON.parse(await readFile(path.join(outputDir, 'DrMetricCardHorizontal.config.json'), 'utf8')), horizontal)
  assert.deepEqual((await exportFixture()).details, result.details)
  await writeFile(path.join(componentsDir, 'DrMetricCard/install.ts'), parentInstall.replace('defaultValue: 1280', 'defaultValue: 2560').replace('{w: 4, h: 5}', '{w: 6, h: 7}'))
  const changed = await exportFixture()
  assert.equal(getField(changed.details.at(-1), 'props.value.defaultValue').defaultValue, 2560)
  assertDimensions(changed.details[1], [6, 7], [280, 140])
  assertDimensions(changed.details.at(-1), [8, 3], [420, 100])
  await writeFile(path.join(componentsDir, 'DrMetricCard/install.ts'), parentInstall)

  // 另一预设直接复用不同父组件，证明实现不依赖横向卡片的特定赋值方式。
  const secondPlugin = `
import {getInstance as parent} from '@/dataRoom/components/DrText/install'
export default {
  id: 'DrTextLarge', componentType: 'DrText', name: '大号文本', desc: '按页面调整文本', tags: [],
  getInstance(pageType) {
    const chart = parent(pageType)
    chart.props.textStyle.fontSize = pageType === 'page' ? 20 : 40
    return {...chart, w: pageType === 'page' ? 10 : 600}
  }
}
`
  await writeFile(path.join(presetDir, 'second.ts'), secondPlugin)
  await writeFile(path.join(registerDir, 'PluginRegister.ts'), registry.replace(
    'const presetList = [horizontalMetricCardPreset]',
    "import second from '@/dataRoom/components/DrMetricCard/presets/Horizontal/second.ts'\nconst presetList = [horizontalMetricCardPreset, second]"
  ))
  result = await exportFixture()
  const second = result.details.at(-1)
  assert.equal(second.componentName, 'DrTextLarge')
  assert.equal(getField(second, 'type').defaultValue, 'DrText')
  assert.equal(getField(second, 'props.textStyle.fontSize').defaultValue, 40)
  assert.match(getField(second, 'props.textStyle.fontSize').description, /page=20，visualScreen=40/)
  assertDimensions(second, [10, 5], [600, 100])

  await writeFile(path.join(registerDir, 'PluginRegister.ts'), registry)
  const savedIndex = await readFile(path.join(outputDir, 'index.json'), 'utf8')
  for (const [plugin, error] of [
    [presetPlugin.replace("id: 'DrMetricCardHorizontal'", "id: '../bad'"), /id 非法或重复/],
    [presetPlugin.replace("id: 'DrMetricCardHorizontal'", "id: 'DrText'"), /id 非法或重复/],
    [presetPlugin.replace("componentType: 'DrMetricCard'", "componentType: 'Unknown'"), /父组件未注册/],
    [presetPlugin.replace("componentType: 'DrMetricCard'", "componentType: 'DrText'"), /type 必须为父组件类型/],
    ["import fs from 'node:fs'; export default fs.readFileSync('test')", /禁止加载外部模块/],
    ["export default {getInstance() {while (true) {}}}", /timed out/],
    ["export default {getInstance: async () => ({})}", /工厂必须同步返回配置/],
  ]) {
    await writeFile(path.join(presetDir, 'plugin.ts'), plugin)
    await assert.rejects(exportFixture, error)
    assert.equal(await readFile(path.join(outputDir, 'index.json'), 'utf8'), savedIndex)
  }
  await writeFile(path.join(presetDir, 'plugin.ts'), presetPlugin)
  await writeFile(path.join(presetDir, 'install.ts'), presetInstall.replace("chart.title = '横向指标卡'", "chart.type = 'DrMetricCardHorizontal'"))
  await assert.rejects(exportFixture, /type 必须为父组件类型/)
  await writeFile(path.join(presetDir, 'install.ts'), presetInstall)
  await writeFile(path.join(registerDir, 'PluginRegister.ts'), registry.replace('[horizontalMetricCardPreset]', '[...horizontalMetricCardPreset]'))
  await assert.rejects(exportFixture, /必须为可解析的本地 default 导入/)
  await writeFile(path.join(registerDir, 'PluginRegister.ts'), registry.replace('[horizontalMetricCardPreset]', '[horizontalMetricCardPreset, horizontalMetricCardPreset]'))
  await assert.rejects(exportFixture, /id 非法或重复/)
  await writeFile(path.join(registerDir, 'PluginRegister.ts'), registry.replace('[horizontalMetricCardPreset]', '[]'))
  result = await exportFixture()
  assert.equal(result.components.length, 2)
  assert.equal((await readdir(outputDir)).includes('DrMetricCardHorizontal.config.json'), false)
} finally {
  await rm(rootDir, { recursive: true, force: true })
}
