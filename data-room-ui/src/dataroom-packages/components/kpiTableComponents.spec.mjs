import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const componentRoot = __dirname
const components = ['DrMetricCard', 'DrTrendMetricCard', 'DrPeriodCompareCard', 'DrDataTable', 'DrAnalysisTable']
const pluginRegisterSource = readFileSync(resolve(componentRoot, '../_components/PluginRegister.ts'), 'utf8')

for (const name of components) {
  const dir = resolve(componentRoot, name)
  const installPath = resolve(dir, 'install.ts')
  const indexPath = resolve(dir, 'index.vue')
  const panelPath = resolve(dir, 'panel/index.vue')
  const pluginPath = resolve(dir, 'plugin.ts')

  assert(existsSync(installPath), `${name} must provide install.ts`)
  assert(existsSync(indexPath), `${name} must provide index.vue`)
  assert(existsSync(panelPath), `${name} must provide panel/index.vue`)
  assert(existsSync(pluginPath), `${name} must provide plugin.ts so the component appears in the designer library`)

  const installSource = readFileSync(installPath, 'utf8')
  assert(
    installSource.includes(`'${name}'`) || installSource.includes(`"${name}"`),
    `${name} install.ts must register its own type`,
  )
  assert(
    /export\s*\{[\s\S]*component[\s\S]*controlPanel[\s\S]*getInstance[\s\S]*behaviors[\s\S]*datasetFields[\s\S]*\}/.test(
      installSource,
    ),
    `${name} install.ts must export the auto-install contract`,
  )

  const panelSource = readFileSync(panelPath, 'utf8')
  assert(panelSource.includes('chartConfigPanel.scss'), `${name} panel must import shared config panel styles`)
  assert(!/:deep\(\.el-/.test(panelSource), `${name} panel must not override Element Plus internals`)
  assert(!/!important/.test(panelSource), `${name} panel must not use !important`)

  const pluginSource = readFileSync(pluginPath, 'utf8')
  assert(pluginSource.includes(`'${name}'`) || pluginSource.includes(`"${name}"`), `${name} plugin.ts must register its own type`)
  assert(
    pluginRegisterSource.includes(`${name}Plugin`) && pluginRegisterSource.includes(`new ${name}Plugin`),
    `${name} plugin must be registered in PluginRegister.ts`,
  )
}

assert(pluginRegisterSource.includes('METRIC'), 'PluginRegister.ts must expose a metric category')
assert(pluginRegisterSource.includes('TABLE'), 'PluginRegister.ts must expose a table category')

const sharedUtils = readFileSync(resolve(componentRoot, '_shared/metric-table-utils.ts'), 'utf8')
for (const helper of [
  'normalizeRows',
  'formatMetricValue',
  'calculateChange',
  'resolveComparison',
  'buildColumnsFromRows',
  'aggregateRows',
  'matchConditionalRule',
]) {
  assert(
    sharedUtils.includes(`export const ${helper}`) || sharedUtils.includes(`export function ${helper}`),
    `shared utils must export ${helper}`,
  )
}
