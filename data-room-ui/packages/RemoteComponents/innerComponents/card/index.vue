<template>
  <div
    :class="`bs-card`"
    style="width: 100%;height: 100%;position: relative;"
  >
    <div
      :style="{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: customize.backgroundColor,
        border:`${customize.border}px` + ' ' + customize.borderStyle + ' ' + customize.borderColor,
      }"
    >
      <header
        :style="{
          color: customize.headerColor,
          padding: '8px 0',
          lineHeight: '16px',
          borderBottom: `${customize.titleBottomLineWidth}px solid ${customize.titleBottomLineColor}`,
          fontSize: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
        }"
      >
        <span
          :style="{

            display: 'inline-block',
            borderLeft: `${customize.titleLineWidth}px solid ${customize.titleLineColor}`,
            paddingLeft: customize.titlePaddingLeft+'px'
          }"
        >
          {{ config.title }}
        </span>
      </header>
      <div
        :style="{
          flex: 1,
          position: 'relative'
        }"
      />
    </div>
  </div>
</template>
<script>
import commonMixins from '../../../js/mixins/commonMixins'
import paramsMixins from '../../../js/mixins/paramsMixins'

export default {
  name: 'Card',
  components: {},
  // mixins: [paramsMixins, commonMixins],
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
  mounted () {
    // this.chartInit()
  },
  watch: {},
  computed: {
    customize () {
      return this.config.option.customize
    }
  },
  methods: {
    // dataFormatting (config, data) {
    //   // 文本数据配置原则：选择数据集则以后端返回的数据为主，否则以设置面板中标题设置为准
    //   if (config.dataSource.businessKey) {
    //     config.customize.title = data && data.data && data.data.length ? data.data[0][config.dataSource.metricField] : '暂无数据'
    //   }
    //   return config
    // }
  }
}
</script>

<style lang="scss" scoped>

</style>
