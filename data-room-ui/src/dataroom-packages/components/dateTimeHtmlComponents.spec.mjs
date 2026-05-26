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

const components = [
  {
    name: 'DrDateTime',
    title: '时间',
    tag: 'ComponentLibTagTypeConst.TEXT',
    plugin: 'DrDateTimePlugin',
    files: ['time-format.ts', 'install.ts', 'index.vue', 'panel/index.vue', 'plugin.ts', 'images/time.svg'],
    requiredHelpers: ['formatDateTime', 'dateTimeFormatOptions'],
  },
  {
    name: 'DrHtml',
    title: 'HTML',
    tag: 'ComponentLibTagTypeConst.MEDIA',
    plugin: 'DrHtmlPlugin',
    files: ['html-render.ts', 'install.ts', 'index.vue', 'panel/index.vue', 'plugin.ts', 'images/html.svg'],
    requiredHelpers: ['getPlaceholderPaths', 'substitutePlaceholders', 'sanitizeHtmlFragment', 'buildHtmlSrcdoc'],
  },
]

for (const item of components) {
  const dir = resolve(componentRoot, item.name)
  assert(existsSync(dir), `${item.name} directory must exist`)

  for (const file of item.files) {
    assert(existsSync(resolve(dir, file)), `${item.name} must provide ${file}`)
  }

  const installSource = readFileSync(resolve(dir, 'install.ts'), 'utf8')
  assert(installSource.includes(`'${item.name}'`) || installSource.includes(`"${item.name}"`), `${item.name} install.ts must register its own type`)
  assert(installSource.includes(`title: '${item.title}'`) || installSource.includes(`title: "${item.title}"`), `${item.name} default title must be ${item.title}`)
  assert(/export\s*\{[\s\S]*component[\s\S]*controlPanel[\s\S]*getInstance[\s\S]*behaviors[\s\S]*datasetFields[\s\S]*\}/.test(installSource), `${item.name} install.ts must export auto-install contract`)

  const panelSource = readFileSync(resolve(dir, 'panel/index.vue'), 'utf8')
  assert(panelSource.includes('chartConfigPanel.scss'), `${item.name} panel must import shared config panel styles`)
  assert(!/:deep\(\.el-/.test(panelSource), `${item.name} panel must not override Element Plus internals`)
  assert(!/::v-deep|\/deep\/|>>>/.test(panelSource), `${item.name} panel must not use deprecated deep selectors`)
  assert(!/!important/.test(panelSource), `${item.name} panel must not use !important`)

  const helperSource = readFileSync(resolve(dir, item.name === 'DrDateTime' ? 'time-format.ts' : 'html-render.ts'), 'utf8')
  for (const helper of item.requiredHelpers) {
    assert(helperSource.includes(`export const ${helper}`) || helperSource.includes(`export function ${helper}`), `${item.name} helper file must export ${helper}`)
  }
}

const registerSource = readFileSync(resolve(componentRoot, '../_components/PluginRegister.ts'), 'utf8')
for (const item of components) {
  assert(registerSource.includes(item.plugin), `PluginRegister must import ${item.plugin}`)
  assert(registerSource.includes(`new ${item.plugin}([${item.tag}])`), `PluginRegister must add ${item.plugin} to ${item.tag}`)
}

const packageSource = readFileSync(resolve(componentRoot, '../../../package.json'), 'utf8')
assert(packageSource.includes('"@codemirror/lang-html"'), 'package.json must include @codemirror/lang-html')
assert(packageSource.includes('"@codemirror/lang-css"'), 'package.json must include @codemirror/lang-css')
