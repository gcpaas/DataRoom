import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url, { fsCache: false })
const { readLiquidData, liquidRatio } = await jiti.import('../src/dataRoom/components/DrLiquidFill/data.ts')
test('读取首行字段，空数据和未绑定字段不能读取示例值', () => {
  assert.deepEqual(readLiquidData({ data: [{ n: '完成率', v: '75' }] }, 'v', 'n'), { value: 75, title: '完成率' })
  for (const v of [null, '', true, Infinity, 'bad']) assert.equal(readLiquidData([{ v }], 'v').value, null)
  assert.equal(readLiquidData([{ value: 75 }], undefined).value, null)
  assert.deepEqual(readLiquidData([], 'v', 'n'), { value: null, title: '' })
  assert.deepEqual(readLiquidData([{ v: 0 }], 'v', 'n'), { value: 0, title: '' })
})
test('水位支持范围映射、上下界截断及非法范围', () => {
  assert.equal(liquidRatio(75, 0, 100), 0.75)
  assert.equal(liquidRatio(15, 10, 20), 0.5)
  assert.equal(liquidRatio(-1, 0, 100), 0)
  assert.equal(liquidRatio(101, 0, 100), 1)
  for (const args of [
    [null, 0, 100],
    [3, 2, 2],
    [3, 4, 2],
    [Infinity, 0, 100],
  ])
    assert.equal(liquidRatio(...args), 0)
})
test('ECharts 6 支持四种水球形状及销毁', async () => {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const previous = globalThis.self
  globalThis.self = globalThis
  try {
    const echarts = require('echarts')
    require('echarts-liquidfill')
    const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 300, height: 300 })
    try {
      for (const shape of ['circle', 'pin', 'roundRect', 'diamond']) {
        chart.setOption({ series: [{ type: 'liquidFill', shape, data: [0.75, 0.75], waveAnimation: false, animationDuration: 0, animationDurationUpdate: 0 }] }, true)
        assert.equal(chart.getOption().series[0].type, 'liquidFill')
        assert.equal(chart.getOption().series[0].shape, shape)
      }
    } finally {
      chart.dispose()
    }
  } finally {
    if (previous === undefined) delete globalThis.self
    else globalThis.self = previous
  }
})
