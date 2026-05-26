declare const require: (id: string) => {
  existsSync: (path: URL) => boolean
  readFileSync: (path: URL, encoding: 'utf-8') => string
}

const { existsSync, readFileSync } = require('node:fs')

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const componentDir = new URL('./', import.meta.url)
const requiredFiles = ['runtime.ts', 'install.ts', 'index.vue', 'panel/index.vue', 'plugin.ts', 'images/image-metric-card.svg']
const letterSpacingProperty = ['letter', 'spacing'].join('-')
const deepElementPattern = new RegExp([':dee', 'p\\(\\.el-'].join(''))
const deprecatedDeepPattern = new RegExp(`${['::v', 'deep'].join('-')}|/${['dee', 'p'].join('')}/|>{3}`)
const importantFlag = ['!', 'important'].join('')

for (const file of requiredFiles) {
  assert(existsSync(new URL(file, componentDir)), `DrImageMetricCard must provide ${file}`)
}

const installSource = readFileSync(new URL('./install.ts', componentDir), 'utf-8')
assert(installSource.includes('DrImageMetricCardPropsInterface'), 'install.ts must define props interface')
assert(installSource.includes("'DrImageMetricCard'"), 'install.ts must create DrImageMetricCard config')
assert(installSource.includes("title: '图片指标卡'"), 'default title must be 图片指标卡')
assert(installSource.includes("name: 'valueField'"), 'datasetFields must expose only valueField')
assert(!installSource.includes("name: 'descriptionField'"), 'description must not bind dataset field')
assert(!installSource.includes("name: 'unitField'"), 'unit must not bind dataset field')
assert(!installSource.includes("name: 'url'"), 'image url must not bind dataset field')
assert(installSource.includes("method: 'click'"), 'behaviors must define click method')
assert(installSource.includes("name: 'formattedValue'"), 'click payload definition must include formattedValue')

const indexSource = readFileSync(new URL('./index.vue', componentDir), 'utf-8')
assert(indexSource.includes('useDrComponent'), 'index.vue must use common component data flow hook')
assert(indexSource.includes('triggerChartBehavior'), 'index.vue must trigger click behavior')
assert(indexSource.includes('resolveImageMetricValue'), 'index.vue must use runtime value fallback helper')
assert(indexSource.includes('getImageMetricBackgroundStyle'), 'index.vue must use runtime image background helper')
assert(indexSource.includes('getImageMetricTextShadow'), 'index.vue must use runtime text glow helper')
assert(indexSource.includes(`${letterSpacingProperty}: 0`), 'index.vue must keep text letter spacing at 0')
assert(indexSource.includes('font-feature-settings: "tnum"'), 'index.vue must use tabular numbers for metric value')

const pluginSource = readFileSync(new URL('./plugin.ts', componentDir), 'utf-8')
assert(pluginSource.includes('DrImageMetricCardPlugin'), 'plugin.ts must export DrImageMetricCardPlugin')
assert(pluginSource.includes("'图片指标卡'"), 'plugin name must be 图片指标卡')

const panelSource = readFileSync(new URL('./panel/index.vue', componentDir), 'utf-8')
assert(panelSource.includes('chartConfigPanel.scss'), 'panel must import shared config panel styles')
assert(!panelSource.includes(letterSpacingProperty), 'panel must not expose letter spacing configuration')
assert(!deepElementPattern.test(panelSource), 'panel must not override Element Plus internals')
assert(!deprecatedDeepPattern.test(panelSource), 'panel must not use deep selectors')
assert(!panelSource.includes(importantFlag), 'panel must not use important overrides')

const registerSource = readFileSync(new URL('../../_components/PluginRegister.ts', componentDir), 'utf-8')
assert(registerSource.includes('DrImageMetricCardPlugin'), 'PluginRegister must import DrImageMetricCardPlugin')
assert(
  registerSource.includes('new DrImageMetricCardPlugin([ComponentLibTagTypeConst.METRIC])'),
  'PluginRegister must register image metric card under metric tag',
)
