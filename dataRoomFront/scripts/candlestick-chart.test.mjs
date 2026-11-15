import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url, { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false })
const { buildCandlestickData } = await jiti.import('../src/dataRoom/components/DrCandlestickChart/option.ts')
const fields = { time: 'day', open: 'o', close: 'c', low: 'l', high: 'h' }
const rows = [
  { day: '2026-11-13', o: '108', c: 103, l: 101, h: 112 },
  { day: '2026-11-12', o: 100, c: 108, l: 98, h: 110 },
]
assert.deepEqual(buildCandlestickData(rows, fields), {
  categories: ['2026-11-12', '2026-11-13'], values: [[100, 108, 98, 110], [108, 103, 101, 112]],
})
assert.equal(rows[0].day, '2026-11-13', '排序不得改变数据集原数组')
assert.deepEqual(buildCandlestickData([], fields), { categories: [], values: [] })
assert.deepEqual(buildCandlestickData(rows, { ...fields, open: '' }), { categories: [], values: [] })
for (const o of [null, undefined, '', ' ', true, 'abc', Infinity]) {
  assert.equal(buildCandlestickData([{ ...rows[0], o }], fields).values.length, 0)
}
assert.equal(buildCandlestickData([{ ...rows[0], l: 111 }], fields).values.length, 0)
assert.deepEqual(buildCandlestickData([{ day: 0, o: 0, c: 0, l: 0, h: 0 }], fields).values, [[0, 0, 0, 0]])
console.log('candlestick data tests passed')
const { buildCandlestickOption } = await jiti.import('../src/dataRoom/components/DrCandlestickChart/option.ts')
const props = {
  series: { upColor: '#eb5454', downColor: '#47b262', upHollow: false, downHollow: false, barMaxWidth: 20 },
  xAxis: { show: true, labelShow: true, fontSize: 16, color: '#112233' }, yAxis: { show: true, labelShow: true, splitLineShow: true, splitLineWidth: 3, splitLineColor: '#778899', splitLineType: 'solid', fontSize: 18, color: '#445566' },
  tooltip: { show: true, backgroundColor: '#123456', borderColor: '#654321', textStyle: { fontSize: 15, color: '#abcdef' } },
}
const palette = { up: 'up', down: 'down', hollow: 'empty', text: '', border: '', background: '' }
const data = buildCandlestickData(rows, fields)
const option = buildCandlestickOption(props, data, palette)
assert.deepEqual(option.series[0].data, [[100, 108, 98, 110], [108, 103, 101, 112]])
assert.equal(option.yAxis.scale, true)
assert.deepEqual(option.yAxis.splitLine.lineStyle, { width: 3, color: '#778899', type: 'solid' })
assert.equal(option.xAxis.axisLabel.fontSize, 16)
assert.equal(option.xAxis.axisLabel.color, '#112233')
assert.equal(option.yAxis.axisLabel.fontSize, 18)
assert.equal(option.yAxis.axisLabel.color, '#445566')
assert.equal(option.tooltip.backgroundColor, '#123456')
assert.equal(option.tooltip.borderColor, '#654321')
assert.deepEqual(option.tooltip.textStyle, { fontSize: 15, color: '#abcdef' })
assert.equal(option.tooltip.renderMode, 'richText')
assert.equal(option.tooltip.formatter([{ dataIndex: 0 }]), '2026-11-12\n开盘：100\n收盘：108\n最低：98\n最高：110')
assert.deepEqual(option.dataZoom, [])
props.series.upHollow = true
props.tooltip.show = false
props.xAxis.labelShow = false
props.yAxis.splitLineShow = false
props.yAxis.splitLineWidth = 5
props.yAxis.splitLineColor = '#987654'
const changed = buildCandlestickOption(props, data, palette)
assert.equal(changed.series[0].itemStyle.color, 'empty')
assert.equal(changed.series[0].itemStyle.color0, '#47b262')
assert.equal(changed.series[0].itemStyle.borderColor, '#eb5454')
assert.equal(changed.tooltip.show, false)
assert.equal(changed.yAxis.splitLine.show, false)
assert.deepEqual(changed.yAxis.splitLine.lineStyle, { width: 5, color: '#987654', type: 'solid' })
assert.equal(changed.xAxis.axisLabel.show, false)
assert.deepEqual(changed.dataZoom, [])
assert.deepEqual(buildCandlestickOption(props, buildCandlestickData([], fields), palette).series[0].data, [])
console.log('candlestick option tests passed')
const { getInstance } = await jiti.import('../src/dataRoom/components/DrCandlestickChart/install.ts')
for (const pageType of ['page', 'visualScreen']) {
  const config = getInstance(pageType)
  assert.equal(config.props.series.upColor.includes('var('), false)
  assert.equal(config.props.series.downColor.includes('var('), false)
  assert.equal('zoom' in config.props, false)
  assert.ok(config.props.tooltip.textStyle.fontSize > 0)
}
console.log('candlestick defaults tests passed')
