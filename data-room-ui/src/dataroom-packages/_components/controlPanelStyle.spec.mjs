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

const collapseContentPaddingRule =
  /:deep\(\.el-collapse-item__content\)\s*\{[^}]*padding:\s*var\(--space-3\)/s

assert(
  collapseContentPaddingRule.test(source),
  'component config collapse content should reserve top/bottom padding so shadow borders are not clipped'
)
