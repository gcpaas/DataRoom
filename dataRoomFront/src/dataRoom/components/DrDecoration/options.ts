export type DrDecorationType =
  | 'Decoration1'
  | 'Decoration2'
  | 'Decoration3'
  | 'Decoration4'
  | 'Decoration5'
  | 'Decoration6'
  | 'Decoration7'
  | 'Decoration8'
  | 'Decoration9'
  | 'Decoration10'
  | 'Decoration11'
  | 'Decoration12'

export type DrDecorationDatavProp = 'color' | 'reverse' | 'dur' | 'scanDur' | 'haloDur'

export interface DrDecorationDatavPropsSource {
  decorationType: string
  colors: string[]
  reverse: boolean
  dur: number | null
  scanDur: number | null
  haloDur: number | null
}

export const defaultDecorationType: DrDecorationType = 'Decoration1'

export const decorationTypeOptions: Array<{ label: string; value: DrDecorationType }> = [
  {label: '装饰 1', value: 'Decoration1'},
  {label: '装饰 2', value: 'Decoration2'},
  {label: '装饰 3', value: 'Decoration3'},
  {label: '装饰 4', value: 'Decoration4'},
  {label: '装饰 5', value: 'Decoration5'},
  {label: '装饰 6', value: 'Decoration6'},
  {label: '装饰 7', value: 'Decoration7'},
  {label: '装饰 8', value: 'Decoration8'},
  {label: '装饰 9', value: 'Decoration9'},
  {label: '装饰 10', value: 'Decoration10'},
  {label: '装饰 11', value: 'Decoration11'},
  {label: '装饰 12', value: 'Decoration12'},
]

export const decorationSupportedProps: Record<DrDecorationType, DrDecorationDatavProp[]> = {
  Decoration1: ['color'],
  Decoration2: ['color', 'reverse', 'dur'],
  Decoration3: ['color'],
  Decoration4: ['color', 'reverse', 'dur'],
  Decoration5: ['color', 'dur'],
  Decoration6: ['color'],
  Decoration7: ['color'],
  Decoration8: ['color', 'reverse'],
  Decoration9: ['color', 'dur'],
  Decoration10: ['color'],
  Decoration11: ['color'],
  Decoration12: ['color', 'scanDur', 'haloDur'],
}

export const normalizeDecorationType = (type: string | undefined): DrDecorationType => {
  return decorationTypeOptions.some((item) => item.value === type) ? type as DrDecorationType : defaultDecorationType
}

export const isDecorationPropSupported = (type: DrDecorationType, prop: DrDecorationDatavProp) => {
  return decorationSupportedProps[type].includes(prop)
}

export const buildDecorationDatavProps = (props: DrDecorationDatavPropsSource): Record<string, unknown> => {
  const decorationType = normalizeDecorationType(props.decorationType)
  const datavProps: Record<string, unknown> = {
    color: props.colors,
  }

  if (isDecorationPropSupported(decorationType, 'reverse')) {
    datavProps.reverse = props.reverse
  }
  if (isDecorationPropSupported(decorationType, 'dur') && props.dur !== null) {
    datavProps.dur = props.dur
  }
  if (isDecorationPropSupported(decorationType, 'scanDur') && props.scanDur !== null) {
    datavProps.scanDur = props.scanDur
  }
  if (isDecorationPropSupported(decorationType, 'haloDur') && props.haloDur !== null) {
    datavProps.haloDur = props.haloDur
  }

  return datavProps
}
