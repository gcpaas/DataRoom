import { defineComponent, renderSlot } from 'vue'
import type { BorderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import { borderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { useMergedColor } from '@/dataroom-packages/datav/composables/useMergedColor'
import './index.less'

const defaultColor = ['rgba(255, 255, 255, 0.35)', 'gray']

export default defineComponent({
  props: borderBoxProps,
  setup(props: BorderBoxProps) {
    const borderBox6 = ref<HTMLElement | null>(null)

    const { width, height, initWH } = autoResize(borderBox6)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      initWH,
      mergedColor,
      borderBox6,
    }
  },
  render() {
    const { $slots, width, height, mergedColor, backgroundColor } = this
    return (
      <div ref="borderBox6" class="dv-border-box-6">
        <svg class="dv-border-svg-container" width={width} height={height}>
          <polygon
            fill={backgroundColor} points={`
            9, 7 ${width - 9}, 7 ${width - 9}, ${height - 7} 9, ${height - 7}
            `}
          />

          <circle fill={mergedColor[1]} cx="5" cy="5" r="2" />
          <circle fill={mergedColor[1]} cx={width - 5} cy="5" r="2" />
          <circle fill={mergedColor[1]} cx={width - 5} cy={height - 5} r="2" />
          <circle fill={mergedColor[1]} cx="5" cy={height - 5} r="2" />
          <polyline stroke={mergedColor[0]} points={`10, 4 ${width - 10}, 4`} />
          <polyline stroke={mergedColor[0]} points={`10, ${height - 4} ${width - 10}, ${height - 4}`} />
          <polyline stroke={mergedColor[0]} points={`5, 70 5, ${height - 70}`} />
          <polyline stroke={mergedColor[0]} points={`${width - 5}, 70 ${width - 5}, ${height - 70}`} />
          <polyline stroke={mergedColor[0]} points="3, 10, 3, 50" />
          <polyline stroke={mergedColor[0]} points="7, 30 7, 80" />
          <polyline stroke={mergedColor[0]} points={`${width - 3}, 10 ${width - 3}, 50`} />
          <polyline stroke={mergedColor[0]} points={`${width - 7}, 30 ${width - 7}, 80`} />
          <polyline stroke={mergedColor[0]} points={`3, ${height - 10} 3, ${height - 50}`} />
          <polyline stroke={mergedColor[0]} points={`7, ${height - 30} 7, ${height - 80}`} />
          <polyline stroke={mergedColor[0]} points={`${width - 3}, ${height - 10} ${width - 3}, ${height - 50}`} />
          <polyline stroke={mergedColor[0]} points={`${width - 7}, ${height - 30} ${width - 7}, ${height - 80}`} />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
