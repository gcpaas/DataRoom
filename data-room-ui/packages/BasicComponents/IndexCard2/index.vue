<template>
  <div
    :class="`bs-indexCard`"
    style="width: 100%;height: 100%;position: relative;"
  >
    <div
      :style="{
        'background-image': `linear-gradient(${customize.gradientDirection}, ${
          gradientColor0 ? gradientColor0 : gradientColor1
        } , ${gradientColor1 ? gradientColor1 : gradientColor0})`,
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
          :src="customize.src?customize.src:imgUrl"
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
        >{{ customize.secondLine }}</span>
        <span
          :style="{
            'font-family': config.customize.fontFamily,
            'font-size': customize.secondSize + 'px',
            'height':customize.secondSize + 'px',
            color:customize.secondColor,
            'font-weight':customize.secondWeight,
          }"
          class="content-right-second"
        >
          {{ optionData }}
          <span
            :style="{
              'margin-left':'10px',
              'font-size': customize.unitSize + 'px',
              color:customize.unitColor,
            }"
          >
            {{ unit }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
export default {
  name: 'Card',
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
      imgUrl: require('data-room-ui/assets/images/cardImg/cardicon.png'),
      customClass: {}
    }
  },
  watch: {},
  mounted () {
  },
  computed: {
    gradientColor0 () {
      return this.config.customize.gradientColor0 || this.config.customize.gradientColor1 || 'transparent'
    },
    gradientColor1 () {
      return this.config.customize.gradientColor1 || this.config.customize.gradientColor0 || 'transparent'
    },
    unit () {
      return this.config?.customize.unit || ''
    },
    option () {
      return this.config?.option
    },
    optionData () {
      return this.option?.data ?? 80
    },
    customize () {
      return this.config?.customize
    }
  },
  methods: {
    dataFormatting (config, data) {
      let dataList = ''
      if (data.success) {
        if (data.data instanceof Array) {
          dataList = config.dataSource.dimensionField
            ? data.data[0][config.dataSource.dimensionField]
            : data.data[0].value
        } else {
          dataList = data.data[config.dataSource.dimensionField]
        }
      } else {
        dataList = 80
      }
      config.option = {
        ...config.option,
        data: dataList
      }
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/fonts/numberFont/stylesheet.css";
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
