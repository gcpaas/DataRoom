<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
    <dv-scroll-board
      :key="updateKey"
      :class="{'light-theme':customTheme === 'light','auto-theme':customTheme =='dark'}"
      :config="option"
      @click="rowClick"
    />
  </div>
</template>
<script>
import DvScrollBoard from '@jiaminghi/data-view/lib/components/scrollBoard/src/main.vue'
import '@jiaminghi/data-view/lib/components/scrollBoard/src/main.css'
import { dataVMixins } from 'data-room-ui/js/mixins/dataVMixins'
// import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
export default {
  name: 'ScrollBoard',
  components: {
    DvScrollBoard
  },
  mixins: [dataVMixins, paramsMixins, commonMixins, linkageMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
    }
  },
  computed: {
    option: {
      get () {
        return { ...this.config.customize, data: this.config.option?.data, header: this.config.option?.header, columnWidth: this.config.option?.columnWidth, align: this.config.option?.align }
      },
      set () {}
    }
  },
  watch: {
  },
  mounted () {
    this.chartInit()
  },
  methods: {
    // 表格点击事件
    rowClick (row) {
      const origData = this.config.option.origData
      if (row && this.config && this.config.option && origData && origData.length && origData[row.rowIndex]) {
        this.linkage(origData[row.rowIndex])
      }
    },
    dataFormatting (config, data) {
      this.config.loading = false
      const header = []
      const dataList = []
      const alignList = []
      const widthList = []
      config.option.origData = data?.data
      if (config.customize.columnConfig.length === 0) {
        const key = []
        for (const i in data.columnData) {
          header.push(data.columnData[i].remark || data.columnData[i].alias)
          key.push(i)
        }
        data.data.forEach((item) => {
          const arr = []
          header.forEach((x, index) => {
            arr.push(item[key[index]])
          })
          dataList.push(arr)
        })
      } else {
        const key = []
        config.customize.columnConfig.forEach(item => {
          header.push(item.name)
          key.push(item.code)
          alignList.push(item.align)
          widthList.push(item.width)
        })
        data.data.forEach((item) => {
          const arr = []
          header.forEach((x, index) => {
            arr.push(item[key[index]])
          })
          dataList.push(arr)
        })
        if (config.customize.index) {
          if (alignList.length === header.length) {
            alignList.unshift('center')
          }
          if (widthList.length === header.length) {
            widthList.unshift('100')
          }
        } else {
          if (alignList.length !== header.length) {
            alignList.shift()
          }
          if (widthList.length !== header.length) {
            widthList.shift()
          }
        }
      }
      config.option = {
        ...config.option,
        data: dataList,
        header: header,
        columnWidth: [...widthList],
        align: [...alignList]
      }
      return config
    }

  }
}
</script>

<style lang="scss" scoped>
.light-theme{
  background-color: #ffffff;
  color: #000000;
}
.auto-theme{
  background-color: rgba(0,0,0,0);
}
.dark-theme{
  background-color:rgb(31, 31, 31) ;
}
  .bs-design-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border-radius: 4px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
  }
  .title-box{
    height: 40px;
    padding: 10px 10px 0 0;
    box-sizing: border-box;
    .title {
      font-size: 14px;
      color: #333;
      font-weight: bold;
      border-left: 3px solid var(--bs-el-color-primary);
      padding-left: 16px;
    }
    .target-value{
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
  .el-icon-warning{
    color: #FFD600;
  }
  .title-hover{
    &:hover{
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
