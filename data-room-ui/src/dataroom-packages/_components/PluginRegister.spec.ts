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

const pluginRegisterSource = readFileSync(new URL('./PluginRegister.ts', import.meta.url), 'utf-8')

assert(
  !pluginRegisterSource.includes('DrAnalysisTable'),
  'should not register DrAnalysisTable in the component library'
)
assert(
  !existsSync(new URL('../components/DrAnalysisTable', import.meta.url)),
  'should delete the DrAnalysisTable implementation directory'
)
