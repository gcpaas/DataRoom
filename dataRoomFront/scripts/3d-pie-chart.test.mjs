import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
const jiti = createJiti(import.meta.url, { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) }, fsCache: false })
const { toPieData, sliceData } = await jiti.import('../src/dataRoom/components/Dr3DPieChart/data.ts')
const { sectorFaces } = await jiti.import('../src/dataRoom/components/Dr3DPieChart/geometry.ts')
const { getInstance } = await jiti.import('../src/dataRoom/components/Dr3DPieChart/install.ts')
const { buildPieOption } = await jiti.import('../src/dataRoom/components/Dr3DPieChart/option.ts')

test('聚合重复分类，保留零分类，拒绝负数、空值、布尔、无穷和未绑定字段', () => {
  const rows = [{ n: 'A', v: 20 }, { n: 'A', v: '30' }, { n: 0, v: 0 }, ...[-1, null, '', true, Infinity].map((v) => ({ n: 'invalid', v })), null]
  assert.deepEqual(toPieData(rows, 'n', 'v'), [
    { name: 'A', value: 50 },
    { name: '0', value: 0 },
  ])
  assert.deepEqual(toPieData(rows, '', 'v'), [])
})
test('图例隐藏后重算占比，零值不分配角度，全隐藏不出现 NaN', () => {
  const rows = [
    { name: 'A', value: 3 },
    { name: 'B', value: 1 },
    { name: 'C', value: 0 },
  ]
  const slices = sliceData(rows, {}, -90, 0)
  assert.deepEqual(
    slices.map((s) => s.percent),
    [75, 25, 0],
  )
  assert.ok(Math.abs(slices[1].end - slices[0].start - Math.PI * 2) < 1e-9)
  assert.deepEqual(
    sliceData(rows, { A: false }, -90, 0).map((s) => s.percent),
    [0, 100, 0],
  )
  assert.ok(sliceData(rows, { A: false, B: false }, -90, 0).every((s) => s.start === s.end && s.percent === 0))
  assert.deepEqual(
    sliceData(
      [
        { name: 'A', value: 1e308 },
        { name: 'B', value: 1e308 },
      ],
      {},
      0,
      0,
    ).map((s) => s.percent),
    [50, 50],
  )
})
test('完整环形有内壁、饼图无内壁；零厚度无侧面；跨越整圈边界仍只生成朝向观察者的弧壁', () => {
  const shape = { cx: 200, cy: 150, radius: 100, inner: 55, squash: 0.5, depth: 24 }
  const ring = sectorFaces(-Math.PI / 2, Math.PI * 1.5, shape)
  assert.ok(ring.some((f) => f.kind === 'inner'))
  assert.ok(ring.some((f) => f.kind === 'outer'))
  assert.equal(ring.filter((f) => f.kind === 'top').length, 1)
  assert.ok(sectorFaces(0, Math.PI * 2, { ...shape, inner: 0 }).every((f) => f.kind !== 'inner'))
  assert.deepEqual(sectorFaces(0, 0, shape), [])
  assert.deepEqual(
    sectorFaces(0, Math.PI, { ...shape, depth: 0 }).map((f) => f.kind),
    ['top'],
  )
  assert.ok(ring.flatMap((f) => f.points.flat()).every(Number.isFinite))
})
test('图例、提示框绑定分类，隐藏后提示框占比更新；标签和提示框均可格式化', () => {
  const { props } = getInstance('page')
  const data = [
    { name: '<img>', value: 30 },
    { name: 'B', value: 10 },
  ]
  props.format.decimals = 2
  props.format.suffix = '万元'
  const option = buildPieOption(props, data, 600, 400, { B: false })
  assert.deepEqual(option.legend.data, ['<img>', 'B'])
  assert.equal(option.series.length, 2)
  assert.equal(option.tooltip.renderMode, 'richText')
  assert.equal(option.tooltip.formatter({ seriesIndex: 0, seriesName: '<img>' }), '<img>：30.00万元（100.0%）')
  assert.equal(buildPieOption(props, [], 600, 400).series.length, 0)
})
test('ECharts 6 接受环形/实心、各旋转角度、图例显隐、尺寸变化与清空', async () => {
  const echarts = await import('echarts')
  const chart = echarts.init(null, null, { renderer: 'svg', ssr: true, width: 600, height: 400 })
  try {
    const { props } = getInstance('visualScreen')
    props.animation.enabled = false
    const data = [
      { name: 'A', value: 30 },
      { name: 'B', value: 10 },
    ]
    for (const shape of ['pie', 'ring']) {
      props.pie.shape = shape
      for (const rotation of [0, 90, 270, 360]) {
        props.pie.rotation = rotation
        chart.setOption(buildPieOption(props, data, 600, 400), true)
        const event = chart.getModel().getSeriesByIndex(0).getDataParams(0)
        assert.equal(event.name, 'A')
        assert.equal(event.value, 30)
        assert.ok(
          chart
            .getZr()
            .storage.getDisplayList(true)
            .some((el) => el.type === 'polygon'),
        )
      }
    }
    chart.dispatchAction({ type: 'legendUnSelect', name: 'B' })
    chart.setOption(buildPieOption(props, data, 300, 200, { B: false }), true)
    chart.resize({ width: 300, height: 200 })
    assert.equal(chart.getOption().legend[0].selected.B, false)
    chart.setOption(buildPieOption(props, [], 300, 200), { replaceMerge: ['series'] })
    assert.equal(chart.getOption().series.length, 0)
  } finally {
    chart.dispose()
  }
})

test('数据更新移除前面的分类后，提示框仍按分类标识匹配', () => {
  const { props } = getInstance('page')
  const option = buildPieOption(props, [{ name: 'B', value: 10 }], 600, 400)
  assert.equal(option.tooltip.formatter({ seriesIndex: 1, seriesName: 'B' }), 'B：10（100.0%）')
})

test('配置面板采用公共标题层级与72px左对齐，所有绑定都存在默认值', async () => {
  const { readFile } = await import('node:fs/promises')
  const { parse: parseSfc } = await import('@vue/compiler-sfc')
  const { parse } = await import('@vue/compiler-dom')
  const source = await readFile(new URL('../src/dataRoom/components/Dr3DPieChart/panel/index.vue', import.meta.url), 'utf8')
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
  assert.ok(groups.length >= 3)
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
  assert.ok(bindingCount > 30)
  assert.equal(sfc.descriptor.styles.length, 0, '标题与字段外观交给公共组件与公共样式')
})

test('环形顶面保留孔洞，不覆盖为实心圆；间隔不吞掉极小扇区', () => {
  const p = { cx: 0, cy: 0, radius: 100, inner: 60, squash: 0.5, depth: 20 }
  const points = sectorFaces(0, Math.PI * 2, p).find((f) => f.kind === 'top').points
  const area =
    Math.abs(
      points.reduce((sum, point, i) => {
        const next = points[(i + 1) % points.length]
        return sum + point[0] * next[1] - next[0] * point[1]
      }, 0),
    ) / 2
  assert.ok(Math.abs(area / (Math.PI * (100 ** 2 - 60 ** 2) * 0.5) - 1) < 0.001)
  const slices = sliceData(
    [
      { name: 'small', value: 0.001 },
      { name: 'large', value: 100 },
    ],
    {},
    0,
    15,
  )
  assert.ok(slices[0].end > slices[0].start)
})

test('外侧标签分侧避让，有限空间优先显示较大扇区，标签开关关闭后清空', async () => {
  const { layoutLabels } = await jiti.import('../src/dataRoom/components/Dr3DPieChart/labels.ts')
  const { props } = getInstance('page')
  props.label.minPercent = 0
  props.label.fontSize = 12
  const slices = sliceData(
    Array.from({ length: 20 }, (_, index) => ({ name: String(index), value: index + 1 })),
    {},
    -90,
    0,
  )
  const projection = { cx: 200, cy: 100, radius: 80, inner: 0, squash: 0.5, depth: 20 }
  const bounds = { left: 0, right: 400, top: 60, bottom: 140 }
  const labels = layoutLabels(slices, projection, props, bounds)
  assert.ok(labels.size <= 8)
  assert.ok(labels.size > 0)
  for (const align of ['left', 'right']) {
    const side = [...labels.values()].filter((label) => label.align === align).sort((a, b) => a.y - b.y)
    side.forEach((label, index) => {
      assert.ok(label.y >= 60 && label.y <= 140)
      if (index > 0) assert.ok(label.y - side[index - 1].y >= 20)
    })
  }
  props.label.show = false
  assert.equal(layoutLabels(slices, projection, props, bounds).size, 0)
})

test('直线引导线连接扇区与避让后的标签，应用粗细和颜色；内部标签不画线', async () => {
  const { layoutLabels } = await jiti.import('../src/dataRoom/components/Dr3DPieChart/labels.ts')
  const { props } = getInstance('page')
  const data = Array.from({ length: 12 }, (_, i) => ({ name: String(i), value: i + 1 }))
  const projection = { cx: 200, cy: 100, radius: 80, inner: 0, squash: 0.5, depth: 20 }
  const labels = layoutLabels(sliceData(data, {}, -90, 0), projection, props, { left: 0, right: 400, top: 50, bottom: 150 })
  assert.ok(labels.size > 0)
  for (const label of labels.values()) {
    assert.equal(label.points.length, 2)
    assert.equal(label.points[1][1], label.y)
    assert.equal(Math.abs(label.points[1][0] - label.x), 4)
  }
  props.label.guideLine.width = 3
  props.label.guideLine.color = props.series.colors[1]
  const children = buildPieOption(props, [{ name: 'A', value: 1 }], 600, 400).series[0].renderItem().children
  const line = children.find((child) => child.name === 'guide')
  assert.equal(line.type, 'line')
  assert.equal(line.style.lineWidth, 3)
  assert.equal(line.style.stroke, props.series.colors[1])
  props.label.guideLine.show = false
  assert.ok(
    buildPieOption(props, [{ name: 'A', value: 1 }], 600, 400)
      .series[0].renderItem()
      .children.every((child) => child.name !== 'guide'),
  )
  props.label.guideLine.show = true
  props.label.position = 'inside'
  assert.ok(
    buildPieOption(props, [{ name: 'A', value: 1 }], 600, 400)
      .series[0].renderItem()
      .children.every((child) => child.name !== 'guide'),
  )
})
