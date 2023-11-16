<template>
  <div
    style="width: 100%; height: 100%"
    class="bs-design-wrap"
  >
    <div class="content">
      <div
        v-for="(item, index) in option.data"
        :key="index"
        class="content_item"
        :style="{
          'font-family': option.fontFamily,
          'border-color': option.borderColor,
          'border-width': option.borderWidth + 'px',
          'background-color': option.bgColor,
          'font-size': option.fontSize + 'px',
          'min-width': option.width + 'px',
          'height': option.height + 'px',
          color: option.color,
          'border-radius': option.borderRadius + 'px',
          'font-weight': option.fontWeight,
          'margin-right': index !== option.data.length - 1 ? option.marginRight + 'px' : '',
          '--line-height': option.lineStyle.height + 'px',
          '--line-color': option.lineStyle.color
        }"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
<script>
import '@jiaminghi/data-view/lib/components/digitalFlop/src/main.css'
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
function formatter (number, format) {
  const numbers = number.toString().split('').reverse()
  const segs = []
  while (numbers.length) {
    segs.push(numbers.splice(0, format).join(''))
  }
  return segs.join(',').split('').reverse().join('')
}

export default {
  name: 'DvDigitalFlop',
  components: {
    // DigitalFlop
  },
  mixins: [refreshComponentMixin, paramsMixins, commonMixins, linkageMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {}
  },
  computed: {
    option () {
      let str = this.config.option.data
      if (!this.config.option.data) return { ...this.config.customize, data: [] }
      if (
        this.config.option.data.toString().split('').length <
        this.config.customize.numberDigits
      ) {
        const len =
          this.config.customize.numberDigits -
          this.config.option.data.toString().split('').length
        for (let i = 0; i < len; i++) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          str =
            (this.config.customize.placeHolder
              ? this.config.customize.placeHolder
              : ' ') + str
        }
      }
      const a =
        this.config.customize.formatter === 0
          ? str
          : formatter(str, this.config.customize.formatter)
      const arr = a.toString().split('')

      if (this.config.customize.slotRight !== '') {
        arr.push(this.config.customize.slotRight)
      }
      if (this.config.customize.slotLeft !== '') {
        arr.unshift(this.config.customize.slotLeft)
      }
      return {
        ...this.config.customize,
        data: arr
      }
    }
  },
  watch: {},
  mounted () {
  },
  methods: {
    dataFormatting (config, data) {
      let dataList = ''
      if (data.data instanceof Array) {
        dataList = config.dataSource.dimensionField
          ? data.data[0][config.dataSource.dimensionField]
          : data.data[0].value
      } else {
        dataList = data.data[config.dataSource.dimensionField]
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
.content_item{
  position: relative;
  &::after{
    content: '';
    position: absolute;
    width: 100%;
    height: var(--line-height);
    transform: translateY( -cale(--line-height / 2) + 'px');
    background-color: var(--line-color);
  }
}
.light-theme {
  background-color: #ffffff;
  color: #000000;
}
.auto-theme {
  background-color: rgba(0, 0, 0, 0);
}
.dark-theme {
  background-color: rgb(31, 31, 31);
}
.bs-design-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  .content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    height: 100%;
    align-items: center;
    &_item {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid rgba(131, 191, 246, 0);
      overflow: hidden;
    }
  }
}
.title-box {
  height: 40px;
  padding: 10px 10px 0 0;
  box-sizing: border-box;
  .title {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    border-left: 3px solid #007aff;
    padding-left: 16px;
  }
  .target-value {
    overflow-y: auto;
    height: 60px;
    font-weight: bold;
    width: 100%;
    font-size: 20px;
    color: #333;
    padding: 16px 0 0 22px;
    box-sizing: border-box;
  }
}
.el-icon-warning {
  color: #ffd600;
}
.title-hover {
  &:hover {
    cursor: move;
  }
}
/*滚动条样式*/
::v-deep ::-webkit-scrollbar {
  width: 4px;
  border-radius: 4px;
  height: 4px;
}
::v-deep ::-webkit-scrollbar-thumb {
  background: #dddddd !important;
  border-radius: 10px;
}
</style>
