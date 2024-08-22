import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'

export default {
  ...baseDefinition,
  // 每个组件自定义各位的属性
  type: 'NestTreeMap',
  chartType: 'Treemap',
  name: '嵌套矩形树图', //  组件名称不可修改
  title: { // 标题
    enable: true,
    text: '嵌套矩形树图'
  },
  option: {
    appendPadding: [0, 0, 0, 0],
    colorField: 'brand',
    color: '',
    showLegend: true,
    rectStyle: {
      stroke: '#f6f3f3',
      lineWidth: 2,
      lineDash: [5, 0],
      strokeOpacity: 0.7,
      cursor: 'pointer'
    },
    label: {
      position: 'middle',
      offsetX: 0,
      offsetY: 0,
      // 配置样式
      style: {
        fill: 'rgba(255, 255, 255, 1)',
        opacity: 1,
        fontSize: 14,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#00FF00',
        lineWidth: 0
      }
    },
    legend: {
      layout: 'horizontal',
      position: 'top',
      offsetX: 10,
      offsetY: 10,
      itemSpacing: 20,
      maxWidth: 300,
      flipPage: true,
      maxRow: 2,
      rail: {
        type: 'color',
        size: 10,
        defaultLength: 100
      },
      itemName: {
        style: {
          fill: '#1a1a1a',
          fontSize: 14,
          fontWeight: 'lighter',
          fontFamily: ''
        }
      },
      pageNavigator: {
        marker: {
          style: {
            // 非激活，不可点击态时的填充色设置
            inactiveFill: '#000',
            inactiveOpacity: 0.45,
            // 默认填充色设置
            fill: '#000',
            opacity: 0.8,
            size: 12
          }
        },
        text: {
          style: {
            fill: '#ccc',
            fontSize: 8,
            fontWeight: 'lighter',
            fontFamily: ''
          }
        }
      },
      // 标记
      marker: {
        symbol: 'circle',
        style: {
        }
      }
    },
    pattern: {
      type: 'dot',
      cfg: {
        size: 4,
        padding: 4,
        fill: '#FFF',
        rotation: 10,
        fillOpacity: 0,
        isStagger: true
      }
    },
    // 为矩形树图增加缩放,拖拽交互
    interactions: [
      {
        type: 'view-zoom'
      },
      {
        type: 'drag-move'
      }
    ],
    tooltip: {
      follow: true,
      enterable: true,
      offset: 5,
      customContent: (value, items) => {
        if (!items || items.length <= 0) return
        const { data: itemData } = items[0]
        const parent = itemData.path[1]
        const root = itemData.path[itemData.path.length - 1]
        return (
          '<div class=\'container\'>' +
          `<div class='title'>${itemData.name}</div>` +
          `<div class='tooltip-item'><span>销量</span><span>${itemData.value}</span></div>` +
          `<div class='tooltip-item'><span>品牌</span><span>${itemData.brand}</span></div>` +
          `<div class='tooltip-item'><span>品牌占比</span><span>${((itemData.value / parent.value) * 100).toFixed(
            2
          )}%</span></div>` +
          `<div class='tooltip-item'><span>市场占比</span><span>${((itemData.value / root.value) * 100).toFixed(
            2
          )}%</span></div>` +
          '</div>'
        )
      }
    }
  }
}
