import type { ExtractPropTypes, PropType } from 'vue'

export const borderBoxProps = {
  color: {
    type: Array as PropType<Array<string>>,
    default: () => ([]),
  },
  backgroundColor: {
    type: String,
    default: 'transparent',
  },
}

export type BorderBoxProps = ExtractPropTypes<typeof borderBoxProps>
