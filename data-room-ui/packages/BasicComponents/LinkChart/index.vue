<template>
  <div
    class="bs-design-wrap"
    :class="`bs-text-${customTheme}`"
    @click="linkHandle"
  >
    <div
      class="content-box"
      :style="{'font-size': config.customize.fontSize +'px','font-weight': +config.customize.fontWeight,'background-image': `-webkit-linear-gradient(${config.customize.color})`}"
    >
      {{ config.customize.title }}
    </div>
    <iframeDialogPreview
      v-if="isPreview"
      ref="iframeDialogPreview"
      :config="config"
    />
  </div>
</template>
<script>
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { mapMutations } from 'vuex'
import iframeDialogPreview from './iframeDialogPreview'
export default {
  name: 'LinkChart',
  components: { iframeDialogPreview },
  mixins: [paramsMixins, commonMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      customClass: {}
    }
  },
  watch: {
  },
  mounted () {
    this.chartInit()
  },
  methods: {
    ...mapMutations('bigScreen', ['changeIframeDialog']),
    linkHandle () {
      // 设计态点击不进行跳转,预览态进行跳转
      if (this.isPreview){
        if (this.config.customize.url) {
          if (this.config.customize.openType === 'dialog') {
            if (this.isPreview) {
              this.$refs.iframeDialogPreview.dialogVisible = true
            } else {
              this.changeIframeDialog(true)
            }
          } else {
            window.open(this.config.customize.url, this.config.customize.openType)
          }
        }
      }

    },
    dataFormatting (config, data) {
      // 文本数据配置原则：选择数据集则以后端返回的数据为主，否则以设置面板中标题设置为准
      if (config.dataSource.businessKey) {
        config.customize.title = data && data.data && data.data.length ? data.data[0][config.dataSource.metricField] : '暂无数据'
      }
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
  .bs-design-wrap{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .content-box{
    //text-align: center;
    /* 将背景设为渐变 */
    /*background-image: -webkit-linear-gradient(left, #6294F7, #C85D14);*/
    /* 规定背景绘制区域 */
    -webkit-background-clip: text;
    /* 将文字隐藏 */
    -webkit-text-fill-color: transparent;
  }
</style>
