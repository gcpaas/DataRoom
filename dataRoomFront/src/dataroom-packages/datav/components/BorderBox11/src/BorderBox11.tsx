import type { ExtractPropTypes } from 'vue'
import { defineComponent, renderSlot } from 'vue'
import { borderBoxProps } from '@/dataroom-packages/datav/types/BorderProps'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'
import { uuid } from '@/dataroom-packages/datav/utils'
import { useMergedColor } from '@/dataroom-packages/datav/composables/useMergedColor'
import { fade } from '@jiaminghi/color'
import './index.less'

const borderBox11Props = {
  ...borderBoxProps,
  title: {
    type: String,
    default: '',
  },
  titleWidth: {
    type: Number,
    default: 250,
  },
  animate: {
    type: Boolean,
    default: true,
  },
}

export type BorderBox11Props = ExtractPropTypes<typeof borderBox11Props>

const defaultColor = ['#8aaafb', '#1f33a2']

export default defineComponent({
  props: borderBox11Props,
  setup(props: BorderBox11Props) {
    const id = uuid()
    const borderBox11 = ref(null)

    const { width, height, initWH } = autoResize(borderBox11)

    const filterId = ref(`border-box-11-filterId-${id}`)

    const mergedColor = useMergedColor(defaultColor, toRef(props, 'color'))

    return {
      width,
      height,
      initWH,
      filterId,
      mergedColor,
      borderBox11,
    }
  },
  render() {
    const { $slots, width, height, filterId, mergedColor, backgroundColor, title, titleWidth, animate } = this
    return (
      <div ref="borderBox11" class="dv-border-box-11">
        <svg class="dv-border-svg-container" width={width} height={height}>
          <defs>
            <filter id={filterId} height="150%" width="150%" x="-25%" y="-25%">
              <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />
              <feGaussianBlur in="thicken" stdDeviation="3" result="blurred" />
              <feFlood flood-color={mergedColor[1]} result="glowColor" />
              <feComposite in="glowColor" in2="blurred" operator="in" result="softGlowColored" />
              <feMerge>
                <feMergeNode in="softGlowColored" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <polygon
            fill={backgroundColor} points={`
        20, 32 ${width * 0.5 - titleWidth / 2}, 32 ${width * 0.5 - titleWidth / 2 + 20}, 53
        ${width * 0.5 + titleWidth / 2 - 20}, 53 ${width * 0.5 + titleWidth / 2}, 32
        ${width - 20}, 32 ${width - 8}, 48 ${width - 8}, ${height - 25} ${width - 20}, ${height - 8}
        20, ${height - 8} 8, ${height - 25} 8, 50
      `}
          />

          <polyline
            stroke={mergedColor[0]}
            filter={`url(#${filterId})`}
            points={`
          ${(width - titleWidth) / 2}, 30
          20, 30 7, 50 7, ${50 + (height - 167) / 2}
          13, ${55 + (height - 167) / 2} 13, ${135 + (height - 167) / 2}
          7, ${140 + (height - 167) / 2} 7, ${height - 27}
          20, ${height - 7} ${width - 20}, ${height - 7} ${width - 7}, ${height - 27}
          ${width - 7}, ${140 + (height - 167) / 2} ${width - 13}, ${135 + (height - 167) / 2}
          ${width - 13}, ${55 + (height - 167) / 2} ${width - 7}, ${50 + (height - 167) / 2}
          ${width - 7}, 50 ${width - 20}, 30 ${(width + titleWidth) / 2}, 30
          ${(width + titleWidth) / 2 - 20}, 7 ${(width - titleWidth) / 2 + 20}, 7
          ${(width - titleWidth) / 2}, 30 ${(width - titleWidth) / 2 + 20}, 52
          ${(width + titleWidth) / 2 - 20}, 52 ${(width + titleWidth) / 2}, 30
        `}
          />

          <polygon
            stroke={mergedColor[0]}
            fill="transparent"
            points={`
          ${(width + titleWidth) / 2 - 5}, 30 ${(width + titleWidth) / 2 - 21}, 11
          ${(width + titleWidth) / 2 - 27}, 11 ${(width + titleWidth) / 2 - 8}, 34
        `}
          />

          <polygon
            stroke={mergedColor[0]}
            fill="transparent"
            points={`
          ${(width - titleWidth) / 2 + 5}, 30 ${(width - titleWidth) / 2 + 22}, 49
          ${(width - titleWidth) / 2 + 28}, 49 ${(width - titleWidth) / 2 + 8}, 26
        `}
          />

          <polygon
            stroke={mergedColor[0]}
            fill={fade(mergedColor[1] || defaultColor[1], 30)}
            filter={`url(#${filterId})`}
            points={`
          ${(width + titleWidth) / 2 - 11}, 37 ${(width + titleWidth) / 2 - 32}, 11
          ${(width - titleWidth) / 2 + 23}, 11 ${(width - titleWidth) / 2 + 11}, 23
          ${(width - titleWidth) / 2 + 33}, 49 ${(width + titleWidth) / 2 - 22}, 49
        `}
          />

          <polygon
            filter={`url(#${filterId})`}
            fill={mergedColor[0]}
            opacity="1"
            points={`
          ${(width - titleWidth) / 2 - 10}, 37 ${(width - titleWidth) / 2 - 31}, 37
          ${(width - titleWidth) / 2 - 25}, 46 ${(width - titleWidth) / 2 - 4}, 46
        `}
          >
            { animate
              && <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            }
          </polygon>

          <polygon
            filter={`url(#${filterId})`}
            fill={mergedColor[0]}
            opacity="0.7"
            points={`
          ${(width - titleWidth) / 2 - 40}, 37 ${(width - titleWidth) / 2 - 61}, 37
          ${(width - titleWidth) / 2 - 55}, 46 ${(width - titleWidth) / 2 - 34}, 46
        `}
          >
            { animate
              && <animate
                attributeName="opacity"
                values="0.7;0.4;0.7"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            }
          </polygon>

          <polygon
            filter={`url(#${filterId})`}
            fill={mergedColor[0]}
            opacity="0.5"
            points={`
          ${(width - titleWidth) / 2 - 70}, 37 ${(width - titleWidth) / 2 - 91}, 37
          ${(width - titleWidth) / 2 - 85}, 46 ${(width - titleWidth) / 2 - 64}, 46
        `}
          >
            { animate
              && <animate
                attributeName="opacity"
                values="0.5;0.2;0.5"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            }
          </polygon>

          <polygon
            filter={`url(#${filterId})`}
            fill={mergedColor[0]}
            opacity="1"
            points={`
          ${(width + titleWidth) / 2 + 30}, 37 ${(width + titleWidth) / 2 + 9}, 37
          ${(width + titleWidth) / 2 + 3}, 46 ${(width + titleWidth) / 2 + 24}, 46
        `}
          >
            { animate
              && <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            }
          </polygon>

          <polygon
            filter={`url(#${filterId})`}
            fill={mergedColor[0]}
            opacity="0.7"
            points={`
          ${(width + titleWidth) / 2 + 60}, 37 ${(width + titleWidth) / 2 + 39}, 37
          ${(width + titleWidth) / 2 + 33}, 46 ${(width + titleWidth) / 2 + 54}, 46
        `}
          >
            { animate
              && <animate
                attributeName="opacity"
                values="0.7;0.4;0.7"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            }
          </polygon>

          <polygon
            filter={`url(#${filterId})`}
            fill={mergedColor[0]}
            opacity="0.5"
            points={`
          ${(width + titleWidth) / 2 + 90}, 37 ${(width + titleWidth) / 2 + 69}, 37
          ${(width + titleWidth) / 2 + 63}, 46 ${(width + titleWidth) / 2 + 84}, 46
        `}
          >
            { animate
              && <animate
                attributeName="opacity"
                values="0.5;0.2;0.5"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            }
          </polygon>

          <text
            class="dv-border-box-11-title"
            x={`${width / 2}`}
            y="32"
            fill="#fff"
            font-size="18"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            { title }
          </text>

          <polygon
            fill={mergedColor[0]}
            filter={`url(#${filterId})`}
            points={`
          7, ${53 + (height - 167) / 2} 11, ${57 + (height - 167) / 2}
          11, ${133 + (height - 167) / 2} 7, ${137 + (height - 167) / 2}
        `}
          />

          <polygon
            fill={mergedColor[0]}
            filter={`url(#${filterId})`}
            points={`
          ${width - 7}, ${53 + (height - 167) / 2} ${width - 11}, ${57 + (height - 167) / 2}
          ${width - 11}, ${133 + (height - 167) / 2} ${width - 7}, ${137 + (height - 167) / 2}
        `}
          />
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
