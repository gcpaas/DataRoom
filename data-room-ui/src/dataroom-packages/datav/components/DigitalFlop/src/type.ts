export interface DigitalFlopConfigType {
  /**
    * @description Number for digital flop
    * @type {Array<number>}
    * @default number = []
    * @example number = [10]
  */
  number: Array<number>
  /**
    * @description Content formatter
    * @type {String}
    * @default content = ''
    * @example content = '{nt}个'
  */
  content?: string
  /**
    * @description Number toFixed
    * @type {Number}
    * @default toFixed = 0
  */
  toFixed?: number
  /**
    * @description Text align
    * @type {String}
    * @default textAlign = 'center'
    * @example textAlign = 'center' | 'left' | 'right'
  */
  textAlign?: 'center' | 'left' | 'right'
  /**
    * @description rowGap
    * @type {Number}
    @default rowGap = 0
  */
  rowGap?: number
  /**
    * @description Text style configuration
    * @type {Object} {CRender Class Style}
  */
  style?: Object
  /**
    * @description Number formatter
    * @type {Null|Function}
  */
  formatter?: null|Function
  /**
    * @description CRender animationCurve
    * @type {String}
    * @default animationCurve = 'easeOutCubic'
  */
  animationCurve?: string
  /**
    * @description CRender animationFrame
    * @type {String}
    * @default animationFrame = 50
  */
  animationFrame?: string
}
