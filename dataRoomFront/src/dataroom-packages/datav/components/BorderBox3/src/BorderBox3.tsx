import { defineComponent, renderSlot } from 'vue'
import type { BorderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import { borderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { useMergedColor } from '@/dataroom-packages/datav/composables/useMergedColor'
import './index.less'

const defaultColor = ['#2862b7', '#2862b7']

export default defineComponent({
  props: borderBoxProps,
  setup(props: BorderBoxProps) {
    const borderBox3 = ref<HTMLElement | null>(null)

    const { width, height, initWH } = autoResize(borderBox3)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      mergedColor,
      initWH,
      borderBox3,
    }
  },
  render() {
    const { $slots, width, height, backgroundColor, mergedColor } = this
    return (
      <div ref="borderBox3" class="dv-border-box-3">
        <svg class="dv-border-svg-container" width={width} height={height}>
          <polygon
            fill={backgroundColor} points={`
              23, 23 ${width - 24}, 23 ${width - 24}, ${height - 24} 23, ${height - 24}
            `}
          />

          <polyline
            class="dv-bb3-line1"
            stroke={mergedColor[0]}
            points={`4, 4 ${width - 22} ,4 ${width - 22}, ${height - 22} 4, ${height - 22} 4, 4`}
          />
          <polyline
            class="dv-bb3-line2"
            stroke={mergedColor[1]}
            points={`10, 10 ${width - 16}, 10 ${width - 16}, ${height - 16} 10, ${height - 16} 10, 10`}
          />
          <polyline
            class="dv-bb3-line2"
            stroke={mergedColor[1]}
            points={`16, 16 ${width - 10}, 16 ${width - 10}, ${height - 10} 16, ${height - 10} 16, 16`}
          />
          <polyline
            class="dv-bb3-line2"
            stroke={mergedColor[1]}
            points={`22, 22 ${width - 4}, 22 ${width - 4}, ${height - 4} 22, ${height - 4} 22, 22`}
          />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div >
    )
  },
})
