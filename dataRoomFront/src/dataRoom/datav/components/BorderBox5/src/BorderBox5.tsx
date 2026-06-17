import type { ExtractPropTypes } from 'vue'
import { defineComponent, renderSlot } from 'vue'
import { borderBoxProps } from '@/dataRoom/datav/types/BorderProps'
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { useMergedColor } from '@/dataRoom/datav/composables/useMergedColor'
import './index.less'

const borderBox5Props = {
  ...borderBoxProps,
  reverse: {
    type: Boolean,
    default: false,
  },
}

export type BorderBox5Props = ExtractPropTypes<typeof borderBox5Props>

const defaultColor = ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.20)']

export default defineComponent({
  props: borderBox5Props,
  setup(props: BorderBox5Props) {
    const borderBox5 = ref<HTMLElement | null>(null)

    const { width, height, initWH } = autoResize(borderBox5)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      initWH,
      mergedColor,
      borderBox5,
    }
  },
  render() {
    const { $slots, width, height, mergedColor, backgroundColor, reverse } = this
    return (
      <div ref="borderBox5" class="dv-border-box-5">
        <svg class={`dv-border-svg-container  ${reverse && 'dv-reverse'}`} width={width} height={height}>
          <polygon
            fill={backgroundColor} points={`
            10, 22 ${width - 22}, 22 ${width - 22}, ${height - 86} ${width - 84}, ${height - 24} 10, ${height - 24}
          `}
          />

          <polyline
            class="dv-bb5-line-1"
            stroke={mergedColor[0]}
            points={`8, 5 ${width - 5}, 5 ${width - 5}, ${height - 100}
          ${width - 100}, ${height - 5} 8, ${height - 5} 8, 5`}
          />
          <polyline
            class="dv-bb5-line-2"
            stroke={mergedColor[1]}
            points={`3, 5 ${width - 20}, 5 ${width - 20}, ${height - 60}
          ${width - 74}, ${height - 5} 3, ${height - 5} 3, 5`}
          />
          <polyline class="dv-bb5-line-3" stroke={mergedColor[1]} points={`50, 13 ${width - 35}, 13`} />
          <polyline class="dv-bb5-line-4" stroke={mergedColor[1]} points={`15, 20 ${width - 35}, 20`} />
          <polyline class="dv-bb5-line-5" stroke={mergedColor[1]} points={`15, ${height - 20} ${width - 110}, ${height - 20}`} />
          <polyline class="dv-bb5-line-6" stroke={mergedColor[1]} points={`15, ${height - 13} ${width - 110}, ${height - 13}`} />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
