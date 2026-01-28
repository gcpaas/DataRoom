/**
 * 图表插件、所有图表都需要继承该类并手动注册
 */
export class ChartPlugin {
  // 组件类型、默认为组件所在的文件夹名称
  type: string
  // 组件名称、用于显示
  name: string
  // 组件信息描述、多个之间使用顿号隔开，可用于检索
  desc: string
  // 组件缩略图
  thumbnail: string
  // 所属标签、用于分类
  tags: string[]

  constructor(type: string, name: string, desc: string, thumbnail: string, tags: string[]) {
    this.type = type
    this.name = name
    this.desc = desc
    this.thumbnail = thumbnail
    this.tags = tags
  }
}
