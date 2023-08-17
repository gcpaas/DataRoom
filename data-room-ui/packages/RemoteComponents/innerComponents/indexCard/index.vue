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
        :style="{
          'margin-right':customize.distance + 'px'
        }"
        class="content-left"
      >
        <el-image
          :style="{
            width: customize.imgSize + 'px',
            height: customize.imgSize + 'px',
          }"
          :src="customize.src"
          fit="contain"
        />
      </div>
      <div class="content-right">
        <span
          class="content-right-first"
          :style="{
            'font-size': customize.firstSize + 'px',
            'height':customize.firstSize + 'px',
            color:customize.firstColor,
            'font-weight':customize.firstWeight,
            'margin-bottom':customize.lineDistance +'px'
          }"
        >{{ tableData?tableData:'' }}</span>
        <span
          :style="{
            'font-size': customize.secondSize + 'px',
            'height':customize.secondSize + 'px',
            color:customize.secondColor,
            'font-weight':customize.secondWeight,
          }"
          class="content-right-second"
        >
          {{ customize.secondLine }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'Card',
  components: {},
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
  methods: { }
}
</script>

<style lang="scss" scoped>
.content{
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  // background-color: aliceblue;
  justify-content: center;
  .content-left{
    display: flex;
    flex-direction: row;
    height: 100%;
    align-items: center;
  }
  .content-right{
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
  }
  .content-right-first{
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 5px;
  }
  .content-right-second{
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
</style>
