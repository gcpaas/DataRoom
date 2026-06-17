import thumbnail from './images/video-player.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrVideoPlayerPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrVideoPlayer', '视频播放器', '视频播放器、video、视频、播放器、MP4、直播、监控', thumbnail, tags)
  }
}
