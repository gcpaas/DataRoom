import { defineComponent, renderSlot } from 'vue'
import type { BorderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import { borderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { useMergedColor } from '@/dataroom-packages/datav/composables/useMergedColor'
import './index.less'

const border = ['left-top', 'right-top', 'left-bottom', 'right-bottom'] as const
const defaultColor = ['#1d48c4', '#d3e1f8']

export default defineComponent({
  props: borderBoxProps,
  setup(props: BorderBoxProps) {
    const borderBox10 = ref<HTMLElement | null>(null)

    const { width, height, initWH } = autoResize(borderBox10)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      initWH,
      mergedColor,
      borderBox10,
    }
  },
  render() {
    const { $slots, width, height, mergedColor, backgroundColor } = this
    return (
      <div ref="borderBox10" class="dv-border-box-10" style={`box-shadow: inset 0 0 25px 3px ${mergedColor[0]}`}>
        <svg class="dv-border-svg-container" width={width} height={height}>
          <polygon
            fill={backgroundColor} points={`
              4, 0 ${width - 4}, 0 ${width}, 4 ${width}, ${height - 4} ${width - 4}, ${height}
              4, ${height} 0, ${height - 4} 0, 4
            `}
          />
        </svg>
        {
          border.map((item) => {
            return (
              <svg
                width="150px"
                height="150px"
                class={`${item} dv-border-svg-container`}
              >
                <polygon
                  fill={mergedColor[1]}
                  points="40, 0 5, 0 0, 5 0, 16 3, 19 3, 7 7, 3 35, 3"
                />
              </svg>
            )
          })
        }

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
