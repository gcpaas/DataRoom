import thumbnail from './images/video-player.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrVideoPlayerPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '视频播放器', '视频播放器、video、视频、播放器、MP4、直播、监控', thumbnail, tags)
  }
}
