import {
  getImageMetricBackgroundStyle,
  getImageMetricTextShadow,
  resolveImageMetricValue,
} from './runtime.ts'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const row = {
  amount: 1234.56,
  nested: {
    value: 88,
  },
}

assert(
  resolveImageMetricValue(row, { valueField: ['amount'] }, 0) === 1234.56,
  'should read configured valueField from dataset row',
)
assert(
  resolveImageMetricValue(row, { valueField: ['nested.value'] }, 0) === 88,
  'should read nested valueField path from dataset row',
)
assert(
  resolveImageMetricValue(row, {}, 66) === 66,
  'should fall back to default value when valueField is not configured',
)
assert(
  resolveImageMetricValue({ amount: null }, { valueField: ['amount'] }, 77) === 77,
  'should fall back to default value when dataset value is null',
)

const containStyle = getImageMetricBackgroundStyle('/dataRoom/resource/image/a.png', 'no-repeat-contain', 8)
assert(containStyle.backgroundImage === 'url(/dataRoom/resource/image/a.png)', 'should set background image when url exists')
assert(containStyle.backgroundSize === 'contain', 'contain mode should use background-size contain')
assert(containStyle.backgroundRepeat === 'no-repeat', 'contain mode should not repeat')
assert(containStyle.backgroundPosition === 'center', 'contain mode should center image')
assert(containStyle.borderRadius === '8px', 'should map image border radius')

const stretchStyle = getImageMetricBackgroundStyle('/image.png', 'no-repeat-stretch', 0)
assert(stretchStyle.backgroundSize === '100% 100%', 'stretch mode should fill image area')
assert(stretchStyle.backgroundRepeat === 'no-repeat', 'stretch mode should not repeat')

const repeatXStyle = getImageMetricBackgroundStyle('/image.png', 'repeat-x', 0)
assert(repeatXStyle.backgroundRepeat === 'repeat-x', 'repeat-x mode should repeat horizontally')

assert(
  getImageMetricTextShadow({ enabled: false, color: '', blur: 8, offsetX: 0, offsetY: 0 }) === undefined,
  'disabled glow should not generate text shadow',
)
assert(
  getImageMetricTextShadow({ enabled: true, color: '', blur: 10, offsetX: 1, offsetY: 2 }) ===
    '1px 2px 10px currentColor',
  'glow should default to currentColor when color is empty',
)
assert(
  getImageMetricTextShadow({ enabled: true, color: 'var(--el-color-warning)', blur: 6, offsetX: 0, offsetY: 0 }) ===
    '0px 0px 6px var(--el-color-warning)',
  'glow should use configured color',
)
