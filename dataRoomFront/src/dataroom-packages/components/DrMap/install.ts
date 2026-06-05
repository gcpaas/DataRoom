import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrMapPropsInterface {
  source: {
    mode: 'geoJson' | 'online'
    regionCode: string
    showSouthChinaSea: boolean
    enableDrillDown: boolean
    onlineProvider: {
      apiKey: string
      style: 'dark' | 'normal' | 'light' | string
      customStyleId: string
      language: string
    }
  }
  view: {
    center: [number, number]
    zoom: number
    roam: boolean
    viewMode: '2D' | '3D'
    pitch: number
    skyColor: string
    showOnlineLabel: boolean
    onlineFeatures: Array<'bg' | 'point' | 'road' | 'building'>
  }
  regionStyle: {
    areaGradient: [string, string]
    borderColor: string
    borderWidth: number
    shadowColor: string
    shadowBlur: number
    shadowOffset: [number, number]
  }
  regionLabel: {
    show: boolean
    fontSize: number
    color: string
  }
  emphasis: {
    disabled: boolean
    areaColor: string
    borderWidth: number
    shadowColor: string
    label: {
      fontSize: number
      color: string
    }
  }
  visualMap: {
    show: boolean
    orient: 'vertical' | 'horizontal'
    pieces: Array<{
      min?: number
      max?: number
      gte?: number
      lte?: number
      label?: string
    }>
    colors: string[]
    textStyle: {
      color: string
    }
  }
  marker: {
    show: boolean
    type: 'effectScatter' | 'circle' | 'pin' | 'none'
    symbolSize: number
    color: string
    borderColor: string
    borderWidth: number
    ripple: {
      show: boolean
      scale: number
      color: string
      brushType: 'fill' | 'stroke'
    }
    label: {
      show: boolean
      position: 'top' | 'bottom' | 'left' | 'right' | 'inside'
      fontSize: number
      color: string
      offset: [number, number]
    }
  }
  flowLine: {
    show: boolean
    color: string
    width: number
    opacity: number
    curveness: number
    effect: {
      show: boolean
      period: number
      trailLength: number
      symbol: 'arrow' | 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | string
      symbolSize: number
    }
  }
  tooltip: {
    show: boolean
    trigger: 'item'
    backgroundColor: string
    borderColor: string
    textStyle: {
      fontSize: number
      color: string
    }
  }
  backControl: {
    text: string
    fontSize: number
    color: string
  }
  onlineLayers: {
    satellite: {
      show: boolean
      zIndex: number
      opacity: number
      zoomRange: [number, number]
    }
    roadNet: {
      show: boolean
      zIndex: number
      opacity: number
      zoomRange: [number, number]
    }
    traffic: {
      show: boolean
      zIndex: number
      opacity: number
      zoomRange: [number, number]
    }
  }
}

export type DrMapConfig = ChartConfig<DrMapPropsInterface>

const getInstance = (): DrMapConfig => {
  return createChartConfig<DrMapPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrMap',
    {
      source: {
        mode: 'geoJson',
        regionCode: '340000',
        showSouthChinaSea: true,
        enableDrillDown: false,
        onlineProvider: {
          apiKey: '',
          style: 'dark',
          customStyleId: '',
          language: 'zh_cn',
        },
      },
      view: {
        center: [116.397428, 39.90923],
        zoom: 1,
        roam: false,
        viewMode: '2D',
        pitch: 60,
        skyColor: '#53A9DE',
        showOnlineLabel: true,
        onlineFeatures: ['bg', 'point', 'road', 'building'],
      },
      regionStyle: {
        areaGradient: ['#e0ecff', '#e0ecff'],
        borderColor: '#7babea',
        borderWidth: 1,
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffset: [0, 0],
      },
      regionLabel: {
        show: true,
        fontSize: 10,
        color: '#333333',
      },
      emphasis: {
        disabled: false,
        areaColor: '#4d90e8',
        borderWidth: 1,
        shadowColor: 'transparent',
        label: {
          fontSize: 12,
          color: '#FFFFFF',
        },
      },
      visualMap: {
        show: false,
        orient: 'vertical',
        pieces: [
          { gte: 1000, label: '>1000' },
          { gte: 600, lte: 999, label: '600-999' },
          { gte: 200, lte: 599, label: '200-599' },
          { gte: 50, lte: 199, label: '50-199' },
          { gte: 10, lte: 49, label: '10-49' },
          { lte: 9, label: '<9' },
        ],
        colors: ['#c3d7df', '#5cb3cc', '#8abcd1', '#66a9c9', '#2f90b9', '#1781b5'],
        textStyle: {
          color: '#FFFFFF',
        },
      },
      marker: {
        show: true,
        type: 'effectScatter',
        symbolSize: 4,
        color: '#FFFFFF',
        borderColor: 'rgba(225, 255, 255, 1)',
        borderWidth: 4,
        ripple: {
          show: true,
          scale: 6,
          color: '#FFFFFF',
          brushType: 'fill',
        },
        label: {
          show: false,
          position: 'bottom',
          fontSize: 11,
          color: '#FFFFFF',
          offset: [0, 2],
        },
      },
      flowLine: {
        show: false,
        color: '#4fb6d2',
        width: 1,
        opacity: 0.1,
        curveness: 0.3,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.4,
          symbol: 'arrow',
          symbolSize: 7,
        },
      },
      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        textStyle: {
          fontSize: 12,
          color: '#333333',
        },
      },
      backControl: {
        text: '返回上级',
        fontSize: 20,
        color: '#FFFFFF',
      },
      onlineLayers: {
        satellite: {
          show: false,
          zIndex: 1,
          opacity: 1,
          zoomRange: [3, 18],
        },
        roadNet: {
          show: false,
          zIndex: 2,
          opacity: 1,
          zoomRange: [3, 18],
        },
        traffic: {
          show: false,
          zIndex: 3,
          opacity: 1,
          zoomRange: [3, 18],
        },
      },
    },
    {
      title: '地图',
      w: 20,
      h: 20,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '区域点击',
    desc: '点击行政区区域时触发',
    method: 'regionClick',
    paramsList: [
      { name: 'name', desc: '行政区名称', type: 'string' },
      { name: 'regionCode', desc: '行政区编码', type: 'string' },
      { name: 'value', desc: '行政区数据值', type: 'number' },
    ],
  },
  {
    name: '标记点击',
    desc: '点击地图标记点时触发',
    method: 'markerClick',
    paramsList: [
      { name: 'name', desc: '标记点名称', type: 'string' },
      { name: 'lng', desc: '经度', type: 'number' },
      { name: 'lat', desc: '纬度', type: 'number' },
      { name: 'value', desc: '标记点数值', type: 'number' },
    ],
  },
  {
    name: '地图下钻',
    desc: '进入下一级行政区时触发',
    method: 'drillDown',
    paramsList: [
      { name: 'name', desc: '目标行政区名称', type: 'string' },
      { name: 'regionCode', desc: '目标行政区编码', type: 'string' },
    ],
  },
  {
    name: '返回上级',
    desc: '从下级行政区返回上级地图时触发',
    method: 'drillUp',
    paramsList: [{ name: 'regionCode', desc: '返回后的行政区编码', type: 'string' }],
  },
]

const datasetFields: ChartDatasetField[] = [
  { name: 'regionNameField', desc: '行政区名称字段', required: false, multiple: false },
  { name: 'regionValueField', desc: '行政区数值字段', required: false, multiple: false },
  { name: 'markerNameField', desc: '标记点名称字段', required: false, multiple: false },
  { name: 'longitudeField', desc: '经度字段', required: false, multiple: false },
  { name: 'latitudeField', desc: '纬度字段', required: false, multiple: false },
  { name: 'markerValueField', desc: '标记点数值字段', required: false, multiple: false },
  { name: 'lineFromLngField', desc: '飞线起点经度字段', required: false, multiple: false },
  { name: 'lineFromLatField', desc: '飞线起点纬度字段', required: false, multiple: false },
  { name: 'lineToLngField', desc: '飞线终点经度字段', required: false, multiple: false },
  { name: 'lineToLatField', desc: '飞线终点纬度字段', required: false, multiple: false },
]

export { component, controlPanel, getInstance, behaviors, datasetFields }
