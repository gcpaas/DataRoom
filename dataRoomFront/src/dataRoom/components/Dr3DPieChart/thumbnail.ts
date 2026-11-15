import { getDefaultTheme } from '../../theme/registry'
import { color } from 'echarts'

// 缩略图使用主题数据色；插件只消费最终 URL，后续也可直接替换为 PNG 导入。
const palette = getDefaultTheme('visualScreen').series.colors
const first = palette[0] || getDefaultTheme('visualScreen').color.primary
const second = palette[1] || first
const third = palette[2] || first
export default 'data:image/svg+xml,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
<path fill="${color.lift(first, -0.3)}" d="M20 43 A60 27 0 0 0 140 43 L140 60 A60 27 0 0 1 20 60 Z"/>
<path fill="${first}" d="M80 43 L80 16 A60 27 0 0 1 137 52 Z"/>
<path fill="${second}" d="M80 43 L137 52 A60 27 0 0 1 31 59 Z"/>
<path fill="${third}" d="M80 43 L31 59 A60 27 0 0 1 80 16 Z"/>
</svg>`)
