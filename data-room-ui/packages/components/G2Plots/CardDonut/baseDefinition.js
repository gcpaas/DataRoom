import baseDefinition from '@gcpaas/data-room-ui/packages/components/baseDefinition.js'
import { measureTextWidth } from '@antv/g2plot'
// 打包自动生成

export default {
  ...baseDefinition,

  // 每个组件自定义各自的属性
  type: 'CardDonut',
  chartType: 'Pie',
  name: '环图统计指标卡',
  title: {
    enable: true,
    text: '环图统计指标卡'
  },
  option: {
    appendPadding: [10, 10, 10, 10],
    angleField: 'value',
    colorField: 'type',
    dimensionField: 'colorField',
    metricField: 'angleField',
    radius: 1,
    innerRadius: 0.64,
    meta: {
      value: {
        formatter: (v) => `${v} ¥`
      }
    },
    color: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'], // 常用的六种配色方案
    label: {
      type: 'inner',
      offset: '-50%',
      autoRotate: false,
      content: '{percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
        fill: 'black',
        opacity: 0,
        fontWeight: 'lighter',
        fontFamily: '',
        stroke: '#FCFC27',
        lineWidth: 0
      },
      labelLine: {
        style: {
          stroke: '#1EFF00',
          lineWidth: 6,
          opacity: 0.6
        }
      }
    },
    showLegend: false,
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
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }, { type: 'pie-statistic-active' }],
    statistic: {
      title: {
        offsetY: -4,
        customHtml: (container, view, datum) => {
          const { width, height } = container.getBoundingClientRect()
          const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2))
          const text = datum ? datum.type : '总计'
          return renderStatistic(d, text, { fontSize: 28 })
        }
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '32px',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        content: '',
        customHtml: (container, view, datum, data) => {
          const { width } = container.getBoundingClientRect()
          const text = datum ? `¥ ${datum.value}` : `¥ ${data.reduce((r, d) => r + d.value, 0)}`
          return renderStatistic(width, text, { fontSize: 32 })
        }
      }
    }
  }
}
function renderStatistic (containerWidth, text, style) {
  const textWidth = measureTextWidth(text, style)
  const textHeight = style.lineHeight || style.fontSize
  const R = containerWidth / 2
  let scale = 1
  if (containerWidth < textWidth) {
    scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1)
  }
  const textStyleStr = `width:${containerWidth}px;`
  return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};">${text}</div>`
}
