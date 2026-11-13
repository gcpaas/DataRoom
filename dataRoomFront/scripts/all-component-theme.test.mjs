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
const { applyThemeToCharts, applyThemeToNewChart, getThemeStyle } = await jiti.import('../src/dataRoom/theme/apply-theme.ts')
const factory = type => jiti.import(`../src/dataRoom/components/${type}/install.ts`)
const at = (object, key) => key.split('.').reduce((value, part) => value?.[part], object)

test('36 个组件显式登记；九套主题切换、序列化和基础配置隔离', async () => {
  const dirs = await readdir(path.join(root, 'dataRoom/components'), { withFileTypes: true })
  const types = []
  for (const dir of dirs.filter(dir => dir.isDirectory())) {
    if ((await readdir(path.join(root, 'dataRoom/components', dir.name))).includes('install.ts')) types.push(dir.name)
  }
  assert.equal(types.length, 36)
  assert.deepEqual([...Object.keys(componentThemeMappings), ...Object.keys(contentOnlyComponents)].sort(), types.sort())
  for (const type of types) {
    const { getInstance } = await factory(type)
    for (const pageType of ['page', 'visualScreen']) {
      const chart = getInstance(pageType)
      // 显式切换主题会清除富文本局部颜色，以切换后的配置作为往返基线。
      if (type === 'DrRichText' || type === 'DrText' || type === 'DrPictorialBarChart') applyThemeToCharts([chart], getDefaultTheme(pageType))
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
      assert.deepEqual(chart.props, initial.props, `${type} 工厂与默认主题应一致`)
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
  assert.equal(table.props.columnStyles[0].color, themes[1].text.primary)
  assert.equal(table.props.columnStyles[0].headerColor, themes[1].text.primary)
  const rich = (await factory('DrRichText')).getInstance('page')
  rich.props.content = { type: 'doc', content: [{ type: 'text', text: '正文', marks: [{ type: 'textStyle', attrs: { color: 'old', fontSize: '20px' } }] }] }
  applyThemeToCharts([rich], themes[1])
  assert.equal(rich.props.content.content[0].text, '正文')
  assert.deepEqual(rich.props.content.content[0].marks[0].attrs, { fontSize: '20px' })
  const custom = (await factory('DrEcharts')).getInstance('page')
  const code = custom.props.option
  delete custom.props.themeStyle
  applyThemeToCharts([custom], themes[1])
  assert.equal(custom.props.themeStyle.text, themes[1].text.primary)
  assert.equal(custom.props.option, code)
})

test('自定义 ECharts 主题保持数据、formatter 和原 option 对象', async () => {
  const { applyCustomChartTheme } = await jiti.import('../src/dataRoom/components/DrEcharts/theme-option.ts')
  const chart = (await factory('DrEcharts')).getInstance('page')
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
  const option = { series: [{ type: 'pie', itemStyle: { color: 'old', borderWidth: 2 }, data: [{ value: 1 }, { value: 2 }] }] }
  const result = applyCustomChartTheme(option, custom.props.themeStyle)
  assert.deepEqual(result.series[0].color, custom.props.themeStyle.colors)
  assert.equal(result.series[0].itemStyle.color, undefined)
  assert.equal(result.series[0].itemStyle.borderWidth, 2)
  assert.equal(option.series[0].itemStyle.color, 'old')
})


test('富文本创建并应用页面主题后保留默认红色加粗，普通文字无局部格式', async () => {
  const { getInstance } = await factory('DrRichText')
  for (const pageType of ['page', 'visualScreen']) {
    for (const theme of themes) {
      const chart = getInstance(pageType)
      // 设计器插入时还会再应用当前页面主题。
      applyThemeToNewChart(chart, theme.id, pageType)
      const [plain, emphasized] = chart.props.content.content[0].content
      assert.deepEqual(plain, { type: 'text', text: '请输入' })
      assert.equal(emphasized.text, '富文本')
      assert.ok(emphasized.marks.some(mark => mark.type === 'bold'))
      assert.equal(emphasized.marks.find(mark => mark.type === 'textStyle').attrs.color, '#ff0000')
      assert.equal(chart.props.color, theme.text.primary)
    }
  }
})


test('普通文本插入未指定主题的画布使用默认文本色，显式主题仍生效', async () => {
  const { getInstance } = await factory('DrText')
  for (const pageType of ['page', 'visualScreen']) {
    const chart = getInstance(pageType)
    assert.equal(chart.props.textStyle.color, '#C9CDD4')
    applyThemeToNewChart(chart, undefined, pageType)
    assert.equal(chart.props.textStyle.color, '#C9CDD4')
    for (const theme of themes) {
      const themed = getInstance(pageType)
      applyThemeToNewChart(themed, theme.id, pageType)
      assert.equal(themed.props.textStyle.color, theme.text.primary)
    }
  }
})
