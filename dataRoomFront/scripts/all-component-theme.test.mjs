import assert from 'node:assert/strict'
import test from 'node:test'
import { readdir } from 'node:fs/promises'
import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root = fileURLToPath(new URL('../src', import.meta.url))
const jiti = createJiti(import.meta.url, { alias: { '@': root }, fsCache: false })
const { themes, getDefaultTheme } = await jiti.import('../src/dataRoom/theme/registry.ts')
const { componentThemeMappings, contentOnlyComponents } = await jiti.import('../src/dataRoom/theme/component-mappings.ts')
const { applyThemeToCharts, getThemeStyle } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
const factory = type => jiti.import(`../src/dataRoom/components/${type}/install.ts`)
const at = (object, key) => key.split('.').reduce((value, part) => value?.[part], object)

test('34 个组件显式登记；九套主题切换、序列化和基础配置隔离', async () => {
  const dirs = await readdir(path.join(root, 'dataRoom/components'), { withFileTypes: true })
  const types = []
  for (const dir of dirs.filter(dir => dir.isDirectory())) {
    if ((await readdir(path.join(root, 'dataRoom/components', dir.name))).includes('install.ts')) types.push(dir.name)
  }
  assert.equal(types.length, 34)
  assert.deepEqual([...Object.keys(componentThemeMappings), ...Object.keys(contentOnlyComponents)].sort(), types.sort())
  for (const type of types) {
    const { getInstance } = await factory(type)
    for (const pageType of ['page', 'visualScreen']) {
      const chart = getInstance(pageType)
      // 以显式应用后的配置作为主题切换往返基线，工厂默认样式独立保留。
      applyThemeToCharts([chart], getDefaultTheme(pageType))
      const initial = structuredClone(chart)
      const base = { ...initial }
      delete base.props
      for (const theme of themes) {
        applyThemeToCharts([chart], theme)
        const saved = JSON.parse(JSON.stringify(chart))
        const { props, ...current } = saved
        assert.deepEqual(current, JSON.parse(JSON.stringify(base)), type)
        for (const [key, style] of componentThemeMappings[type] ?? []) {
          assert.deepEqual(at(props, key), getThemeStyle(theme, style), `${type}.${key}`)
        }
      }
      applyThemeToCharts([chart], getDefaultTheme(pageType))
      assert.deepEqual(chart.props, initial.props, `${type} 主题切换往返应一致`)
    }
  }
})

test('特殊结构保留业务字段；旧配置缺失主题字段也可以切换', async () => {
  const gauge = (await factory('DrGauge')).getInstance('page')
  gauge.props.axisLine.colors = [[0.15, 'old'], [0.83, 'old'], [1, 'old']]
  applyThemeToCharts([gauge], themes[1])
  assert.deepEqual(gauge.props.axisLine.colors.map(item => item[0]), [0.15, 0.83, 1])
  const table = (await factory('DrDataTable')).getInstance('page')
  table.props.columnStyles = [{ field: 'sales', width: 97, color: 'old', headerColor: 'old' }]
  applyThemeToCharts([table], themes[1])
  assert.equal(table.props.columnStyles[0].width, 97)
  assert.equal(table.props.columnStyles[0].color, 'old')
  assert.equal(table.props.columnStyles[0].headerColor, 'old')
  const rich = (await factory('DrRichText')).getInstance('page')
  rich.props.content = { type: 'doc', content: [{ type: 'text', text: '正文', marks: [{ type: 'textStyle', attrs: { color: 'old', fontSize: '20px' } }] }] }
  applyThemeToCharts([rich], themes[1])
  assert.equal(rich.props.content.content[0].text, '正文')
  assert.deepEqual(rich.props.content.content[0].marks[0].attrs, { color: 'old', fontSize: '20px' })
  const custom = (await factory('DrEcharts')).getInstance('page')
  const code = custom.props.option
  delete custom.props.themeStyle
  applyThemeToCharts([custom], themes[1])
  assert.equal(custom.props.themeStyle.primary, themes[1].color.primary)
  assert.equal(custom.props.option, code)
})

test('自定义 ECharts 主题保持数据、formatter 和原 option 对象', async () => {
  const { applyCustomChartTheme } = await jiti.import('../src/dataRoom/components/DrEcharts/theme-option.ts')
  const chart = (await factory('DrEcharts')).getInstance('page')
  applyThemeToCharts([chart], themes[1])
  const formatter = value => `值${value}`
  const option = { tooltip: { formatter }, xAxis: [{ type: 'category', data: ['A'], axisLine: { show: false } }], series: [{ type: 'line', data: [5], lineStyle: { width: 4, color: 'old' } }] }
  const result = applyCustomChartTheme(option, chart.props.themeStyle)
  assert.equal(result.tooltip.formatter, formatter)
  assert.deepEqual(result.series[0].data, [5])
  assert.equal(result.series[0].lineStyle.width, 4)
  assert.equal(result.xAxis[0].axisLine.show, false)
  assert.equal(option.series[0].lineStyle.color, 'old')
})

test('HTML 主题变量安全传入 iframe，自定义饼图保留分类色板', async () => {
  const html = (await factory('DrHtml')).getInstance('page')
  const { serializeElementPlusColors } = await jiti.import('../src/dataRoom/components/DrHtml/html-render.ts')
  const css = html.props.css
  applyThemeToCharts([html], themes[1])
  assert.equal(html.props.css, css)
  const serialized = serializeElementPlusColors({
    '--el-text-color-primary': html.props.themeStyle.text,
    '--el-bg-color': html.props.themeStyle.background,
  })
  assert.ok(serialized.includes(`--el-bg-color:${themes[1].background.secondary};`))
  const { applyCustomChartTheme } = await jiti.import('../src/dataRoom/components/DrEcharts/theme-option.ts')
  const custom = (await factory('DrEcharts')).getInstance('page')
  applyThemeToCharts([custom], themes[1])
  const option = { series: [{ type: 'pie', itemStyle: { color: 'old', borderWidth: 2 }, data: [{ value: 1 }, { value: 2 }] }] }
  const result = applyCustomChartTheme(option, custom.props.themeStyle)
  assert.deepEqual(result.series[0].color, custom.props.themeStyle.colors)
  assert.equal(result.series[0].itemStyle.color, undefined)
  assert.equal(result.series[0].itemStyle.borderWidth, 2)
  assert.equal(option.series[0].itemStyle.color, 'old')
})


test('富文本新建使用默认中性色和加粗，切换主题后新增仍使用默认样式', async () => {
  const { getInstance } = await factory('DrRichText')
  for (const pageType of ['page', 'visualScreen']) {
    const defaults = structuredClone(getInstance(pageType).props)
    for (const theme of themes) {
      const existing = getInstance(pageType)
      applyThemeToCharts([existing], theme)
      const chart = getInstance(pageType)
      assert.deepEqual(chart.props, defaults)
      const [plain, emphasized] = chart.props.content.content[0].content
      assert.deepEqual(plain, { type: 'text', text: '请输入' })
      assert.equal(emphasized.text, '富文本')
      assert.ok(emphasized.marks.some(mark => mark.type === 'bold'))
      assert.equal(emphasized.marks.find(mark => mark.type === 'textStyle').attrs.color, '#A8ABB2')
    }
  }
})

test('普通文本默认中性色不受主题切换影响', async () => {
  const { getInstance } = await factory('DrText')
  for (const pageType of ['page', 'visualScreen']) {
    assert.equal(getInstance(pageType).props.textStyle.color, '#A8ABB2')
    for (const theme of themes) {
      const chart = getInstance(pageType)
      applyThemeToCharts([chart], theme)
      assert.equal(chart.props.textStyle.color, '#A8ABB2')
      assert.equal(getInstance(pageType).props.textStyle.color, '#A8ABB2')
    }
  }
})

const { withOpacity } = await jiti.import('../src/dataRoom/theme/color.ts')
test('双模式图表默认中性色一致，主题只改数据色和提示框配色', async () => {
  for (const type of ['DrBarChart', 'DrHorizontalBarChart', 'DrLineChart', 'DrAreaChart', 'DrBubbleChart']) {
    const { getInstance: create } = await factory(type)
    for (const mode of ['page', 'visualScreen']) {
      const chart = create(mode)
      for (const axis of ['xAxis', 'yAxis']) {
        assert.equal(chart.props[axis].axisLabel.color, '#A8ABB2', `${type}.${axis}.axisLabel`)
        assert.equal(chart.props[axis].axisLine.color, '#A8ABB2')
      }
      chart.props.xAxis.axisLabel.color = 'custom-text'
      chart.props.yAxis.axisLine.color = 'custom-line'
      chart.props.series.label.color = 'custom-label'
      const axes = structuredClone([chart.props.xAxis, chart.props.yAxis])
      const label = structuredClone(chart.props.series.label)
      const area = structuredClone(chart.props.series.areaStyle)
      for (const theme of themes) {
        applyThemeToCharts([chart], theme)
        assert.deepEqual([chart.props.xAxis, chart.props.yAxis], axes)
        assert.deepEqual(chart.props.series.label, label)
        assert.deepEqual(chart.props.series.areaStyle, area)
        assert.deepEqual(chart.props.series.colors, theme.series.colors)
        assert.equal(chart.props.tooltip.borderColor, theme.color.primary)
        assert.equal(chart.props.tooltip.backgroundColor, withOpacity(theme.color.primary, 0.6))
        assert.equal(chart.props.tooltip.textStyle.color, '#FFFFFF')
      }
    }
  }
})

test('所有内置提示框支持主题边框与60%不透明背景', async () => {
  for (const type of ['DrBarChart', 'DrHorizontalBarChart', 'DrLineChart', 'DrAreaChart', 'DrBubbleChart', 'DrPieChart', 'DrRadarChart', 'DrMap', 'DrWordCloud', 'DrFunnelChart', 'DrPictorialBarChart', 'DrFullScreen', 'DrDataTable']) {
    const chart = (await factory(type)).getInstance('page')
    assert.ok(chart.props.tooltip, type)
    applyThemeToCharts([chart], themes[1])
    assert.equal(chart.props.tooltip.borderColor, themes[1].color.primary, type)
    assert.equal(chart.props.tooltip.backgroundColor, withOpacity(themes[1].color.primary, 0.6), type)
    assert.equal(chart.props.tooltip.textStyle.color, '#FFFFFF', type)
  }
})

test('主题不覆盖富文本局部样式、条件色、仪表盘区间及表格列颜色', async () => {
  for (const [type, key] of [['DrRichText', 'content'], ['DrMetricCard', 'conditional'], ['DrGauge', 'axisLine'], ['DrDataTable', 'columnStyles']]) {
    const chart = (await factory(type)).getInstance('page')
    const before = structuredClone(chart.props[key])
    for (const theme of themes) {
      applyThemeToCharts([chart], theme)
      assert.deepEqual(chart.props[key], before, type)
    }
  }
})

test('自定义图表不重写文字和坐标轴；提示框使用统一背景、边框与白色文字', async () => {
  const { applyCustomChartTheme } = await jiti.import('../src/dataRoom/components/DrEcharts/theme-option.ts')
  const chart = (await factory('DrEcharts')).getInstance('page')
  applyThemeToCharts([chart], themes[1])
  const option = {
    textStyle: { color: 'body' },
    title: { textStyle: { color: 'title' } },
    legend: { textStyle: { color: 'legend' } },
    xAxis: { axisLabel: { color: 'axis' }, axisLine: { lineStyle: { color: 'line' } } },
    radar: { axisName: { color: 'radar' } },
    tooltip: { textStyle: { color: 'tip' }, formatter: '{c}' },
    series: [{ type: 'line', label: { color: 'label' }, areaStyle: { opacity: 0.27 }, data: [1] }],
  }
  const before = structuredClone(option)
  const result = applyCustomChartTheme(option, chart.props.themeStyle)
  for (const key of ['textStyle', 'title', 'legend', 'xAxis', 'radar']) assert.deepEqual(result[key], before[key])
  assert.deepEqual(result.series[0].label, before.series[0].label)
  assert.equal(result.series[0].areaStyle.opacity, 0.27)
  assert.equal(result.tooltip.textStyle.color, '#FFFFFF')
  assert.equal(result.tooltip.borderColor, themes[1].color.primary)
  assert.equal(result.tooltip.backgroundColor, withOpacity(themes[1].color.primary, 0.6))
  assert.deepEqual(option, before)
})

test('Element Plus 提示框通过公开 popper-style 变量传递背景、边框和文字色', async () => {
  const { tooltipPopperStyle } = await jiti.import('../src/dataRoom/theme/defaults.ts')
  const chart = (await factory('DrFullScreen')).getInstance('page')
  applyThemeToCharts([chart], themes[1])
  assert.deepEqual(tooltipPopperStyle(chart.props.tooltip), {
    '--el-popper-bg-color-dark': withOpacity(themes[1].color.primary, 0.6),
    '--el-text-color-primary': themes[1].color.primary,
    '--el-bg-color': '#FFFFFF',
  })
  const { buildPictorialOption } = await jiti.import('../src/dataRoom/components/DrPictorialBarChart/option.ts')
  const mountain = (await factory('DrPictorialBarChart')).getInstance('page')
  applyThemeToCharts([mountain], themes[1])
  const option = buildPictorialOption(mountain.props, [{ name: 'A', value: 1 }], [null], 400)
  assert.equal(option.tooltip.borderColor, themes[1].color.primary)
  assert.equal(option.tooltip.backgroundColor, withOpacity(themes[1].color.primary, 0.6))
  assert.equal(option.tooltip.textStyle.color, '#FFFFFF')
})
