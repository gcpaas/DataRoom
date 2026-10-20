import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const { ref, computed } = require('vue')
const { parse } = require('@vue/compiler-sfc')
const srcDir = fileURLToPath(new URL('../../', import.meta.url))

// 执行真实 TS 模块和别名依赖；仅替换外部服务与 Vite 环境，不替换显隐逻辑。
function createRuntime() {
  const messages = []
  const routes = []
  const cache = new Map()
  function load(specifier, parent = resolve(srcDir, 'index.ts')) {
    if (specifier === '@/router') return { push: async (url) => { routes.push(url) } }
    if (specifier === 'element-plus') {
      return { ElMessage: Object.fromEntries(['warning', 'error'].map((level) => [level, (message) => messages.push({ level, message })])) }
    }
    if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return require(specifier)
    let filename = specifier.startsWith('@/') ? resolve(srcDir, specifier.slice(2)) : resolve(dirname(parent), specifier)
    if (!filename.endsWith('.ts')) filename = existsSync(`${filename}.ts`) ? `${filename}.ts` : resolve(filename, 'index.ts')
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const source = readFileSync(filename, 'utf8').replace(/import\.meta\.env/g, '({})')
    const { outputText } = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    })
    vm.runInThisContext(`(function(require, module, exports) {\n${outputText}\n})`, { filename })(
      (name) => load(name, filename), module, module.exports,
    )
    return module.exports
  }
  return { load, messages, routes }
}

const action = (type, config = { targetChartIds: ['target', 'initial-hidden'] }) => ({
  name: type, type, chartActionConfig: { type, ...config },
})
const sources = [
  { label: '按钮点击', sourceType: 'chart', sourceId: 'button', behaviorName: 'click' },
  { label: '单选框等组件的值改变事件', sourceType: 'chart', sourceId: 'other', behaviorName: 'change' },
  { label: '定时器事件', sourceType: 'timer', sourceId: 'timer', behaviorName: 'tick' },
]

function fixture(source = sources[0]) {
  const runtime = createRuntime()
  const { useCanvasInst } = runtime.load('@/dataRoom/hooks/use-canvas-inst')
  const { filterVisibleCharts } = runtime.load('@/dataRoom/designer/utils/chart-visibility.ts')
  const chartList = ref([
    { id: 'button', x: 0, y: 0, w: 4, h: 2, behaviors: {} },
    { id: 'other', x: 4, y: 0, w: 4, h: 2, behaviors: {} },
    { id: 'target', x: 8, y: 3, w: 12, h: 5 },
    { id: 'initial-hidden', x: 20, y: 9, w: 8, h: 6, hide: true },
  ])
  const globalVariable = ref([{ id: 'variable', name: 'selection', source: 'static', config: { value: 'before' } }])
  const basicConfig = ref({ timers: [{ id: 'timer', behaviors: {} }] })
  const { canvasInst } = useCanvasInst({ chartList, globalVariable, basicConfig })
  const visibleCharts = computed(() => filterVisibleCharts(chartList.value))
  const owner = source.sourceType === 'timer' ? basicConfig.value.timers[0] : chartList.value.find((chart) => chart.id === source.sourceId)
  async function trigger(actions, disabled = false, data = {}) {
    owner.behaviors[source.behaviorName] = { disabled, actions }
    if (source.sourceType === 'chart') {
      await canvasInst.triggerChartBehavior(source.sourceId, source.behaviorName, data)
    } else {
      await canvasInst.triggerBehavior({ ...source, triggerData: data })
    }
    assert.deepEqual(runtime.messages, [], '真实行为链不应吞掉执行错误或产生警告')
  }
  return { ...runtime, chartList, globalVariable, canvasInst, visibleCharts, trigger }
}

const ids = (charts) => charts.map((chart) => chart.id)
const layout = (charts) => charts.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }))

test('真实 visibility 工具：缺省 hide 可见，仅 true 隐藏，过滤不修改源列表', () => {
  const { filterVisibleCharts, isChartHidden } = createRuntime().load('@/dataRoom/designer/utils/chart-visibility.ts')
  const charts = [{ id: 'default' }, { id: 'visible', hide: false }, { id: 'hidden', hide: true }]
  const before = structuredClone(charts)
  assert.deepEqual(filterVisibleCharts(undefined), [])
  assert.deepEqual(filterVisibleCharts([]), [])
  assert.equal(isChartHidden(undefined), false)
  assert.equal(isChartHidden(charts[0]), false)
  assert.equal(isChartHidden(charts[2]), true)
  assert.equal(isChartHidden({ hide: 'true' }), false)
  const visible = filterVisibleCharts(charts)
  assert.deepEqual(ids(visible), ['default', 'visible'])
  assert.equal(visible[0], charts[0])
  assert.deepEqual(charts, before)
})

for (const source of sources) {
  test(`${source.label}：show/hide/toggle 后可再次显示，完整列表、对象与坐标保留`, async () => {
    const f = fixture(source)
    const originalList = f.chartList.value
    const originalCharts = [...originalList]
    const originalLayout = layout(originalList)
    assert.deepEqual(ids(f.visibleCharts.value), ['button', 'other', 'target'])
    // 首次 toggle 同时覆盖缺省 hide 和初始隐藏两个相反状态。
    const steps = [
      ['toggleVisibility', ['button', 'other', 'initial-hidden']],
      ['toggleVisibility', ['button', 'other', 'target']],
      ['show', ['button', 'other', 'target', 'initial-hidden']],
      ['show', ['button', 'other', 'target', 'initial-hidden']],
      ['hide', ['button', 'other']],
      ['hide', ['button', 'other']],
      ['show', ['button', 'other', 'target', 'initial-hidden']],
    ]
    for (const [type, expected] of steps) {
      await f.trigger([action(type)])
      assert.deepEqual(ids(f.visibleCharts.value), expected, type)
      for (const chart of originalCharts.slice(2)) assert.equal(chart.hide, !expected.includes(chart.id), type)
      assert.equal(f.chartList.value, originalList)
      assert.equal(f.canvasInst.chartList, originalList)
      assert.deepEqual(layout(originalList), originalLayout)
      originalCharts.forEach((chart, index) => assert.equal(originalList[index], chart))
    }
  })

  test(`${source.label}：禁用行为不执行显隐动作或其他副作用`, async () => {
    const f = fixture(source)
    let refreshes = 0
    f.canvasInst.registerChartInstance('target', { exposed: { autoRefreshData: () => { refreshes++ } } })
    const before = layout(f.chartList.value)
    await f.trigger([
      action('hide'), action('show'), action('toggleVisibility'),
      action('refreshData', { targetChartIds: ['target'] }),
      action('updateGlobalVariable', { globalVariableName: 'selection', bepName: 'value' }),
      action('navigate', { mode: 'internal', target: 'self', url: '/contract-target' }),
    ], true, { value: 'after' })
    assert.deepEqual(ids(f.visibleCharts.value), ['button', 'other', 'target'])
    assert.equal(f.chartList.value[2].hide, undefined)
    assert.equal(f.chartList.value[3].hide, true)
    assert.deepEqual(layout(f.chartList.value), before)
    assert.equal(refreshes, 0)
    assert.equal(f.canvasInst.getGlobalVariableValue('selection'), 'before')
    assert.deepEqual(f.routes, [])
  })
}

test('行为链 smoke：refreshData、globalVariable、navigate 与显隐动作顺序执行', async () => {
  const f = fixture()
  let refreshes = 0
  f.canvasInst.registerChartInstance('target', { exposed: { autoRefreshData: async () => {
    assert.deepEqual(ids(f.visibleCharts.value), ['button', 'other'])
    assert.equal(f.canvasInst.getGlobalVariableValue('selection'), 'before')
    await Promise.resolve()
    refreshes++
  } } })
  await f.trigger([
    action('hide'),
    action('refreshData', { targetChartIds: ['target'] }),
    action('updateGlobalVariable', { globalVariableName: 'selection', bepName: 'value' }),
    action('navigate', { mode: 'internal', target: 'self', url: ' /contract-target ' }),
    action('show'),
  ], false, { value: 42 })
  assert.equal(refreshes, 1)
  assert.equal(f.canvasInst.getGlobalVariableValue('selection'), '42')
  assert.equal(f.globalVariable.value[0].config.value, '42')
  assert.deepEqual(f.routes, ['/contract-target'])
  assert.deepEqual(ids(f.visibleCharts.value), ['button', 'other', 'target', 'initial-hidden'])
})

for (const filename of ['PageDesigner.vue', 'preview/PagePreviewer.vue']) {
  test(`${filename} 模板接线：仅过滤 GridItem，布局与行为仍消费完整 chartList`, () => {
    const source = readFileSync(new URL(filename, import.meta.url), 'utf8')
    const { descriptor, errors } = parse(source)
    assert.deepEqual(errors, [])
    const script = ts.transpileModule(descriptor.scriptSetup.content, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, removeComments: true },
    }).outputText
    const template = descriptor.template.content.replace(/<!--[\s\S]*?-->/g, '')
    assert.ok(/import\s*\{[^}]*\bfilterVisibleCharts\b[^}]*\}\s*from\s*['"]@\/dataRoom\/designer\/utils\/chart-visibility\.ts['"]/.test(script), '必须导入真实显隐工具')
    assert.ok(/const\s+visibleCharts\s*=\s*computed\(\s*\(\)\s*=>\s*filterVisibleCharts\(chartList\.value\)\s*\)/.test(script), '可见列表必须响应 hide 变化')
    assert.ok(/useCanvasInst\(\{\s*chartList\s*[,}]/.test(script), '行为查找必须保留隐藏组件')
    const items = template.match(/<GridItem\b[^>]*>/g) || []
    const layouts = template.match(/<GridLayout\b[^>]*>/g) || []
    assert.equal(items.length, 1)
    assert.equal(layouts.length, 1)
    assert.match(items[0], /v-for="item in visibleCharts"/)
    assert.match(items[0], /:key="item\.id"/, '过滤后不能使用索引作为 key')
    for (const field of ['x', 'y', 'w', 'h']) assert.ok(items[0].includes(`:${field}="item.${field}"`))
    assert.match(items[0], /:i="item\.id"/)
    assert.match(layouts[0], /v-model:layout="chartList"/, '不得把过滤后的列表回写为完整布局')
  })
}
