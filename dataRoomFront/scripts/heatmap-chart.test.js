import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'

const jiti = createJiti(import.meta.url, { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false })
const { getInstance, mockDataset } = await jiti.import('../src/dataRoom/components/DrHeatmapChart/install.ts')
const { buildHeatmapOption, normalizeHeatmapData } = await jiti.import('../src/dataRoom/components/DrHeatmapChart/heatmap-option.ts')
const fields = { xField: ['hour'], yField: ['day'], valueField: ['count'] }
const rows = [
  { hour: '1a', day: 'Monday', count: 0 },
  { hour: '12a', day: 'Sunday', count: '14' },
  { hour: '2a', day: 'Monday', count: null },
  { hour: '3a', day: 'Monday', count: '' },
  { hour: '4a', day: 'Monday', count: 'bad' },
  { hour: '5a', day: 'Monday', count: false },
  { hour: '1a', day: 'Monday', count: 9 },
]

test('preserves zero and numeric strings, omits missing values, keeps first duplicate', () => {
  const result = normalizeHeatmapData(rows, fields, [], [])
  assert.deepEqual(result.xCategories, ['1a', '12a', '2a', '3a', '4a', '5a'])
  assert.deepEqual(result.yCategories, ['Monday', 'Sunday'])
  assert.deepEqual(result.data, [
    [0, 0, 0],
    [1, 1, 14],
  ])
})
test('custom axes retain empty categories and determine coordinates', () => {
  const result = normalizeHeatmapData(rows, fields, ['12a', '1a', '6a'], ['Sunday', 'Monday'])
  assert.deepEqual(result.data, [
    [1, 1, 0],
    [0, 0, 14],
  ])
  assert.deepEqual(result.xCategories, ['12a', '1a', '6a'])
})
test('missing field bindings and empty live data do not introduce sample cells', () => {
  assert.deepEqual(normalizeHeatmapData(rows, {}, [], []).data, [])
  assert.deepEqual(normalizeHeatmapData([], fields, [], []).data, [])
})
test('rebinding reads new fields and accepts numeric category zero', () => {
  assert.deepEqual(normalizeHeatmapData([{ a: 0, b: 'B', v: -2 }], { xField: ['a'], yField: ['b'], valueField: ['v'] }, [], []).data, [[0, 0, -2]])
})
test('configured scale is independent of observed values and keeps out-of-range values', () => {
  const chart = getInstance('visualScreen')
  chart.dataset.code = 'live'
  chart.dataset.fields = fields
  chart.props.series.min = -10
  chart.props.series.max = 10
  const option = buildHeatmapOption(chart, rows)
  assert.equal(option.visualMap.min, -10)
  assert.equal(option.visualMap.max, 10)
  assert.equal(option.visualMap.dimension, 2)
  assert.deepEqual(option.series[0].data, [
    [0, 0, 0],
    [1, 1, 14],
  ])
  assert.deepEqual(buildHeatmapOption(chart, []).series[0].data, [])
  assert.equal(buildHeatmapOption(chart, [{ hour: 'x', day: 'y', count: 100 }]).visualMap.max, 10)
  chart.props.series.max = -10
  assert.throws(() => buildHeatmapOption(chart, rows), /最小值必须小于最大值/)
})

test('ECharts accepts heatmap options and clears previous cells on an empty refresh', async () => {
  const echarts = await import('echarts')
  const chart = getInstance('page')
  chart.dataset.code = 'live'
  chart.dataset.fields = fields
  chart.props.animation.enabled = false
  chart.props.series.max = 10
  const instance = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 600, height: 360 })
  try {
    instance.setOption(buildHeatmapOption(chart, rows), true)
    const data = instance.getModel().getSeriesByIndex(0).getData()
    assert.equal(data.count(), 2)
    assert.equal(data.get('value', 0), 0)
    assert.equal(data.get('value', 1), 14)
    assert.ok(data.getItemVisual(0, 'style').fill)
    assert.ok(data.getItemVisual(1, 'style').fill)
    instance.setOption(buildHeatmapOption(chart, []), true)
    assert.equal(instance.getModel().getSeriesByIndex(0).getData().count(), 0)
  } finally {
    instance.dispose()
  }
})

test('theme switching preserves configured scale and data bindings', async () => {
  const { applyThemeToCharts } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
  const { getDefaultTheme } = await jiti.import('../src/dataRoom/theme/registry.ts')
  const chart = getInstance('page')
  chart.props.series.min = -20
  chart.props.series.max = 25
  chart.dataset.fields = fields
  applyThemeToCharts([chart], getDefaultTheme('visualScreen'))
  assert.equal(chart.props.series.min, -20)
  assert.equal(chart.props.series.max, 25)
  assert.deepEqual(chart.dataset.fields, fields)
})

test('five opacity bands use upper-exclusive bounds, clamp overflow, and leave labels opaque', async () => {
  const echarts = await import('echarts')
  const chart = getInstance('page')
  chart.dataset.code = 'live'
  chart.dataset.fields = fields
  chart.props.series.backgroundColor = '#2468ac'
  chart.props.series.segments = 5
  const values = [-1, 0, 19.99, 20, 40, 60, 80, 100, 101]
  const input = values.map((count, index) => ({ hour: String(index), day: 'A', count }))
  const option = buildHeatmapOption(chart, input)
  assert.equal(option.visualMap.show, false)
  assert.equal(option.visualMap.type, 'piecewise')
  const instance = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 600, height: 360 })
  try {
    instance.setOption(option, true)
    const data = instance.getModel().getSeriesByIndex(0).getData()
    assert.deepEqual(
      values.map((_, i) => echarts.color.parse(data.getItemVisual(i, 'style').fill)[3]),
      [0.2, 0.2, 0.2, 0.4, 0.6, 0.8, 1, 1, 1],
    )
    assert.equal(option.series[0].itemStyle.opacity, undefined)
    assert.equal(option.series[0].label.fontSize, 14)
    assert.deepEqual(echarts.color.parse(option.series[0].label.color), [255, 255, 255, 1])
    assert.equal(option.series[0].itemStyle.borderWidth, 0)
  } finally {
    instance.dispose()
  }
})

test('segment count is configurable and rejects fractions or zero', () => {
  const chart = getInstance('page')
  chart.props.series.segments = 2
  assert.equal(buildHeatmapOption(chart, []).visualMap.pieces.length, 2)
  for (const segments of [0, -1, 1.5, NaN, Infinity]) {
    chart.props.series.segments = segments
    assert.throws(() => buildHeatmapOption(chart, []), /分段数/)
  }
})

test('sample data produces a complete five-by-five grid including zero', () => {
  const option = buildHeatmapOption(getInstance('page'), mockDataset.dataset)
  assert.equal(option.xAxis.data.length, 5)
  assert.equal(option.yAxis.data.length, 5)
  assert.equal(option.series[0].data.length, 25)
  assert.ok(option.series[0].data.some((item) => item[2] === 0))
})

test('saved heatmaps retain range, border and labels when upgrading the old color-list configuration', async () => {
  const { upgradeHeatmapProps } = await jiti.import('../src/dataRoom/components/DrHeatmapChart/heatmap-config.ts')
  const chart = getInstance('page')
  delete chart.props.series.backgroundColor
  delete chart.props.series.segments
  delete chart.props.series.min
  delete chart.props.series.max
  chart.props.visualMap = { min: -20, max: 80, colors: ['#2468ac'], show: true }
  chart.props.series.borderWidth = 2
  chart.props.series.label.fontSize = 16
  upgradeHeatmapProps(chart.props)
  assert.equal(chart.props.series.min, -20)
  assert.equal(chart.props.series.max, 80)
  assert.equal(chart.props.series.backgroundColor, '#2468ac')
  assert.equal(chart.props.series.segments, 5)
  assert.equal(chart.props.series.borderWidth, 2)
  assert.equal(chart.props.series.label.fontSize, 16)
  assert.equal(buildHeatmapOption(chart, []).visualMap.show, false)
  assert.equal(chart.props.visualMap, undefined)
  chart.props.series.segments = 3
  upgradeHeatmapProps(chart.props)
  assert.equal(chart.props.series.segments, 3)
})

test('axis names have independent font styles without changing category label styles', () => {
  const chart = getInstance('page')
  chart.props.xAxis.nameTextStyle = { fontSize: 18, color: '#123456' }
  chart.props.yAxis.nameTextStyle = { fontSize: 20, color: '#654321' }
  const option = buildHeatmapOption(chart, [])
  assert.deepEqual(option.xAxis.nameTextStyle, { fontSize: 18, color: '#123456' })
  assert.deepEqual(option.yAxis.nameTextStyle, { fontSize: 20, color: '#654321' })
  assert.equal(option.xAxis.axisLabel.fontSize, 12)
  assert.equal(option.yAxis.axisLabel.fontSize, 12)
})

test('older configurations gain axis-name styles while preserving existing styles', async () => {
  const { upgradeHeatmapProps } = await jiti.import('../src/dataRoom/components/DrHeatmapChart/heatmap-config.ts')
  const chart = getInstance('page')
  delete chart.props.xAxis.nameTextStyle
  chart.props.yAxis.nameTextStyle = { fontSize: 20, color: '#123456' }
  upgradeHeatmapProps(chart.props)
  assert.equal(chart.props.xAxis.nameTextStyle.fontSize, 12)
  assert.ok(chart.props.xAxis.nameTextStyle.color)
  assert.deepEqual(chart.props.yAxis.nameTextStyle, { fontSize: 20, color: '#123456' })
})

test('sample intensity bands are scattered across both axes', () => {
  const option = buildHeatmapOption(getInstance('page'), mockDataset.dataset)
  // 每行、每列都涵盖五个区间，避免整行或整列同色。
  for (let coordinate = 0; coordinate < 5; coordinate++) {
    for (const axis of [0, 1]) {
      const bands = option.series[0].data.filter((item) => item[axis] === coordinate).map((item) => Math.min(4, Math.floor(item[2] / 20)))
      assert.equal(new Set(bands).size, 5)
    }
  }
})
