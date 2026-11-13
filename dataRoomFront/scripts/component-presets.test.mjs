import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createJiti } from 'jiti'
import { exportComponentConfigs } from './component-config-exporter.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const componentsDir = path.join(projectRoot, 'src/dataRoom/components')
// 使用现有依赖加载真实 TS；不调用异步 Vue 组件加载器，也不模拟工厂或 UUID。
const jiti = createJiti(import.meta.url, {
  alias: { '@': path.join(projectRoot, 'src') },
  fsCache: false,
})
const pageTypes = ['page', 'visualScreen']
const parentType = 'DrMetricCard'
const presetId = 'DrMetricCardHorizontal'
const parentSizes = { page: [4, 5], visualScreen: [280, 140] }
const presetSizes = { page: [8, 3], visualScreen: [420, 100] }
const loadFactory = (relativePath) => jiti.import(path.join(componentsDir, relativePath))
const parent = await loadFactory('DrMetricCard/install.ts')
const horizontal = await loadFactory('DrMetricCard/presets/Horizontal/install.ts')
const extraPresets = [
  ['DrLineChartSmooth', 'DrLineChart', 'Smooth'],
  ['DrBarChartGradient', 'DrBarChart', 'Gradient'],
  ['DrBarChartRounded', 'DrBarChart', 'Rounded'],
  ['DrBarChartStacked', 'DrBarChart', 'Stacked'],
  ['DrPieChartRing', 'DrPieChart', 'Ring'],
  ['DrPieChartRoundedRing', 'DrPieChart', 'RoundedRing'],
]
const presetFactories = new Map([[presetId, { type: parentType, factory: horizontal }]])
for (const [id, type, folder] of extraPresets) {
  presetFactories.set(id, { type, factory: await loadFactory(`${type}/presets/${folder}/install.ts`) })
}


function assertSize(config, expected) {
  assert.deepEqual([config.w, config.h], expected)
}

function assertAllowedKeys(value, allowed) {
  assert.deepEqual(Object.keys(value).filter((key) => !allowed.includes(key)), [])
}

function assertDimensions(detail, sizes) {
  for (const [index, dimension] of ['w', 'h'].entries()) {
    const field = detail.fields.find((field) => field.field === dimension)
    assert.equal(field.defaultValue, sizes.visualScreen[index])
    assert.ok(field.description.includes(`page=${sizes.page[index]}（网格份数），visualScreen=${sizes.visualScreen[index]}（像素）`))
  }
}

function collectObjects(value, objects = new Set()) {
  if (value && typeof value === 'object' && !objects.has(value)) {
    objects.add(value)
    for (const child of Object.values(value)) collectObjects(child, objects)
  }
  return objects
}

function assertIndependent(instances) {
  const seen = new Set()
  const ids = new Set()
  for (const instance of instances) {
    assert.equal(typeof instance.id, 'string')
    assert.ok(instance.id.length > 0)
    assert.equal(instance.i, instance.id)
    assert.ok(!ids.has(instance.id), '实例 id 必须唯一')
    ids.add(instance.id)
    for (const object of collectObjects(instance)) {
      assert.ok(!seen.has(object), '实例之间不得共享深层对象或数组')
      seen.add(object)
    }
  }
}

test('真实仓库 36 个顶层工厂均支持双 pageType，且保留组件 type', async (t) => {
  const directories = await readdir(componentsDir, { withFileTypes: true })
  const factories = []
  for (const directory of directories.filter((entry) => entry.isDirectory())) {
    if ((await readdir(path.join(componentsDir, directory.name))).includes('install.ts')) {
      factories.push(directory.name)
    }
  }
  assert.equal(factories.length, 36, '覆盖全部顶层工厂，另行测试嵌套预设工厂')
  const ids = new Set()
  for (const name of factories.sort()) {
    await t.test(name, async () => {
      const factory = await loadFactory(`${name}/install.ts`)
      assert.equal(typeof factory.getInstance, 'function')
      for (const pageType of pageTypes) {
        for (let repeat = 0; repeat < 2; repeat += 1) {
          const config = factory.getInstance(pageType)
          assert.equal(config.type, name)
          assert.ok(config.props && typeof config.props === 'object')
          assert.ok(Number.isFinite(config.w) && config.w > 0)
          assert.ok(Number.isFinite(config.h) && config.h > 0)
          assert.equal(typeof config.id, 'string')
          assert.ok(config.id.length > 0)
          assert.equal(config.i, config.id)
          assert.ok(!ids.has(config.id), `${name}/${pageType} 不得复用 id`)
          ids.add(config.id)
        }
      }
    })
  }
})

test('指标卡与横向预设的双尺寸、父 type 和 superGetInstance 深层独立性', () => {
  const instances = []
  for (const pageType of pageTypes) {
    const original = parent.getInstance(pageType)
    const first = horizontal.getInstance(pageType)
    const second = horizontal.getInstance(pageType)
    const subsequent = parent.getInstance(pageType)
    instances.push(original, first, second, subsequent)
    for (const config of [original, subsequent]) {
      assertSize(config, parentSizes[pageType])
      assert.equal(config.props.layout.direction, 'vertical')
    }
    for (const config of [first, second]) {
      assertSize(config, presetSizes[pageType])
      assert.equal(config.props.layout.direction, 'horizontal')
    }
    for (const config of [original, first, second, subsequent]) {
      assert.equal(config.type, parentType)
      assert.notEqual(config.type, presetId)
    }
    const snapshots = [original, second, subsequent].map((value) => JSON.stringify(value))
    first.props.global.shadow.blur = 999
    first.props.global.padding[0] = 999
    first.props.conditional.rules[0].value = -999
    first.dataset.fields.valueField = ['测试字段']
    first.dataset.params.contract = { nested: ['测试参数'] }
    first.behaviors.click = { disabled: false, actions: [] }
    assert.deepEqual([original, second, subsequent].map((value) => JSON.stringify(value)), snapshots)
    const fresh = parent.getInstance(pageType)
    assert.deepEqual(fresh.props, original.props, '预设修改不得污染后续父组件实例')
    instances.push(fresh)
  }
  assertIndependent(instances)
})

test('横向 props 保存为 JSON 后仅凭父 type 即可恢复，不需要预设元数据', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'dataroom-preset-save-'))
  try {
    for (const pageType of pageTypes) {
      const config = horizontal.getInstance(pageType)
      config.props.layout.gap = 23
      config.props.global.shadow.blur = 31
      const saved = { pageType, chartList: [config] }
      const file = path.join(outputDir, `${pageType}.json`)
      await writeFile(file, JSON.stringify(saved), 'utf8')
      const text = await readFile(file, 'utf8')
      assert.ok(!text.includes(presetId), '保存 JSON 不得依赖预设 id')
      const restored = JSON.parse(text)
      assert.deepEqual(restored, saved)
      const chart = restored.chartList[0]
      // 模拟运行时按父 type 查找组件；该映射不包含任何预设入口。
      const runtimeComponents = new Map([[parentType, parent.component]])
      assert.ok(runtimeComponents.get(chart.type))
      assert.equal(chart.type, parentType)
      assert.equal(chart.props.layout.direction, 'horizontal')
      assert.equal(chart.props.layout.gap, 23)
      assert.equal(chart.props.global.shadow.blur, 31)
      assertSize(chart, presetSizes[pageType])
      assert.ok(!Object.hasOwn(chart, 'presetId'))
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true })
  }
})

test('真实导出可重复执行：34 普通 + 7 预设，父 type 和双尺寸完整落盘', async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), 'dataroom-preset-export-'))
  try {
    let previous
    for (let repeat = 0; repeat < 2; repeat += 1) {
      const result = await exportComponentConfigs({ projectRoot, outputDir })
      const index = JSON.parse(await readFile(path.join(outputDir, 'index.json'), 'utf8'))
      assert.equal(index.length, 41)
      assert.equal(new Set(index.map((entry) => entry.componentName)).size, 41)
      assert.deepEqual(index, result.components)
      const runtimeType = (detail) => detail.fields.find((field) => field.field === 'type')?.defaultValue
      assert.equal(result.details.filter((entry) => entry.componentName === runtimeType(entry)).length, 34)
      assert.deepEqual(result.details.filter((entry) => entry.componentName !== runtimeType(entry))
        .map((entry) => entry.componentName), [...presetFactories.keys()])
      for (const summary of index) assertAllowedKeys(summary, ['componentName', 'displayName', 'description'])
      const details = [...result.details, ...result.pageConfigs]
      assert.deepEqual((await readdir(outputDir)).sort(), ['index.json', ...details.map((detail) => `${detail.componentName}.config.json`)].sort())
      for (const detail of details) {
        const disk = JSON.parse(await readFile(path.join(outputDir, `${detail.componentName}.config.json`), 'utf8'))
        assert.deepEqual(disk, detail)
        assertAllowedKeys(disk, ['componentName', 'displayName', 'description', 'fields', 'datasetFields'])
        for (const field of disk.fields) {
          assertAllowedKeys(field, ['field', 'type', 'options', 'description', 'defaultValue'])
        }
        for (const field of disk.datasetFields ?? []) {
          assertAllowedKeys(field, ['name', 'desc', 'required', 'multiple'])
        }
        // options/defaultValue 为 Java Object 值，内部业务键不属于 schema。
      }
      for (const detail of result.details) {
        const type = presetFactories.get(detail.componentName)?.type ?? detail.componentName
        assert.equal(runtimeType(detail), type)
        assert.ok(detail.description.includes(`ChartConfig.type 必须为 ${type}`))
        assert.ok(detail.fields.find((field) => field.field === 'type').description.includes(`ChartConfig.type 必须为 ${type}`))
        assert.match(detail.description, /fields.defaultValue 默认对应 visualScreen/)
        assert.match(detail.description, /两种页面的默认值差异见字段 description/)
        const factory = presetFactories.get(detail.componentName)?.factory ?? await loadFactory(`${type}/install.ts`)
        const configs = Object.fromEntries(pageTypes.map((pageType) => [pageType, factory.getInstance(pageType)]))
        assertDimensions(detail, Object.fromEntries(pageTypes.map((pageType) => [pageType, [configs[pageType].w, configs[pageType].h]])))
        for (const field of detail.fields.filter((field) => !['id', 'i'].includes(field.field))) {
          const readValue = (config) => field.field.split('.').reduce((value, key) => value?.[key], config)
          const pageValue = readValue(configs.page)
          const visualValue = readValue(configs.visualScreen)
          assert.deepEqual(field.defaultValue, visualValue, `${detail.componentName}/${field.field} 保留 visualScreen 默认值`)
          if (!['w', 'h'].includes(field.field) && JSON.stringify(pageValue) !== JSON.stringify(visualValue)) {
            assert.ok(field.description.includes(`page=${JSON.stringify(pageValue) ?? '未设置'}，visualScreen=${JSON.stringify(visualValue) ?? '未设置'}`))
          }
        }
      }
      for (const [name, sizes, direction] of [
        [parentType, parentSizes, 'vertical'],
        [presetId, presetSizes, 'horizontal'],
      ]) {
        const detail = result.details.find((entry) => entry.componentName === name)
        assert.equal(runtimeType(detail), parentType)
        assertDimensions(detail, sizes)
        assert.equal(detail.fields.find((field) => field.field === 'props.layout.direction')?.defaultValue, direction)
      }
      if (previous) assert.deepEqual(result, previous, '重复导出结果必须稳定')
      previous = result
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true })
  }
})


test('新增预设在双设计器主题应用、JSON 保存后保留差异，实例不污染父组件', async () => {
  const { applyThemeToNewChart } = await jiti.import(path.join(projectRoot, 'src/dataRoom/theme/apply-theme.ts'))
  const { getChartDatasetFieldNames } = await loadFactory('_shared/chart-data-defaults.ts')
  const checks = {
    DrLineChartSmooth: (chart) => assert.equal(chart.props.series.lineType, 'smooth'),
    DrBarChartGradient: (chart) => {
      assert.equal(chart.props.series.gradient.enabled, true)
      assert.equal(chart.props.series.gradient.startOpacity, 1)
      assert.equal(chart.props.series.gradient.endOpacity, 0.15)
    },
    DrBarChartRounded: (chart) => assert.deepEqual(chart.props.series.borderRadius, [12, 12, 0, 0]),
    DrBarChartStacked: (chart) => {
      assert.equal(chart.props.series.displayMode, 'stack')
      assert.deepEqual(chart.dataset.fields.yField, ['value', 'compareValue'])
    },
    DrPieChartRing: (chart) => {
      assert.equal(chart.props.pie.innerRadius, 45)
      assert.equal(chart.props.pie.borderRadius, 0)
    },
    DrPieChartRoundedRing: (chart) => {
      assert.equal(chart.props.pie.innerRadius, 45)
      assert.equal(chart.props.pie.borderRadius, 10)
    },
  }
  for (const [id, type] of extraPresets) {
    const baseFactory = await loadFactory(`${type}/install.ts`)
    for (const pageType of pageTypes) {
      const base = baseFactory.getInstance(pageType)
      const snapshot = JSON.stringify(base.props)
      const factory = presetFactories.get(id).factory
      const chart = factory.getInstance(pageType)
      const second = factory.getInstance(pageType)
      assertIndependent([base, chart, second])
      assert.equal(chart.type, type)
      assertSize(chart, [base.w, base.h])
      applyThemeToNewChart(chart, undefined, pageType)
      checks[id](JSON.parse(JSON.stringify(chart)))
      assert.equal(JSON.stringify(base.props), snapshot)
      if (id === 'DrBarChartStacked') {
        const fields = getChartDatasetFieldNames(chart, 'yField', ['value'])
        assert.equal(fields.length, 2)
        for (const row of baseFactory.mockDataset.dataset) {
          for (const field of fields) assert.equal(typeof row[field], 'number')
        }
        assert.deepEqual(getChartDatasetFieldNames(base, 'yField', ['value']), ['value'])
      }
    }
  }
})
