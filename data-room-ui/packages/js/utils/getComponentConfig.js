import Icon from 'data-room-ui/assets/images/bigScreenIcon/export'

export default function getComponentConfig (type) {
  switch (type) {
    case 'texts':
      return {
        name: '文本',
        title: '文本',
        icon: Icon.getNameList()[0],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenTextChart',
        w: 200,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'numbers':
      return {
        name: '数字',
        title: '数字',
        icon: Icon.getNameList()[28],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenNumbersChart',
        w: 200,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'linkChart':
      return {
        name: '超链接',
        title: '超链接',
        icon: Icon.getNameList()[15],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenLinkChart',
        w: 200,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'horizontalLine':
      return {
        name: '水平线',
        title: '水平线',
        icon: Icon.getNameList()[24],
        component: null,
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenBorderChart',
        w: 300,
        h: 40,
        x: 0,
        y: 0,
        type
      }
    case 'verticalLine':
      return {
        name: '垂直线',
        title: '垂直线',
        icon: Icon.getNameList()[25],
        component: null,
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenBorderChart',
        w: 40,
        h: 300,
        x: 0,
        y: 0,
        type
      }

    case 'picture':
      return {
        name: '图片',
        title: '图片',
        icon: Icon.getNameList()[1],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenPictureChart',
        w: 280,
        h: 200,
        x: 0,
        y: 0,
        type
      }
    case 'screenScrollBoard':
      return {
        name: '轮播表',
        title: '轮播表',
        icon: Icon.getNameList()[2],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenScrollBoardChart',
        w: 600,
        h: 400,
        x: 0,
        y: 0,
        type
      }
    case 'screenScrollRanking':
      return {
        name: '排名表',
        title: '排名表',
        icon: Icon.getNameList()[3],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenScrollRankingChart',
        w: 600,
        h: 400,
        x: 0,
        y: 0,
        type
      }
    case 'tables':
      return {
        name: '表格',
        title: '表格',
        icon: Icon.getNameList()[4],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenTablesChart',
        w: 600,
        h: 400,
        x: 0,
        y: 0,
        type
      }
    case 'currentTime':
      return {
        name: '当前时间',
        title: '当前时间',
        icon: Icon.getNameList()[6],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenCurrentTimeChart',
        w: 300,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'timeCountDown':
      return {
        name: '倒计时',
        title: '倒计时',
        icon: Icon.getNameList()[7],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenTimeCountDownChart',
        w: 300,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'iframeChart':
      return {
        name: '外链',
        title: '外链',
        icon: Icon.getNameList()[8],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenIframeChart',
        w: 600,
        h: 400,
        x: 0,
        y: 0,
        type
      }
    case 'digitalFlop':
      return {
        name: '翻牌器',
        title: '翻牌器',
        icon: null,
        img: require('data-room-ui/BasicComponents/DigitalFlop/images/fanpaiqi.png'),
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenDigitalFlopChart',
        w: 800,
        h: 150,
        x: 0,
        y: 0,
        type
      }
    case 'customHtml':
      return {
        name: '自定义HTML',
        title: '自定义HTML',
        icon: Icon.getNameList()[29],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenCustomHtmlChart',
        w: 600,
        h: 150,
        x: 0,
        y: 0,
        type
      }
    case 'video':
      return {
        name: '播放器',
        title: '播放器',
        icon: Icon.getNameList()[12],
        className:
          'com.gccloud.dataroom.core.module.chart.components.ScreenVideoChart',
        w: 600,
        h: 400,
        x: 0,
        y: 0,
        type
      }

    case 'input':
      return {
        name: '输入框',
        title: '输入框',
        icon: Icon.getNameList()[13],
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenInputChart',
        w: 450,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    // case 'button':
    //   return {
    //     name: '按钮',
    //     title: '按钮',
    //     icon: Icon.getNameList()[14],
    //     className: 'com.gccloud.dataroom.core.module.chart.components.ScreenButtonChart',
    //     w: 80,
    //     h: 40,
    //     x: 0,
    //     y: 0,
    //     type
    //   }
    case 'marquee':
      return {
        name: '跑马灯',
        title: '跑马灯',
        icon: Icon.getNameList()[16],
        className:
            'com.gccloud.dataroom.core.module.chart.components.ScreenMarqueeChart',
        w: 250,
        h: 150,
        x: 0,
        y: 0,
        type
      }
    case 'chartTab':
      return {
        name: '图表Tab页',
        title: '图表Tab页',
        icon: Icon.getNameList()[19],
        className: 'com.gccloud.dataroom.core.module.chart.components.ChartTabChart',
        w: 600,
        h: 400,
        x: 0,
        y: 0,
        type
      }
    case 'themeSelect':
      return {
        name: '主题切换',
        title: '主题切换',
        icon: Icon.getNameList()[20],
        className: 'com.gccloud.dataroom.core.module.chart.components.ThemeSelectChart',
        w: 200,
        h: 100,
        x: 0,
        y: 0,
        type
      }
    case 'select':
      return {
        name: '选择器',
        title: '选择器',
        icon: Icon.getNameList()[21],
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenSelectChart',
        w: 450,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'timePicker':
      return {
        name: '时间选择器',
        title: '时间选择器',
        icon: Icon.getNameList()[22],
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenTimePickerChart',
        w: 200,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'dateTimePicker':
      return {
        name: '日期时间选择器',
        title: '日期时间选择器',
        icon: Icon.getNameList()[23],
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenDateTimePickerChart',
        w: 500,
        h: 60,
        x: 0,
        y: 0,
        type
      }
    case 'indicatorCard':
      return {
        name: '指标卡一',
        title: '指标卡一',
        icon: Icon.getNameList()[30],
        // img: require('data-room-ui/assets/images/cardImg/card.png'),
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenIndicatorCardChart',
        w: 300,
        h: 114,
        x: 0,
        y: 0,
        type
      }
    case 'indicatorCard2':
      return {
        name: '指标卡二',
        title: '指标卡二',
        icon: Icon.getNameList()[31],
        // img: require('data-room-ui/assets/images/cardImg/card2.png'),
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenIndicatorCardChart',
        w: 300,
        h: 114,
        x: 0,
        y: 0,
        type
      }
    case 'indexCard':
      return {
        name: '指标卡三',
        title: '指标卡三',
        icon: Icon.getNameList()[32],
        // img: require('data-room-ui/assets/images/cardImg/indicard.png'),
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenIndexCardChart',
        w: 300,
        h: 114,
        x: 0,
        y: 0,
        type
      }
    case 'indexCard2':
      return {
        name: '指标卡四',
        title: '指标卡四',
        icon: Icon.getNameList()[33],
        // img: require('data-room-ui/assets/images/cardImg/indcard2.png'),
        className: 'com.gccloud.dataroom.core.module.chart.components.ScreenIndexCardChart',
        w: 300,
        h: 114,
        x: 0,
        y: 0,
        type
      }
    default:
      return {}
  }
}
