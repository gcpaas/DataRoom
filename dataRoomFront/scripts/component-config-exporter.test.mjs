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
  const componentsDir = path.join(projectDir, 'src/dataroom-packages/components')
  const registerDir = path.join(projectDir, 'src/dataroom-packages/_components')
  const outputDir = path.join(rootDir, 'output')
  await mkdir(path.join(componentsDir, 'DrText'), { recursive: true })
  await mkdir(registerDir, { recursive: true })
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'RemovedComponent.config.json'), '{}', 'utf8')
  await writeFile(path.join(outputDir, 'notes.txt'), '保留非生成文件', 'utf8')

  await writeFile(path.join(registerDir, 'PluginRegister.ts'), `
import {DrTextPlugin} from '@/dataroom-packages/components/DrText/plugin.ts'
const pluginList = [
  new DrTextPlugin(['TEXT'])
]
export { pluginList }
`, 'utf8')

  await writeFile(path.join(componentsDir, 'DrText/plugin.ts'), `
import thumbnail from './images/text.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts";
export class DrTextPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrText', '文本', '文字、文本、数字', thumbnail, tags)
  }
}
`, 'utf8')

  await writeFile(path.join(componentsDir, 'DrText/install.ts'), `
import {createChartConfig} from '../type/define'
import type { ValueFormat } from '@/dataroom-packages/components/_shared/metric-table-utils.ts'
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

  await mkdir(path.join(projectDir, 'src/dataroom-packages/components/_shared'), { recursive: true })
  await writeFile(path.join(projectDir, 'src/dataroom-packages/components/_shared/metric-table-utils.ts'), `
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

  assert.equal(result.details[0].fields.length, 6)
  assert.deepEqual(result.details[0].fields[1].options, ['left', 'center', 'right'])
  assert.deepEqual(result.details[0].fields[2].options, ['item'])
  assert.deepEqual(result.details[0].fields[3].options, ['text', 'value', 'thousand'])
  assert.deepEqual(result.details[0].fields[4].options, [false, 'single', 'multiple'])
  assert.equal(result.details[0].fields[5].field, 'textStyle.fontSize')

  const outputFiles = await readdir(outputDir)
  assert.equal(outputFiles.includes('RemovedComponent.config.json'), false)
  assert.equal(outputFiles.includes('notes.txt'), true)
} finally {
  await rm(rootDir, { recursive: true, force: true })
}
