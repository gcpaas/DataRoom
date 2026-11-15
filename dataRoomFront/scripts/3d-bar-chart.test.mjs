import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
const jiti = createJiti(import.meta.url, { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false })
const { buildBarData } = await jiti.import('../src/dataRoom/components/Dr3DBarChart/data.ts')
const { getInstance } = await jiti.import('../src/dataRoom/components/Dr3DBarChart/install.ts')
const { buildBarOption } = await jiti.import('../src/dataRoom/components/Dr3DBarChart/option.ts')
const { layoutBars, barGeometry } = await jiti.import('../src/dataRoom/components/Dr3DBarChart/geometry.ts')

test('多指标保留正负零值，重复类目求和，缺失和非法值保持空值', () => {
  const data = buildBarData([{ x: 'a', v: 2, w: -3 }, { x: 'a', v: '3' }, { x: 'b', v: 0, w: '' }, { x: 'c', v: true, w: Infinity }, null], 'x', ['v', 'w'])
  assert.deepEqual(data.categories, ['a', 'b', 'c'])
  assert.deepEqual(
    data.series.map((s) => s.values),
    [
      [5, 0, null],
      [-3, null, null],
    ],
  )
  assert.deepEqual(buildBarData([], 'x', ['v']).categories, [])
})
test('分组支持零和空字符串，多个指标与分组同时绑定时都保留', () => {
  const data = buildBarData(
    [
      { x: 'a', g: 0, v: 2, w: 4 },
      { x: 'b', g: '', v: 3, w: 5 },
    ],
    'x',
    ['v', 'w'],
    'g',
  )
  assert.equal(data.series.length, 4)
  assert.deepEqual(
    data.series.map((s) => s.values),
    [
      [2, null],
      [4, null],
      [null, 3],
      [null, 5],
    ],
  )
})
test('固定柱宽也受槽位限制；多系列不重叠；单系列居中', () => {
  const a = layoutBars(100, 2, 0, { barWidth: 30, barMaxWidth: 40, barGap: '20%', barCategoryGap: '20%' })
  const b = layoutBars(100, 2, 1, { barWidth: 30, barMaxWidth: 40, barGap: '20%', barCategoryGap: '20%' })
  assert.equal(a.width, 30)
  assert.equal(a.offset, -18)
  assert.equal(b.offset, 18)
  assert.equal(layoutBars(100, 1, 0, { barWidth: 30, barMaxWidth: 40, barGap: '20%', barCategoryGap: '20%' }).offset, 0)
  assert.ok(layoutBars(10, 3, 0, { barWidth: 100, barMaxWidth: 100, barGap: '20%', barCategoryGap: '20%' }).width < 3)
})
test('三种形状连接同一基线和端点，零值不绘制悬浮端面', () => {
  for (const shape of ['diamond', 'cylinder', 'cuboid']) {
    const positive = barGeometry(shape, 100, 200, 50, 30, 0.4)
    const negative = barGeometry(shape, 100, 200, 260, 30, 0.4)
    assert.ok(positive.length >= 3)
    assert.ok(negative.length >= 3)
    assert.deepEqual(barGeometry(shape, 100, 200, 200, 30, 0.4), [])
    if (shape === 'cylinder') {
      assert.equal(positive.find((p) => p.name === 'end').shape.cy, 50)
      assert.equal(negative.find((p) => p.name === 'end').shape.cy, 260)
    }
  }
})
test('只有业务系列进入图例和提示框，格式化不产生 HTML', () => {
  const { props } = getInstance('visualScreen')
  const data = buildBarData([{ x: '<img>', v: 2, w: 3 }], 'x', ['v', 'w'])
  props.format.decimals = 2
  props.format.suffix = '元'
  const option = buildBarOption(props, data, { v: false })
  assert.equal(option.series.length, 2)
  assert.deepEqual(option.legend.data, ['v', 'w'])
  assert.equal(option.legend.selected.v, false)
  assert.equal(option.tooltip.renderMode, 'richText')
  assert.equal(option.tooltip.formatter([{ seriesIndex: 1, dataIndex: 0 }]), '<img>\nw：3.00元')
  assert.deepEqual(buildBarOption(props, buildBarData([], 'x', ['v'])).series[0].data, [])
})
test('ECharts 6 SSR 接受所有形状、图例操作、负值、手动范围和尺寸变化', async () => {
  const echarts = await import('echarts')
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 640, height: 400 })
  try {
    const { props } = getInstance('visualScreen')
    props.animation.enabled = false
    const data = buildBarData(
      [
        { x: 'a', v: 100, w: -50 },
        { x: 'b', v: 0, w: null },
      ],
      'x',
      ['v', 'w'],
    )
    for (const shape of ['diamond', 'cylinder', 'cuboid']) {
      props.series.shape = shape
      props.yAxis.range.auto = true
      chart.setOption(buildBarOption(props, data), true)
      assert.equal(chart.getOption().series.length, 2)
      const eventData = chart.getModel().getSeriesByIndex(0).getDataParams(0)
      assert.equal(eventData.name, 'a')
      assert.deepEqual(eventData.value, [0, 100])
      assert.ok(
        chart
          .getZr()
          .storage.getDisplayList(true)
          .some((el) => el.type === (shape === 'cylinder' ? 'ellipse' : 'polygon')),
      )
      chart.dispatchAction({ type: 'legendUnSelect', name: 'v' })
      chart.setOption(buildBarOption(props, data, { v: false }), true)
      assert.equal(chart.getOption().legend[0].selected.v, false)
      chart.resize({ width: 320, height: 240 })
      props.yAxis.range = { auto: false, min: -20, max: 80 }
      chart.setOption(buildBarOption(props, data), true)
    }
    chart.setOption(buildBarOption(props, buildBarData([], 'x', ['v'])), true)
    assert.equal(chart.getOption().series[0].data.length, 0)
  } finally {
    chart.dispose()
  }
})

test('配置面板采用公共标题层级与72px左对齐，所有绑定都存在默认值', async () => {
  const { readFile } = await import('node:fs/promises')
  const { parse: parseSfc } = await import('@vue/compiler-sfc')
  const { parse } = await import('@vue/compiler-dom')
  const source = await readFile(new URL('../src/dataRoom/components/Dr3DBarChart/panel/index.vue', import.meta.url), 'utf8')
  const sfc = parseSfc(source)
  assert.equal(sfc.errors.length, 0)
  const ast = parse(sfc.descriptor.template.content)
  const elements = []
  const visit = (node) => {
    if (node.type === 1) elements.push(node)
    for (const child of node.children || []) visit(child)
  }
  visit(ast)
  const attr = (node, name) => node.props?.find((prop) => prop.type === 6 && prop.name === name)?.value?.content
  const form = elements.find((node) => node.tag === 'el-form')
  assert.equal(attr(form, 'class'), 'dr-config-panel__form')
  assert.equal(attr(form, 'label-width'), '72px')
  assert.equal(attr(form, 'label-position'), 'left')
  assert.ok(elements.some((node) => node.tag === 'ConfigCollapse' && attr(node, 'class') === 'dr-config-panel__section'))
  const groups = elements.filter((node) => node.tag === 'el-form-item')
  assert.ok(groups.length > 5)
  for (const node of groups) {
    const label = node.children.find((child) => child.tag === 'template' && child.props.some((prop) => prop.type === 7 && prop.name === 'slot' && prop.arg?.content === 'label'))
    assert.ok(label?.children.some((child) => attr(child, 'class') === 'dr-config-panel__group-title'))
  }
  const { props } = getInstance('page')
  let bindingCount = 0
  for (const node of elements) {
    for (const prop of node.props) {
      if (prop.type !== 7 || prop.name !== 'model' || !prop.exp.content.startsWith('chartConfig.props.')) continue
      const path = prop.exp.content.replace('chartConfig.props.', '').replace(/\[(\d+)\]/g, '.$1')
      assert.notEqual(
        path.split('.').reduce((value, key) => value?.[key], props),
        undefined,
        `未声明的配置 ${path}`,
      )
      bindingCount++
    }
    assert.ok(!['el-input', 'el-select', 'el-input-number', 'el-color-picker'].includes(node.tag))
  }
  assert.ok(bindingCount > 60)
  assert.equal(sfc.descriptor.styles.length, 0, '标题与字段外观交给公共组件与公共样式')
})

test('渲染合同：端面开关、标签格式、负值方向和空值不产生额外图形', async () => {
  const { createRenderer } = await jiti.import('../src/dataRoom/components/Dr3DBarChart/renderer.ts')
  const { props } = getInstance('page')
  props.series.shape = 'cylinder'
  props.series.label.show = true
  props.format = { prefix: '¥', suffix: '元', decimals: 1 }
  const render = (value) =>
    createRenderer(
      props,
      props.series.colors[0],
      1,
      0,
    )(
      { coordSys: { type: 'cartesian2d', x: 0, y: 0, width: 300, height: 400 } },
      { value: (dim) => (dim === 0 ? 0 : value), coord: (pair) => [150, 200 - pair[1]], size: () => [100, 0] },
    )
  const negative = render(-50)
  assert.equal(negative.children.find((child) => child.name === 'value-label').style.text, '¥-50.0元')
  assert.equal(negative.children.find((child) => child.name === 'value-label').style.verticalAlign, 'top')
  props.series.caps.topShow = false
  props.series.caps.bottomShow = false
  assert.deepEqual(
    render(30)
      .children.map((child) => child.name)
      .sort(),
    ['front', 'value-label'],
  )
  assert.deepEqual(
    render(0).children.map((child) => child.name),
    ['value-label'],
  )
  assert.equal(render(NaN), undefined)
})

test('固定柱宽不再受自动模式上限影响，但仍在空间不足时收缩', () => {
  const sizing = { barWidth: 60, barMaxWidth: 40, barGap: '20%', barCategoryGap: '20%' }
  assert.equal(layoutBars(200, 1, 0, sizing).width, 60)
  assert.equal(layoutBars(200, 1, 0, { ...sizing, barWidth: null }).width, 40)
  assert.equal(layoutBars(50, 1, 0, sizing).width, 40)
})
