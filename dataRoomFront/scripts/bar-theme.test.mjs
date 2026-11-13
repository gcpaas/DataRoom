import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
const jiti = createJiti(import.meta.url, {
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false,
})
const { getInstance } = await jiti.import('../src/dataRoom/components/DrBarChart/install.ts')

test('主题覆盖映射属性，保留数据布局和非映射配置，支持嵌套组合', async () => {
  const { applyThemeToCharts } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
  const { themes } = await jiti.import('../src/dataRoom/theme/registry.ts')
  const a = getInstance('page'), b = getInstance('visualScreen')
  a.props.series.label.color = 'custom'
  a.props.series.barWidth = 33
  const other = { ...getInstance('page'), type: 'DrImage' }
  const before = JSON.stringify(other)
  const layout = [a.x, a.y, a.w, a.h]
  const dataset = JSON.stringify(a.dataset)
  const group = { type: 'DrGroup', props: {}, children: [b, other] }
  assert.equal(applyThemeToCharts([a, group], themes[0]), 2)
  assert.equal(a.props.series.label.color, themes[0].text.primary)
  assert.equal(a.props.series.barWidth, 33)
  assert.deepEqual([a.x, a.y, a.w, a.h], layout)
  assert.equal(JSON.stringify(a.dataset), dataset)
  assert.equal(JSON.stringify(other), before)
  assert.deepEqual(a.props.series.colors, b.props.series.colors)
  a.props.series.colors[0] = 'edited'
  assert.notEqual(b.props.series.colors[0], 'edited')
  assert.notEqual(themes[0].series.colors[0], 'edited')
  applyThemeToCharts([a], themes[1])
  applyThemeToCharts([a], themes[0])
  assert.equal(a.props.series.label.color, themes[0].text.primary)
})

test('保存重载后新组件沿用主题，旧页面新组件按页面类型选择默认主题', async () => {
  const { applyThemeToNewChart } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
  const saved = JSON.parse(JSON.stringify({ basicConfig: { themeId: 'blue-ocean' } }))
  const chart = getInstance('page')
  applyThemeToNewChart(chart, saved.basicConfig.themeId, 'page')
  assert.equal(chart.props.series.gradient.startOpacity, 1)
  assert.equal(chart.props.series.gradient.endOpacity, 0.5)
  const light = getInstance('page'), dark = getInstance('visualScreen')
  applyThemeToNewChart(light, undefined, 'page')
  applyThemeToNewChart(dark, undefined, 'visualScreen')
  assert.notEqual(light.props.xAxis.axisLabel.color, dark.props.xAxis.axisLabel.color)
  const roundtrip = JSON.parse(JSON.stringify(chart))
  assert.deepEqual(roundtrip.props, chart.props)
})

test('主题浮层真实处理函数：取消不切换，确认后才发出切换事件', async () => {
  const { readFile } = await import('node:fs/promises')
  const ts = await import('typescript')
  const source = await readFile(new URL('../src/dataRoom/designer/components/ThemeSelector.vue', import.meta.url), 'utf8')
  const handler = source.slice(source.indexOf('const selectTheme ='), source.indexOf('</script>'))
  const code = ts.transpileModule(handler, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const emitted = []
  let resolveConfirmation
  const confirming = { value: false }
  const visible = { value: true }
  const select = new Function('props', 'emit', 'confirming', 'visible', 'ElMessageBox', `${code}; return selectTheme`)(
    { disabled: false }, (...args) => emitted.push(args), confirming, visible,
    { confirm: () => new Promise((resolve, reject) => { resolveConfirmation = { resolve, reject } }) },
  )
  const cancelled = select({ id: 'clear-white', name: '清晖白' })
  assert.deepEqual(emitted, [])
  resolveConfirmation.reject('cancel')
  await cancelled
  assert.deepEqual(emitted, [])
  assert.equal(confirming.value, false)
  const accepted = select({ id: 'starport-blue', name: '星港蓝' })
  assert.deepEqual(emitted, [])
  await select({ id: 'forest-green', name: '森境绿' }) // 等待确认时不能重复触发
  resolveConfirmation.resolve('confirm')
  await accepted
  assert.deepEqual(emitted, [['select', 'starport-blue']])
})


test('旧主题标识兼容新版预设，九套主题均能应用且保持独立的状态色定义', async () => {
  const { themes, getTheme, getDefaultTheme } = await jiti.import('../src/dataRoom/theme/registry.ts')
  const { applyThemeToCharts } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
  assert.equal(themes.length, 9)
  assert.equal(new Set(themes.map(theme => theme.id)).size, 9)
  assert.equal(getTheme('light-business').id, getDefaultTheme('page').id)
  assert.equal(getTheme('dark-tech').id, getDefaultTheme('visualScreen').id)
  assert.equal(getTheme('blue-ocean').id, getDefaultTheme('visualScreen').id)
  for (const theme of themes) {
    const chart = getInstance('page')
    applyThemeToCharts([chart], theme)
    assert.deepEqual(chart.props.series.colors, theme.series.colors)
    assert.equal(chart.props.tooltip.backgroundColor, theme.background.secondary)
    assert.equal(typeof theme.color.danger, 'string')
    if (theme.id === 'starport-blue') assert.ok(!chart.props.series.colors.includes(theme.color.danger))
  }
})

test('柱状图工厂默认值与默认主题映射一致，无需插入后再次修正颜色', async () => {
  const { applyThemeToCharts } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
  const { getDefaultTheme } = await jiti.import('../src/dataRoom/theme/registry.ts')
  for (const pageType of ['page', 'visualScreen']) {
    const chart = getInstance(pageType)
    const before = JSON.stringify(chart.props)
    applyThemeToCharts([chart], getDefaultTheme(pageType))
    assert.equal(JSON.stringify(chart.props), before)
  }
})


test('相对样式路径解析深层数值与数组，非法路径立即报错', async () => {
  const { getThemeStyle } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
  const { themes } = await jiti.import('../src/dataRoom/theme/registry.ts')
  for (const theme of themes) {
    assert.equal(getThemeStyle(theme, 'text.primary'), theme.text.primary)
    assert.equal(getThemeStyle(theme, 'series.gradient.startOpacity'), 0.2)
    assert.equal(getThemeStyle(theme, 'series.point.fillOpacity'), 0.2)
    assert.deepEqual(getThemeStyle(theme, 'series.colors'), theme.series.colors)
    assert.throws(() => getThemeStyle(theme, 'text.missing'), /路径不存在/)
    assert.throws(() => getThemeStyle(theme, '__proto__'), /路径不存在/)
    assert.throws(() => getThemeStyle(theme, 'text'), /样式值无效/)
  }
})
