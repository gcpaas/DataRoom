<template>
  <div
    class="bs-design-wrap"
    :class="`bs-text-${customTheme}`"
  >
    <div
      class="content-box"
      :style="{'text-align': config.customize.align,'letter-spacing': config.customize.letterSpacing +'px','font-family': config.customize.fontFamily,'font-size': config.customize.fontSize +'px','font-weight': +config.customize.fontWeight,'background-image': `-webkit-linear-gradient(${config.customize.color})`}"
    >
      {{ config.customize.title }}
    </div>
  </div>
</template>
<script>
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
export default {
  name: 'Texts',
  components: {},
  mixins: [paramsMixins, commonMixins, linkageMixins],
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

  computed: {
  },
  mounted () {
    this.chartInit()
  },
  methods: {
    // 通过表达式计算得来的值
    getDataByExpression (config) {
      // 如果表达式是由其他组件的值构成的
      // eslint-disable-next-line no-new-func
      try {
        const result = new Function('dataset', 'computedDatas', this.config.expression)
        config.customize.title = result(this.dataset, this.computedDatas)
      } catch (e) {

      }
      // 同时将计算得来的值保存到公共的数据存储的地方
      this.updateComputedDatas({ code: config.code, title: config.title, data: config.customize.title })
      // this.changeChartConfig(config)
      // }
    },
    dataFormatting (config, data) {
      // 文本数据配置原则：选择数据集则以后端返回的数据为主，否则以设置面板中标题设置为准
      if (config.dataSource.businessKey && config.dataSource.source === 'dataset') {
        config.customize.title = data && data.data && data.data.length ? data.data[0][config.dataSource.metricField] : '暂无数据'
        config.option.data = data && data.data && data.data.length ? data.data : []
      }
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/fonts/numberFont/stylesheet.css";
  .bs-design-wrap{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .content-box{
    width: 100%;
    text-align: center;
    /* 将背景设为渐变 */
    /*background-image: -webkit-linear-gradient(left, #6294F7, #C85D14);*/
    /* 规定背景绘制区域 */
    -webkit-background-clip: text;
    /* 将文字隐藏 */
    -webkit-text-fill-color: transparent;
  }
</style>
