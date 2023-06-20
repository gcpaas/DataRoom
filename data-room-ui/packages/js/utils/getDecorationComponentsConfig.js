/*
 * @description: 得到装饰组件配置
 */
export default function getComponentConfig (type, classNameType) {
  const className =
    'com.gccloud.bigscreen.core.module.chart.components.ScreenDecorationChart'
  switch (type) {
    case 'decoration1':
      return {
        name: '装饰一',
        title: '装饰一',
        img: require('packages/Decorations/images/01.png'),
        component: null,
        className,
        w: 350,
        h: 30,
        x: 0,
        y: 0,
        type
      }
    case 'decoration2':
      return {
        name: '装饰三',
        title: '装饰三',
        img: require('packages/Decorations/images/03.png'),
        component: null,
        className,
        w: 350,
        h: 20,
        x: 0,
        y: 0,
        type
      }
    case 'decoration2Reverse':
      return {
        name: '装饰三(旋转)',
        title: '装饰三(旋转)',
        img: require('packages/Decorations/images/03_reverse.png'),
        component: null,
        className,
        w: 20,
        h: 350,
        x: 0,
        y: 0,
        type
      }
    case 'decoration3':
      return {
        name: '装饰二',
        title: '装饰二',
        img: require('packages/Decorations/images/02.png'),
        component: null,
        className,
        w: 350,
        h: 30,
        x: 0,
        y: 0,
        type
      }
    case 'decoration4':
      return {
        name: '装饰四',
        title: '装饰四',
        img: require('packages/Decorations/images/04.png'),
        component: null,
        className,
        w: 30,
        h: 320,
        x: 0,
        y: 0,
        type
      }
    case 'decoration4Reverse':
      return {
        name: '装饰四(旋转)',
        title: '装饰四(旋转)',
        img: require('packages/Decorations/images/04_reverse.png'),
        component: null,
        className,
        w: 320,
        h: 30,
        x: 0,
        y: 0,
        type
      }
    case 'decoration5':
      return {
        name: '装饰五',
        title: '装饰五',
        img: require('packages/Decorations/images/05.png'),
        component: null,
        className,
        w: 350,
        h: 50,
        x: 0,
        y: 0,
        type
      }
    case 'decoration6':
      return {
        name: '装饰六',
        title: '装饰六',
        img: require('packages/Decorations/images/06.png'),
        component: null,
        className,
        w: 350,
        h: 30,
        x: 0,
        y: 0,
        type
      }
    case 'decoration8':
      return {
        name: '装饰七',
        title: '装饰七',
        img: require('packages/Decorations/images/07.png'),
        component: null,
        className,
        w: 350,
        h: 50,
        x: 0,
        y: 0,
        type
      }
    case 'decoration8Reverse':
      return {
        name: '装饰七(旋转)',
        title: '装饰七(旋转)',
        img: require('packages/Decorations/images/07_reverse.png'),
        component: null,
        className,
        w: 350,
        h: 50,
        x: 0,
        y: 0,
        type
      }
    case 'decoration9':
      return {
        name: '装饰八',
        title: '装饰八',
        img: require('packages/Decorations/images/08.png'),
        component: null,
        className,
        w: 150,
        h: 150,
        x: 0,
        y: 0,
        type
      }
    case 'decoration10':
      return {
        name: '装饰九',
        title: '装饰九',
        img: require('packages/Decorations/images/09.png'),
        component: null,
        className,
        w: 350,
        h: 50,
        x: 0,
        y: 0,
        type
      }
    case 'decoration11':
      return {
        name: '装饰十',
        title: '装饰十',
        img: require('packages/Decorations/images/10.png'),
        component: null,
        className,
        w: 350,
        h: 50,
        x: 0,
        y: 0,
        type
      }
    default:
      return {}
  }
}
