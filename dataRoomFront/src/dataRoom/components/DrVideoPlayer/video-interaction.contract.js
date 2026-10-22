import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const vue = require('vue')
const { parse, compileScript } = require('@vue/compiler-sfc')
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const { descriptor } = parse(read('./index.vue'))
const script = compileScript(descriptor, { id: 'video-interaction-test' })

function loadModule(source, filename) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const module = { exports: {} }
  const load = (name) => {
    if (name === 'vue') return { ...vue, onMounted: () => {}, onBeforeUnmount: () => {} }
    if (name.includes('use-dr-component')) return { useDrComponent: () => ({ canvasInst: {}, expose: {} }) }
    if (name.includes('/utils/')) return { getSingleDatasetValueByField: () => undefined }
    if (name === '../type/define') return { createChartConfig: (type, props, overrides) => ({ type, props, ...overrides }) }
    throw new Error(`Unexpected dependency: ${name}`)
  }
  vm.runInThisContext(`(function(require, module, exports) {${outputText}\n})`, { filename })(load, module, module.exports)
  return module.exports
}

const component = loadModule(script.content, 'DrVideoPlayer.vue').default
const install = loadModule(read('./install.ts'), 'install.ts')
function setup(mode, controls) {
  const chart = install.getInstance()
  chart.props.basic.controls = controls
  const props = vue.reactive({ chart, mode })
  const state = component.setup(props, { expose: () => {} })
  return { props, state }
}

for (const controls of [true, false]) {
  test(`设计态禁用原生交互，预览恢复 controls=${controls}，不修改配置`, () => {
    const { props, state } = setup('designer', controls)
    assert.equal(state.videoControls.value, false)
    assert.equal(state.videoStyle.value.pointerEvents, 'none')
    assert.equal(props.chart.props.basic.controls, controls)
    props.mode = 'preview'
    assert.equal(state.videoControls.value, controls)
    assert.equal(state.videoStyle.value.pointerEvents, 'auto')
    assert.equal(props.chart.props.basic.controls, controls)
    props.mode = 'designer'
    assert.equal(state.videoControls.value, false)
    assert.equal(state.videoStyle.value.pointerEvents, 'none')
  })
}

test('未传模式时默认预览，视频使用指定默认地址', () => {
  assert.equal(component.props.mode.default, 'preview')
  const { state } = setup(component.props.mode.default, true)
  assert.equal(state.videoControls.value, true)
  assert.equal(state.videoStyle.value.pointerEvents, 'auto')
  assert.equal(state.videoUrl.value, 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4')
})

test('视频模板绑定派生控制栏和鼠标样式', () => {
  assert.match(descriptor.template.content, /:controls="videoControls"/)
  assert.match(descriptor.template.content, /:style="videoStyle"/)
  assert.doesNotMatch(descriptor.template.content, /:controls="chart\.props\.basic\.controls"/)
})

test('大屏设计和预览分支都为视频传模式，组合递归保留模式', () => {
  const tree = read('../../visual-screen-designer/components/VisualScreenChartTree.vue')
  assert.equal((tree.match(/v-bind="chart\.type === 'DrVideoPlayer' \? \{ mode \} : \{\}"/g) || []).length, 2)
  assert.equal((tree.match(/:mode="mode"/g) || []).length, 2)
  assert.match(read('../../visual-screen-designer/VisualScreenDesigner.vue'), /mode="designer"/)
  assert.match(read('../../visual-screen-designer/preview/VisualScreenPreview.vue'), /mode="preview"/)
})
