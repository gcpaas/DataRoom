import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const vue = require('vue')
const { parse } = require('@vue/compiler-sfc')
const source = readFileSync(new URL('./ComponentLayer.vue', import.meta.url), 'utf8')
const designer = readFileSync(new URL('../../visual-screen-designer/VisualScreenDesigner.vue', import.meta.url), 'utf8')

function execute(sourceText, load, defineProps = undefined) {
  const { outputText } = ts.transpileModule(sourceText, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const module = { exports: {} }
  vm.runInThisContext(`(function(require, module, exports, defineProps) {\n${outputText}\n})`)(load, module, module.exports, defineProps)
  return module.exports
}

function fixture(t, initialId) {
  const props = vue.reactive({ activeChartId: initialId })
  const charts = vue.ref([{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }])
  const activations = []
  const canvas = {
    chartList: charts,
    activeChartById(id) {
      activations.push(id)
      props.activeChartId = id
    },
  }
  const layerModule = execute(readFileSync(new URL('./component-layer.ts', import.meta.url), 'utf8'), require)
  const scope = vue.effectScope()
  t.after(() => scope.stop())
  const script = parse(source).descriptor.scriptSetup.content
  const api = scope.run(() => execute(`${script}\nexport { layerTreeRef, onLayerClick, onLayerContextMenu };`, (name) => {
    if (name === 'vue') return { ...vue, inject: () => canvas, onMounted() {}, onBeforeUnmount() {} }
    if (name === 'element-plus') return { ElMessageBox: {} }
    if (name.endsWith('DrConst.ts')) return { DrConst: { CANVAS_INST: 'canvas' } }
    if (name.endsWith('component-layer.ts')) return layerModule
    throw new Error(`Unexpected import: ${name}`)
  }, () => props))
  let current = null
  const writes = []
  const tree = {
    getNode: (id) => charts.value.find((chart) => chart.id === id),
    getCurrentKey: () => current,
    setCurrentKey(id) { current = id; writes.push(id) },
    filter() {},
  }
  return { props, charts, activations, api, tree, writes, resetTree: () => { current = null } }
}

test('父组件传入主激活 ID，树仅以 node-click 触发画布激活', () => {
  assert.match(designer, /<ComponentLayer :active-chart-id="activeChart\?\.id" \/>/)
  assert.match(source, /@node-click="onLayerClick"/)
  assert.doesNotMatch(source, /@current-change/)
  assert.match(source, /immediate: true, flush: 'post'/)
})

test('画布先激活、树后挂载时补同步，切换及清空均不反向激活画布', async (t) => {
  const f = fixture(t, 'a')
  f.api.layerTreeRef.value = f.tree
  await vue.nextTick()
  assert.equal(f.tree.getCurrentKey(), 'a')
  f.props.activeChartId = 'b'
  await vue.nextTick()
  assert.equal(f.tree.getCurrentKey(), 'b')
  f.props.activeChartId = undefined
  await vue.nextTick()
  assert.equal(f.tree.getCurrentKey(), null)
  assert.deepEqual(f.activations, [])
  assert.deepEqual(f.writes, ['a', 'b', null])
})

test('同 key 不重复写入，数据重建后能恢复高亮', async (t) => {
  const f = fixture(t, 'a')
  f.api.layerTreeRef.value = f.tree
  await vue.nextTick()
  f.charts.value[0].title = '新标题'
  await vue.nextTick()
  assert.deepEqual(f.writes, ['a'])
  f.resetTree()
  f.charts.value = [...f.charts.value]
  await vue.nextTick()
  assert.deepEqual(f.writes, ['a', 'a'])
  assert.deepEqual(f.activations, [])
})

test('目标尚未存在时清空旧高亮，目标数据到达后补同步', async (t) => {
  const f = fixture(t, 'a')
  f.api.layerTreeRef.value = f.tree
  await vue.nextTick()
  f.props.activeChartId = 'later'
  await vue.nextTick()
  assert.equal(f.tree.getCurrentKey(), null)
  f.charts.value.push({ id: 'later', title: '稍后加载' })
  await vue.nextTick()
  assert.equal(f.tree.getCurrentKey(), 'later')
  assert.deepEqual(f.activations, [])
})

test('点击及右键图层各激活画布一次，反向监听不会再次调用激活', async (t) => {
  const f = fixture(t)
  f.api.layerTreeRef.value = f.tree
  await vue.nextTick()
  f.api.onLayerClick({ id: 'a', chart: { id: 'a' } })
  await vue.nextTick()
  f.api.onLayerContextMenu({ preventDefault() {}, stopPropagation() {} }, { id: 'b', chart: { id: 'b' } })
  await vue.nextTick()
  assert.deepEqual(f.activations, ['a', 'b'])
  assert.equal(f.tree.getCurrentKey(), 'b')
  assert.deepEqual(f.writes, ['a', 'b'])
})
