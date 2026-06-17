export type DrBorderType =
  | 'BorderBox1'
  | 'BorderBox2'
  | 'BorderBox3'
  | 'BorderBox4'
  | 'BorderBox5'
  | 'BorderBox6'
  | 'BorderBox7'
  | 'BorderBox8'
  | 'BorderBox9'
  | 'BorderBox10'
  | 'BorderBox11'
  | 'BorderBox12'
  | 'BorderBox13'

export type DrBorderDatavProp = 'color' | 'backgroundColor' | 'reverse' | 'dur' | 'title' | 'titleWidth' | 'animate'

export interface DrBorderDatavPropsSource {
  borderType: string
  colors: string[]
  backgroundColor: string
  reverse: boolean
  dur: number | null
  title: string
  titleWidth: number
  animate: boolean
}

export const defaultBorderType: DrBorderType = 'BorderBox1'

export const borderTypeOptions: Array<{ label: string; value: DrBorderType }> = [
  { label: '边框 1', value: 'BorderBox1' },
  { label: '边框 2', value: 'BorderBox2' },
  { label: '边框 3', value: 'BorderBox3' },
  { label: '边框 4', value: 'BorderBox4' },
  { label: '边框 5', value: 'BorderBox5' },
  { label: '边框 6', value: 'BorderBox6' },
  { label: '边框 7', value: 'BorderBox7' },
  { label: '边框 8', value: 'BorderBox8' },
  { label: '边框 9', value: 'BorderBox9' },
  { label: '边框 10', value: 'BorderBox10' },
  { label: '边框 11', value: 'BorderBox11' },
  { label: '边框 12', value: 'BorderBox12' },
  { label: '边框 13', value: 'BorderBox13' },
]

export const borderSupportedProps: Record<DrBorderType, DrBorderDatavProp[]> = {
  BorderBox1: ['color', 'backgroundColor'],
  BorderBox2: ['color', 'backgroundColor'],
  BorderBox3: ['color', 'backgroundColor'],
  BorderBox4: ['color', 'backgroundColor', 'reverse'],
  BorderBox5: ['color', 'backgroundColor', 'reverse'],
  BorderBox6: ['color', 'backgroundColor'],
  BorderBox7: ['color', 'backgroundColor'],
  BorderBox8: ['color', 'backgroundColor', 'reverse', 'dur'],
  BorderBox9: ['color', 'backgroundColor'],
  BorderBox10: ['color', 'backgroundColor'],
  BorderBox11: ['color', 'backgroundColor', 'title', 'titleWidth', 'animate'],
  BorderBox12: ['color', 'backgroundColor'],
  BorderBox13: ['color', 'backgroundColor'],
}

export const normalizeBorderType = (type: string | undefined): DrBorderType => {
  return borderTypeOptions.some((item) => item.value === type) ? type as DrBorderType : defaultBorderType
}

export const isBorderPropSupported = (type: DrBorderType, prop: DrBorderDatavProp) => {
  return borderSupportedProps[type].includes(prop)
}

export const buildBorderDatavProps = (props: DrBorderDatavPropsSource): Record<string, unknown> => {
  const borderType = normalizeBorderType(props.borderType)
  const datavProps: Record<string, unknown> = {
    color: props.colors,
    backgroundColor: props.backgroundColor,
  }

  if (isBorderPropSupported(borderType, 'reverse') && props.reverse !== null) {
    datavProps.reverse = props.reverse
  }
  if (isBorderPropSupported(borderType, 'dur') && props.dur !== null) {
    datavProps.dur = props.dur
  }
  if (isBorderPropSupported(borderType, 'title') && props.title !== null) {
    datavProps.title = props.title
  }
  if (isBorderPropSupported(borderType, 'titleWidth') && props.titleWidth !== null) {
    datavProps.titleWidth = props.titleWidth
  }
  if (isBorderPropSupported(borderType, 'animate') && props.animate !== null) {
    datavProps.animate = props.animate
  }

  return datavProps
}
