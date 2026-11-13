import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
const jiti = createJiti(import.meta.url, { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false })
const { imageAddress, toPictorialData } = await jiti.import('../src/dataRoom/components/DrPictorialBarChart/data.ts')
const { buildPictorialOption } = await jiti.import('../src/dataRoom/components/DrPictorialBarChart/option.ts')
const { getInstance } = await jiti.import('../src/dataRoom/components/DrPictorialBarChart/install.ts')
test('图片字段支持完整 URL 和素材路径，拒绝执行协议', () => {
  for (const url of ['http://example.com/a.png', 'https://example.com/b.svg', '/dataRoom/resource/file/a.png', 'images/a.png']) assert.equal(imageAddress(` ${url} `), url)
  for (const url of [null, 4, 'javascript:alert(1)', 'data:image/svg+xml,test', '//example.com/a', '\\example.com', 'java\nscript:test']) assert.equal(imageAddress(url), '')
})
test('保留重复分类、零值与顺序；负值和无效值不绘制山峰', () => {
  const rows = toPictorialData([0, { n: '重复', v: 0, img: '/a.png' }, { n: '重复', v: '12' }, { n: '负数', v: -3 }, { n: '空值', v: '' }, { n: '布尔', v: true }, { n: '无穷', v: Infinity }], 'n', 'v', 'img')
  assert.deepEqual(rows.map(r => r.value), [0, 12, null, null, null, null])
  assert.equal(rows[0].image, '/a.png')
  assert.equal(rows[1].name, '重复')
  assert.deepEqual(toPictorialData([], 'n', 'v'), [])
  assert.deepEqual(toPictorialData([{ n: 'a', v: 2 }], undefined, 'v'), [])
})
test('图片保持比例、峰顶对齐、上方预留空间；空数据清空系列', () => {
  const { props } = getInstance('visualScreen')
  const rows = toPictorialData([{ n: 'a', v: 10 }, { n: 'a', v: 0 }, { n: 'c', v: -5 }], 'n', 'v')
  const option = buildPictorialOption(props, rows, [{ url: '/a.png', width: 200, height: 100 }, null, null], 640)
  assert.deepEqual(option.series[1].data[0].symbolSize, [64, 32])
  assert.deepEqual(option.series[1].data[0].symbolOffset, [0, -24])
  assert.deepEqual(option.series[1].data[1].value, [1, 0])
  assert.equal(option.series[0].data[2].value, '-')
  assert.equal(option.grid.top, 88)
  assert.equal(option.tooltip.renderMode, 'richText')
  assert.equal(option.tooltip.formatter({ dataIndex: 0 }), 'a: 10')
  props.label.unit = 'km'
  props.label.decimals = 2
  props.image.show = false
  const changed = buildPictorialOption(props, rows, [], 640)
  assert.equal(changed.tooltip.formatter({ dataIndex: 0 }), 'a: 10.00km')
  assert.equal(changed.series[1].data[0].symbol, 'none')
  assert.deepEqual(buildPictorialOption(props, [], [], 640).series[0].data, [])
})
test('ECharts 无浏览器渲染可初始化山峰系列和重复分类坐标', async () => {
  const echarts = await import('echarts')
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 640, height: 400 })
  try {
    const { props } = getInstance('visualScreen')
    const rows = toPictorialData([{ n: '相同', v: 100 }, { n: '相同', v: 30 }, { n: '零', v: 0 }], 'n', 'v')
    chart.setOption(buildPictorialOption(props, rows, [], 640))
    const first = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [0, 100])
    const second = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [1, 30])
    assert.ok(first[0] < second[0])
    assert.ok(first[1] < second[1])
    assert.ok(first[1] >= props.image.height + props.image.gap)
    assert.equal(chart.getOption().series[0].type, 'pictorialBar')
    chart.setOption(buildPictorialOption(props, [], [], 640), true)
    assert.equal(chart.getOption().series[0].data.length, 0)
  } finally {
    chart.dispose()
  }
})
