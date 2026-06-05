import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrVideoPlayerPropsInterface {
  /** 基础播放配置 */
  basic: {
    /** 视频链接地址，支持MP4、FLV、M3U8、RTMP格式 */
    url: string
    /** 视频封面图URL */
    poster: string
    /** 是否自动播放 */
    autoplay: boolean
    /** 是否循环播放 */
    loop: boolean
    /** 是否静音 */
    muted: boolean
    /** 是否显示播放控制栏 */
    controls: boolean
    /** 视频预加载策略 */
    preload: 'auto' | 'metadata' | 'none'
  }
  /** 样式配置 */
  style: {
    /** 视频填充模式 */
    objectFit: 'contain' | 'cover' | 'fill' | 'none'
    /** 圆角半径（px） */
    borderRadius: number
    /** 背景颜色 */
    backgroundColor: string
  }
  /** 音量配置 */
  volume: {
    /** 默认音量大小 0-1 */
    defaultVolume: number
  }
  /** 播放速率配置 */
  playbackRate: {
    /** 默认播放速率 */
    defaultRate: number
    /** 可选的播放速率列表 */
    rates: number[]
  }
}

/**
 * 定义组件配置类型
 */
export type DrVideoPlayerConfig = ChartConfig<DrVideoPlayerPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrVideoPlayerConfig => {
  return createChartConfig<DrVideoPlayerPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrVideoPlayer',
    {
      basic: {
        url: '',
        poster: '',
        autoplay: false,
        loop: false,
        muted: false,
        controls: true,
        preload: 'auto'
      },
      style: {
        objectFit: 'contain',
        borderRadius: 0,
        backgroundColor: '#000000'
      },
      volume: {
        defaultVolume: 0.7
      },
      playbackRate: {
        defaultRate: 1,
        rates: [0.5, 0.75, 1, 1.25, 1.5, 2]
      }
    },
    {
      title: '视频播放器',
      w: 480,
      h: 270,
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '播放',
    desc: '视频开始播放时触发',
    method: 'play',
    paramsList: [
      {name: 'currentTime', desc: '当前播放时间（秒）', type: 'number'}
    ],
  },
  {
    name: '暂停',
    desc: '视频暂停时触发',
    method: 'pause',
    paramsList: [
      {name: 'currentTime', desc: '暂停时的播放时间（秒）', type: 'number'}
    ],
  },
  {
    name: '播放结束',
    desc: '视频播放到结尾时触发',
    method: 'ended',
    paramsList: [
      {name: 'duration', desc: '视频总时长（秒）', type: 'number'}
    ],
  },
  {
    name: '时间更新',
    desc: '视频播放过程中定期触发',
    method: 'timeupdate',
    paramsList: [
      {name: 'currentTime', desc: '当前播放时间（秒）', type: 'number'},
      {name: 'duration', desc: '视频总时长（秒）', type: 'number'}
    ],
  },
  {
    name: '单击',
    desc: '鼠标点击视频区域时触发',
    method: 'click',
    paramsList: [
      {name: 'currentTime', desc: '单击时的播放时间（秒）', type: 'number'}
    ],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'urlField',
    desc: '视频地址',
    required: false,
    multiple: false
  },
  {
    name: 'posterField',
    desc: '封面图地址',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
