import { defineComponent, renderSlot } from 'vue'
import type { BorderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import { borderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { useMergedColor } from '@/dataroom-packages/datav/composables/useMergedColor'
import './index.less'

const defaultColor = ['#fff', 'rgba(255, 255, 255, 0.6)']

export default defineComponent({
  props: borderBoxProps,
  setup(props: BorderBoxProps) {
    const borderBox2 = ref<HTMLElement | null>(null)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    const { width, height, initWH } = autoResize(borderBox2)

    return {
      width,
      height,
      initWH,
      mergedColor,
      borderBox2,
    }
  },
  render() {
    const { $slots, backgroundColor, width, height, mergedColor } = this
    return (
      <div ref="borderBox2" class="dv-border-box-2">
        <svg class="dv-border-svg-container" width={width} height={height}>
          <polygon
            fill={backgroundColor} points={`
        7, 7 ${width - 7}, 7 ${width - 7}, ${height - 7} 7, ${height - 7}
      `}
          />

          <polyline
            stroke={mergedColor[0]}
            points={`2, 2 ${width - 2} ,2 ${width - 2}, ${height - 2} 2, ${height - 2} 2, 2`}
          />
          <polyline
            stroke={mergedColor[1]}
            points={`6, 6 ${width - 6}, 6 ${width - 6}, ${height - 6} 6, ${height - 6} 6, 6`}
          />
          <circle fill={mergedColor[0]} cx="11" cy="11" r="1" />
          <circle fill={mergedColor[0]} cx={width - 11} cy="11" r="1" />
          <circle fill={mergedColor[0]} cx={width - 11} cy={height - 11} r="1" />
          <circle fill={mergedColor[0]} cx="11" cy={height - 11} r="1" />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
