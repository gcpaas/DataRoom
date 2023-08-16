<template>
  <div
    :class="`bs-indexCard`"
    style="width: 100%;height: 100%;position: relative;"
  >
    <div
      :style="{
        'background-color':customize.bgColor,
        'border-radius':customize.borderRadius + 'px',
        border:`${customize.borderWidth}px solid ${customize.borderColor}`,
      }"
      class="content"
    >
      <div
        class="content-right-first"
        :style="{
          'font-size': customize.firstSize + 'px',
          'height':customize.firstSize + 'px',
          color:customize.firstColor,
          'font-weight':customize.firstWeight,
          'margin-bottom':customize.lineDistance +'px'
        }"
      >
        {{ tableData?tableData:'' }}
      </div>
      <div
        :style="{
          'font-size': customize.secondSize + 'px',
          'height':customize.secondSize + 'px',
          color:customize.secondColor,
          'font-weight':customize.secondWeight,
        }"
        class="content-right-second"
      >
        {{ customize.secondLine }}
      </div>
    </div>
  </div>
</template>
<script>
// import commonMixins from '../../../js/mixins/commonMixins'
// import paramsMixins from '../../../js/mixins/paramsMixins'

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
  watch: {},
  mounted () {
    // this.chartInit()
  },
  computed: {
    option () {
      return this.config?.option
    },
    optionData () {
      return this.option?.data || []
    },
    customize () {
      return this.option?.customize
    },
    tableData () {
      let dataList = ''
      if (this.optionData instanceof Array && this.optionData.length > 0) {
        dataList = this.option?.yField
          ? this.optionData[0][this.option.yField]
          : this.optionData[0]?.value
      } else {
        dataList = this.optionData ? this.optionData[this.option.yField] : ''
      }
      return dataList
    }
  },
  methods: {
    customStyle () {}
  }
}
</script>

<style lang="scss" scoped>
.content{
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  text-align: center;
  justify-content: center;
  .content-right-first{
    width: 100%;
    text-align: center;
    padding-bottom: 5px;
  }
  .content-right-second{
    width: 100%;
    text-align: center;
  }
}
</style>
