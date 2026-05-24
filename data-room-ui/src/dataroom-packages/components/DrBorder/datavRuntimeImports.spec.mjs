import {readFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const uiRoot = resolve(__dirname, '../../../../')
const viteConfig = readFileSync(resolve(uiRoot, 'vite.config.ts'), 'utf8')
const borderBox1 = readFileSync(
  resolve(uiRoot, 'src/dataroom-packages/datav/components/BorderBox1/src/BorderBox1.tsx'),
  'utf8',
)
const decoration1 = readFileSync(
  resolve(uiRoot, 'src/dataroom-packages/datav/components/Decoration1/src/index.vue'),
  'utf8',
)

assert(
  /\bref<|\bref\(/.test(borderBox1) && /\btoRef\(/.test(borderBox1),
  'BorderBox TSX relies on Vue runtime APIs that are not explicitly imported in the copied DataV source',
)
assert(
  /\bref<|\bref\(/.test(decoration1) && /\breactive\(/.test(decoration1) && /\bwatch\(/.test(decoration1),
  'Decoration SFC relies on Vue runtime APIs that are not explicitly imported in the copied DataV source',
)

assert(
  /AutoImport\(\s*\{[\s\S]*imports:\s*\[[\s\S]*['"]vue['"][\s\S]*\]/.test(viteConfig),
  'Vite AutoImport must include the vue preset so copied DataV TSX/SFC files receive runtime imports for ref/reactive/watch/toRef',
)
