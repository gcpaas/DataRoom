<template>
  <el-dialog
    v-if="dialogConfig"
    class="dataroom-el-dialog canvas-dialog-wrap"
    :visible.sync="dialogVisible"
    :width="dialogConfig.dialogStyle.width + '%'"
    :fullscreen="dialogConfig.dialogStyle.fullPage"
    :before-close="handleClose"
  >
    <span
      slot="title"
      class="dialog-title-box"
      :style="{fontSize:dialogConfig.dialogStyle.title.fontSize + 'px', color:dialogConfig.dialogStyle.title.fontColor,backgroundColor:dialogConfig.dialogStyle.title.bgColor,height:dialogConfig.dialogStyle.title.height + 'px'}"
    >
      {{ dialogConfig.dialogStyle.title.content }}
    </span>
    <div
      class=""
      :style="{height:(dialogConfig.dialogStyle.height - 146) + 'px',backgroundColor:dialogConfig.dialogStyle.body.bgColor,paddingLeft:dialogConfig.dialogStyle.body.padding.left + 'px',paddingRight:dialogConfig.dialogStyle.body.padding.right + 'px',paddingTop:dialogConfig.dialogStyle.body.padding.top + 'px',paddingBottom:dialogConfig.dialogStyle.body.padding.bottom + 'px'}"
    >
      <!-- 如果是外链   -->
      <iframe
        v-if="dialogConfig.content.type === 'iframe'"
        :src="dialogConfig.content.value"
        class="iframe-box content-box"
      />
      <!-- 如果是组件   -->
      <render-card
        v-if="dialogConfig.content.type === 'component'"
        :config="chart"
        :is-external-data="isExternalData"
        :external-data="externalData"
        :external-params="externalParams"
      />
      <!-- 如果是视频   -->
      <video
        v-if="dialogConfig.content.type === 'video'"
        :src="dialogConfig.content.value"
        controls="controls"
      />
      <!-- 如果是图片   -->
      <el-image
        v-if="dialogConfig.content.type === 'image'"
        :src="dialogConfig.content.value"
        class="image content-box"
      />
    </div>
  </el-dialog>
</template>

<script>
import RenderCard from '@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/Render/RenderCard.vue'
export default {
  name: 'CanvasDialog',
  components: { RenderCard },
  props: {
    dialogId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialogConfig: null,
      chart: null,
      isExternalData: false, // 是否使用传的数据及参数
      externalData: [], // 传入的数据
      externalParams: {}, // 传入的参数
      dialogVisible: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    chartInst () {
      return this.canvasInst.chartInst
    },
    dialogChartList () {
      return this.canvasInst.dialogChartList
    }
  },
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    init (dialogConfig) {
      const dialogStyle = this.canvasInst.dialogStyle
      this.dialogVisible = true
      if (dialogConfig) {
        // 将默认弹窗配置与传的配置融合
        this.dialogConfig = dialogConfig
        this.dialogConfig.dialogStyle = {
          ...dialogStyle,
          ...dialogConfig.dialogStyle
        }
        // 如果弹窗的内容是组件
        if (dialogConfig.content.type === 'component') {
          // 获取弹窗组件的唯一标识，来获取组件的配置
          const code = dialogConfig.content.value
          this.chart = this.dialogChartList.find(item => item.code === code)
          this.isExternalData = this.dialogConfig.isExternalData || false
          this.externalData = this.dialogConfig.data || []
          this.externalParams = this.dialogConfig.params
        }
      }
    },
    handleClose () {
      this.dialogVisible = false
      // 销毁弹窗时，清空弹窗的配置，防止有缓存
      this.dialogConfig = null
    }
  }
}
</script>
<style scoped lang="scss">
.canvas-dialog-wrap{
  ::v-deep .el-dialog__header{
    padding: 0!important;
  }
  ::v-deep .el-dialog__body{
    padding: 0!important;
  }
  .dialog-title-box{
    width:100%;
    display:inline-block;
    overflow:hidden;
    padding: 10px;
    box-sizing: border-box;
  }
  .content-box{
    width: 100%;
    height: 100%;
  }
}
</style>
