import { defineComponent, renderSlot } from 'vue'
import type { BorderBoxProps } from '@/dataRoom/datav/types/BorderProps'
import { borderBoxProps } from '@/dataRoom/datav/types/BorderProps'
import autoResize from '@/dataRoom/datav/utils/autoResize'
import { useMergedColor } from '@/dataRoom/datav/composables/useMergedColor'
import './index.less'

const defaultColor = ['rgba(128,128,128,0.3)', 'rgba(128,128,128,0.5)']

export default defineComponent({
  props: borderBoxProps,
  setup(props: BorderBoxProps) {
    const borderBox7 = ref<HTMLElement | null>(null)

    const { width, height, initWH } = autoResize(borderBox7)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      initWH,
      mergedColor,
      borderBox7,
    }
  },
  render() {
    const { $slots, width, height, mergedColor, backgroundColor } = this
    return (
      <div
        ref="borderBox7"
        class="dv-border-box-7"
        style={`box-shadow: inset 0 0 40px ${mergedColor[0]}; border: 1px solid ${mergedColor[0]}; background-color: ${backgroundColor}`}
      >
        <svg class="dv-border-svg-container" width={width} height={height}>
          <polyline class="dv-bb7-line-width-2" stroke={mergedColor[0]} points="0, 25 0, 0 25, 0" />
          <polyline class="dv-bb7-line-width-2" stroke={mergedColor[0]} points={`${width - 25}, 0 ${width}, 0 ${width}, 25`} />
          <polyline class="dv-bb7-line-width-2" stroke={mergedColor[0]} points={`${width - 25}, ${height} ${width}, ${height} ${width}, ${height - 25}`} />
          <polyline class="dv-bb7-line-width-2" stroke={mergedColor[0]} points={`0, ${height - 25} 0, ${height} 25, ${height}`} />

          <polyline class="dv-bb7-line-width-5" stroke={mergedColor[1]} points="0, 10 0, 0 10, 0" />
          <polyline class="dv-bb7-line-width-5" stroke={mergedColor[1]} points={`${width - 10}, 0 ${width}, 0 ${width}, 10`} />
          <polyline class="dv-bb7-line-width-5" stroke={mergedColor[1]} points={`${width - 10}, ${height} ${width}, ${height} ${width}, ${height - 10}`} />
          <polyline class="dv-bb7-line-width-5" stroke={mergedColor[1]} points={`0, ${height - 10} 0, ${height} 10, ${height}`} />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
