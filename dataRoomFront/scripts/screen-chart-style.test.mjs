import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
const jiti = createJiti(import.meta.url, {
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false,
})
const { getDefaultTheme } = await jiti.import('../src/dataRoom/theme/registry.ts')
const factory = async (type) => jiti.import(`../src/dataRoom/components/${type}/install.ts`)
test('新建组件使用页面默认主题，实例色板互不影响', async () => {
  const { getInstance } = await factory('DrLineChart')
  const a = getInstance('visualScreen'), b = getInstance('visualScreen')
  assert.equal(a.props.series.colors[0], getDefaultTheme('visualScreen').series.colors[0])
  assert.equal(a.props.series.symbol.fillOpacity, 0.2)
  assert.equal(a.props.series.areaStyle.opacity, 0.2)
  assert.equal(getInstance('page').props.series.colors[0], getDefaultTheme('page').series.colors[0])
  a.props.series.colors[0] = 'changed'
  assert.equal(b.props.series.colors[0], getDefaultTheme('visualScreen').series.colors[0])
})
test('渐变两端使用绝对不透明度且支持颜色选择器输出', async () => {
  const { withOpacity, gradientStops } = await jiti.import('../src/dataRoom/theme/color.ts')
  assert.equal(withOpacity('#abc', 0.2), 'rgba(170, 187, 204, 0.2)')
  assert.equal(withOpacity('rgba(29, 174, 255, 0.6)', 0.2), 'rgba(29, 174, 255, 0.2)')
  assert.deepEqual(gradientStops('#1DAEFF', 0.2, 0), [
    { offset: 0, color: 'rgba(29, 174, 255, 0.2)' },
    { offset: 1, color: 'rgba(29, 174, 255, 0)' },
  ])
})

// 执行组件真实 series 构造函数，以非视觉方式检查最终 ECharts 参数。
async function seriesFor(type, props) {
  const { readFile } = await import('node:fs/promises')
  const ts = await import('typescript')
  const echarts = await import('echarts')
  const helpers = await jiti.import('../src/dataRoom/theme/color.ts')
  const source = await readFile(new URL(`../src/dataRoom/components/${type}/index.vue`, import.meta.url), 'utf8')
  const start = source.indexOf('const buildSeriesItem =')
  const end = source.indexOf('/**', start)
  const code = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  return new Function('chart', 'echarts', 'gradientStops', 'withOpacity', 'adjustColorOpacity', `${code}; return buildSeriesItem('样例', [1, 2], 0)`)(
    { props }, echarts, helpers.gradientStops, helpers.withOpacity, helpers.withOpacity,
  )
}

test('实际系列输出：柱体渐变 100% → 50%，面积渐变 20% → 0%，线条与描边不变淡', async () => {
  for (const type of ['DrLineChart', 'DrAreaChart', 'DrBarChart', 'DrHorizontalBarChart']) {
    const { getInstance } = await factory(type)
    const { props } = getInstance('visualScreen')
    if (props.series.areaStyle) props.series.areaStyle.show = true
    if (props.series.gradient) props.series.gradient.enabled = true
    const series = await seriesFor(type, props)
    const stops = (series.areaStyle?.color ?? series.itemStyle.color).colorStops
    const { withOpacity } = await jiti.import('../src/dataRoom/theme/color.ts')
    const primary = getDefaultTheme('visualScreen').series.colors[0]
    const isBar = type === 'DrBarChart' || type === 'DrHorizontalBarChart'
    assert.equal(stops[0].color, withOpacity(primary, isBar ? 1 : 0.2), type)
    assert.equal(stops[1].color, withOpacity(primary, isBar ? 0.5 : 0), type)
    if (series.areaStyle) {
      assert.equal(series.areaStyle.opacity, 1, '不得再次叠乘透明度')
      assert.equal(series.itemStyle.color, withOpacity(primary, 0.2))
      assert.equal(series.itemStyle.borderColor, primary)
      assert.equal(series.lineStyle.color, primary)
    }
    if (type === 'DrHorizontalBarChart') assert.equal(series.barGap, 3)
  }
})

test('旧折线缺少新属性时仍使用原渐变和实心点', async () => {
  const { getInstance } = await factory('DrLineChart')
  const { props } = getInstance('page')
  props.series.colors = ['#5470c6']
  props.series.areaStyle.opacity = 0.3
  delete props.series.symbol.fillOpacity
  delete props.series.areaStyle.endOpacity
  props.series.areaStyle.show = true
  const series = await seriesFor('DrLineChart', props)
  assert.equal(series.itemStyle.color, '#5470c6')
  assert.equal(series.areaStyle.opacity, 0.3)
  assert.equal(series.areaStyle.color.colorStops[1].color, 'rgba(84, 112, 198, 0.05)')
})


test('组件默认数据配色与固定中性色独立，布局尺寸保持不变', async () => {
  const types = ['DrLineChart', 'DrAreaChart', 'DrBarChart', 'DrHorizontalBarChart',
    'DrBubbleChart', 'DrRadarChart', 'DrPieChart', 'DrMetricCard',
    'DrImageMetricCard', 'DrText', 'DrDateTime', 'DrTabList',
    'DrMap', 'DrDataTable', 'DrBorder', 'DrDecoration']
  for (const type of types) {
    const { getInstance } = await factory(type)
    const page = getInstance('page'), screen = getInstance('visualScreen')
    for (const [pageType, config] of [['page', page], ['visualScreen', screen]]) {
      const tokens = getDefaultTheme(pageType)
      if (config.props.series?.colors) assert.deepEqual(config.props.series.colors, tokens.series.colors, type)
      if (config.props.title?.color) assert.equal(config.props.title.color, '#A8ABB2', type)
      if (config.props.tooltip?.textStyle) assert.equal(config.props.tooltip.textStyle.color, '#FFFFFF', type)
    }
    assert.notDeepEqual([page.w, page.h], [screen.w, screen.h], type)
  }
})
