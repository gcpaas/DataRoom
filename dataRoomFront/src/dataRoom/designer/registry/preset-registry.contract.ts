import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import type { ChartPreset } from '../../components/type/ChartPreset.ts'
import type { ChartConfig } from '../../components/type/ChartConfig.ts'
import { PageType } from '../../constants/PageType.ts'
import { groupComponents } from '../components/component-lib.ts'
import { createPresetRegistry } from './preset-registry.ts'

const makeEntry = (id = 'metric.horizontal', componentType = 'DrMetricCard'): ChartPreset => ({
  id,
  componentType,
  name: id,
  desc: '指标卡',
  thumbnail: '',
  tags: ['metric'],
  getInstance: (pageType: PageType): ChartConfig<unknown> => {
    const instanceId = randomUUID()
    return {
      id: instanceId,
      i: instanceId,
      type: componentType,
      title: id,
      x: 0,
      y: 0,
      w: pageType === PageType.PAGE ? 4 : 320,
      h: pageType === PageType.PAGE ? 5 : 180,
      z: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      props: { items: [{ value: 1 }] },
      dataset: { code: '', fields: { value: [] }, script: '', params: {} },
    }
  },
})

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('注册拒绝重复入口 ID，包括普通入口与预设冲突', () => {
  assert.throws(() => createPresetRegistry([makeEntry('DrMetricCard'), makeEntry('DrMetricCard')], ['DrMetricCard']), /ID 重复/)
})

test('注册要求实际父组件存在，不以预设 ID 替代父类型', () => {
  assert.throws(() => createPresetRegistry([makeEntry()], ['metric.horizontal']), /父组件 DrMetricCard 未注册/)
})

test('注册不会预创建实例，非法入口及页面类型在调用工厂前失败', () => {
  let calls = 0
  const entry = makeEntry()
  const original = entry.getInstance
  entry.getInstance = (pageType: PageType) => {
    calls += 1
    return original(pageType)
  }
  const { createFromPreset } = createPresetRegistry([entry], ['DrMetricCard'])
  assert.equal(calls, 0)
  for (const id of ['missing', 'toString', '__proto__']) {
    assert.throws(() => createFromPreset(id, PageType.PAGE), /未注册/)
  }
  for (const invalid of [undefined, null, '', PageType.DIRECTORY, 'screen']) {
    assert.throws(() => createFromPreset(entry.id, invalid as PageType), /无效的页面类型/)
  }
  assert.equal(calls, 0)
  createFromPreset(entry.id, PageType.PAGE)
  assert.equal(calls, 1)
})

test('工厂返回类型必须等于实际父组件类型', () => {
  const entry = makeEntry()
  const original = entry.getInstance
  entry.getInstance = (pageType: PageType) => ({ ...original(pageType), type: entry.id })
  const { createFromPreset } = createPresetRegistry([entry], ['DrMetricCard'])
  assert.throws(() => createFromPreset(entry.id, PageType.PAGE), /与父组件 DrMetricCard 不匹配/)
})

test('每次调用工厂获取独立实例，透传页面类型并保留尺寸与身份', () => {
  const entry = makeEntry()
  const { createFromPreset } = createPresetRegistry([entry], ['DrMetricCard'])
  const first = createFromPreset(entry.id, PageType.PAGE)
  const second = createFromPreset(entry.id, PageType.PAGE)
  const screen = createFromPreset(entry.id, PageType.VISUAL_SCREEN)
  assert.notEqual(first, second)
  assert.equal(new Set([first.id, second.id, screen.id]).size, 3)
  for (const chart of [first, second, screen]) {
    assert.equal(chart.i, chart.id)
    assert.equal(chart.type, 'DrMetricCard')
  }
  assert.deepEqual([first.w, first.h, screen.w, screen.h], [4, 5, 320, 180])
  assert.notEqual(first.props, second.props)
  assert.notEqual(first.dataset, second.dataset)
  first.dataset.fields.value!.push('变更字段')
  ;(first.props as { items: { value: number }[] }).items[0]!.value = 2
  assert.deepEqual(second.dataset.fields.value, [])
  assert.deepEqual(second.props, { items: [{ value: 1 }] })
})

test('分组保留相同父类型的不同预设 ID，并兼容仅有展示字段的输入', () => {
  const entries = [makeEntry('metric.default'), makeEntry('metric.horizontal')]
  const categories = [{ tag: 'metric', name: '指标卡' }]
  const groups = groupComponents(entries, categories, '')
  assert.deepEqual(groups[0]!.plugins.map(({ id }) => id), entries.map(({ id }) => id))
  assert.equal(groupComponents([{ name: '卡片', desc: '', tags: ['metric'] }], categories, '')[0]!.plugins.length, 1)
})

test('手动注册保留导出器依赖的静态数组，普通入口经 AutoInstall 适配', () => {
  const register = source('./PluginRegister.ts')
  assert.match(register, /const pluginList = \[\s*new DrTextPlugin/)
  assert.match(register, /import horizontalMetricCardPreset from '@\/dataRoom\/components\/DrMetricCard\/presets\/Horizontal\/plugin\.ts'/)
  assert.match(register, /const presetList = \[horizontalMetricCardPreset,/)
  assert.match(register, /const componentEntries: ChartPreset\[\] = \[/)
  assert.match(register, /id: plugin\.type,\s*componentType: plugin\.type,/)
  assert.match(register, /getInstance: \(pageType: PageType\) => getComponentInstance\(plugin\.type, pageType\)/)
  assert.match(register, /\.\.\.presetList/)
  assert.match(register, /createPresetRegistry\(componentEntries, Object\.keys\(componentInstances\)\)/)
})

test('AutoInstall 仅扫描直属 install，必填页面类型且显式拒绝未知组件', () => {
  const install = source('../../components/AutoInstall.ts')
  assert.match(install, /'\.\/\*\/install\.ts'/)
  assert.doesNotMatch(install, /'\.\/\*\*\/install\.ts'/)
  assert.match(install, /getComponentInstance = \(name: string, pageType: PageType\)/)
  assert.match(install, /pageType !== PageType\.PAGE && pageType !== PageType\.VISUAL_SCREEN/)
  assert.match(install, /Object\.prototype\.hasOwnProperty\.call\(componentInstances, name\)/)
  assert.match(install, /if \(!instanceFn\) \{\s*throw new Error/)
  assert.match(install, /instanceFn\(pageType\)/)
  assert.match(install, /chart\.type !== name/)
  assert.doesNotMatch(install, /return \{\} as ChartConfig/)
})

test('两个设计器区分普通类型与入口 ID，共用原插入流程且不改写工厂尺寸和身份', () => {
  for (const [path, pageType] of [
    ['../../page-designer/PageDesigner.vue', 'PAGE'],
    ['../../visual-screen-designer/VisualScreenDesigner.vue', 'VISUAL_SCREEN'],
  ]) {
    const designer = source(path!)
    assert.match(designer, new RegExp(`const addChart = \\(type: string\\) => insertChart\\(getComponentInstance\\(type, PageType\\.${pageType}\\)\\)`))
    assert.match(designer, new RegExp(`const addChartFromPreset = \\(id: string\\) => insertChart\\(createFromPreset\\(id, PageType\\.${pageType}\\)\\)`))
    assert.match(designer, /useCanvasInst\(\{[^}]*\baddChart,\s*addChartFromPreset,/)
    const insert = designer.match(/const insertChart = \(chartInst: ChartConfig<unknown>\) => \{([\s\S]*?)\n\}/)?.[1]
    assert.ok(insert)
    assert.doesNotMatch(insert, /chartInst\.(?:w|h|id|i)\s*=/)
    assert.match(insert, /chartInst\.z =/)
    assert.match(insert, /\.value\.push\(chartInst\)/)
    if (pageType === 'PAGE') {
      assert.match(insert, /chartInst\.x = 0\s*chartInst\.y = 0/)
      assert.match(insert, /rememberChartLayoutBaseline\(chartInst\)/)
      assert.match(insert, /activeChart\.value = reference\.chart/)
    }
  }
})

test('组件库使用 ID 选中、显示与创建，hook 实例公开独立预设方法', () => {
  const library = source('../components/ComponentLib.vue')
  assert.match(library, /groupComponents\(componentEntries,/)
  assert.match(library, /isPluginSelected\(plugin\.id\)/)
  assert.match(library, /togglePluginSelection\(plugin\.id\)/)
  assert.match(library, /:key="plugin\.id"/)
  assert.match(library, /:title="plugin\.id">\{\{ plugin\.id \}\}/)
  assert.match(library, /canvasInst\.addChartFromPreset\(id\)/)
  assert.doesNotMatch(library, /plugin\.(?:type|componentType)|canvasInst\.addChart\(/)
  const hook = source('../../hooks/use-canvas-inst/index.ts')
  assert.match(hook, /addChartFromPreset\?: \(id: string\) => ChartConfig<unknown>/)
  assert.match(hook, /const \{[^\n]*addChartFromPreset[^\n]*\} = options/)
  assert.match(hook, /addChartFromPreset: addChartFromPreset \|\| \(\(\) => \{\s*throw new Error/)
  assert.match(source('../types/CanvasInst.ts'), /addChartFromPreset: \(id: string\) => ChartConfig<unknown>/)
})
