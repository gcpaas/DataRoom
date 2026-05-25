import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const controlPanelPath = resolve(__dirname, 'ControlPanel.vue')
const source = readFileSync(controlPanelPath, 'utf8')

const groupedConfigPaddingRule = /\.param-item\s*\{[^}]*padding:\s*12px/s

assert(groupedConfigPaddingRule.test(source), 'component config grouped items should reserve padding so borders are not clipped')
