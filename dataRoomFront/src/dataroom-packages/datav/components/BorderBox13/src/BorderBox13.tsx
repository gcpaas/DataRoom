import { defineComponent, renderSlot } from 'vue'
import type { BorderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import { borderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { useMergedColor } from '@/dataroom-packages/datav/composables/useMergedColor'
import './index.less'

const defaultColor = ['#6586ec', '#2cf7fe']

export default defineComponent({
  props: borderBoxProps,
  setup(props: BorderBoxProps) {
    const borderBox13 = ref<HTMLElement | null>(null)
    const { width, height, initWH } = autoResize(borderBox13)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      mergedColor,
      initWH,
      borderBox13,
    }
  },
  render() {
    const { $slots, width, height, mergedColor, backgroundColor } = this
    return (
      <div ref="borderBox13" class="dv-border-box-13">
        <svg class="dv-border-svg-container" width={width} height={height}>
          <path
            fill={backgroundColor}
            stroke={mergedColor[0]}
            d={`
          M 5 20 L 5 10 L 12 3  L 60 3 L 68 10
          L ${width - 20} 10 L ${width - 5} 25
          L ${width - 5} ${height - 5} L 20 ${height - 5}
          L 5 ${height - 20} L 5 20
        `}
          />

          <path
            fill="transparent"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="10, 5"
            stroke={mergedColor[0]}
            d="M 16 9 L 61 9"
          />

          <path
            fill="transparent"
            stroke={mergedColor[1]}
            d="M 5 20 L 5 10 L 12 3  L 60 3 L 68 10"
          />

          <path
            fill="transparent"
            stroke={mergedColor[1]}
            d={`M ${width - 5} ${height - 30} L ${width - 5} ${height - 5} L ${width - 30} ${height - 5}`}
          />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
