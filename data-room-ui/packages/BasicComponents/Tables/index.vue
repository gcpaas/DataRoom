<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap "
  >
    <!-- <span style="color: aliceblue;font-size: 40px;">
      {{ columnData }}
    </span> -->
    <!-- :border="this.config.customize.border" -->
    <el-table
      :id="config.code"
      ref="table"
      :key="updateKey"
      class="custom-table"
      height="100%"
      :stripe="config.customize.stripe"
      :data="config.option.tableData"
      :header-cell-style="headerCellStyle"
      :cell-style="cellStyle"
      :row-style="rowStyle"
      @row-click="rowClick"
    >
      <el-table-column
        v-for="(col,index) in columnData"
        :key="index"
        show-overflow-tooltip
        :prop="col.alias"
        :label="getLabel(col)"
        align="center"
      />
    </el-table>
  </div>
</template>
<script>
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import cloneDeep from 'lodash/cloneDeep'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
export default {
  name: 'TableChart',
  mixins: [paramsMixins, commonMixins, linkageMixins],
  props: {
    id: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      updateKey: 0,
      headerCellStyleObj: {
        backgroundColor: 'transparent'
      },
      cellStyleObj: {
        backgroundColor: 'transparent'
      },
      columnData: {},
      // 第一次获取
      isInit: true
    }
  },
  computed: {
    headerCellStyle () {
      const headerBackgroundColor = {
        light: '#ffffff',
        dark: 'transparent'
      }
      if (document.getElementById(this.config.code)?.querySelector('tr')) {
        document
          .getElementById(this.config.code)
          .querySelector('tr').style.backgroundColor =
          this.customTheme !== 'custom'
            ? this.config.customize.headerBackgroundColor || headerBackgroundColor[this.customTheme]
            : this.headerCellStyleObj.backgroundColor
      }
      const style = {
        height: '48px',
        borderBottom: 'solid 2px #007aff',
        backgroundColor:
          this.customTheme !== 'custom'
            ? this.config.customize.headerBackgroundColor || headerBackgroundColor[this.customTheme]
            : this.headerCellStyleObj.backgroundColor,
        color:
          this.customTheme === 'light'
            ? '#000000'
            : this.config.customize.headerFontColor || '#000000',
        fontSize: this.config.customize.headerFontSize + 'px' || '14px'
      }
      return style
    }
  },
  watch: {
    activeItemConfig (val) {
      console.dir(val)
    }
  },
  created () { },
  mounted () {
    this.chartInit()
    // this.config.option?.columnData 对象的key 根据 list 对应的key 来排序
    EventBus.$on('dragSelectChange', (val) => {
      if (val.length > 0) {
        const sortedColumnData = {}
        const columnData = cloneDeep(this.config.option?.columnData)
        val.forEach((item, index) => {
          sortedColumnData[item] = columnData[item]
        })
        this.columnData = sortedColumnData
        this.updateKey = new Date().getTime()
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('dragSelectChange')
  },
  methods: {

    cellStyle ({ row, column, rowIndex, columnIndex }) {
      const bodyBackgroundColor = {
        light: '#ffffff',
        dark: 'transparent'
      }
      const initColor = this.customTheme === 'light' ? '#000000' : '#ffffff'
      const style = {
        backgroundColor: '',
        color: this.config.customize.bodyFontColor || initColor,
        fontSize: this.config.customize.bodyFontSize + 'px' || '14px'
      }
      // 如果设置了奇偶行的背景颜色，则以奇偶行的背景颜色为主
      if (rowIndex % 2 && this.config.customize.evenRowBackgroundColor) {
        style.backgroundColor = this.config.customize.evenRowBackgroundColor
      } else if (!(rowIndex % 2) && this.config.customize.oddRowBackgroundColor) {
        style.backgroundColor = this.config.customize.oddRowBackgroundColor
      } else {
        style.backgroundColor = this.config.customize.bodyBackgroundColor || bodyBackgroundColor[this.customTheme]
      }
      return style
    },

    rowStyle ({ row, rowIndex }) {
      if (rowIndex % 2) {
        return {
          backgroundColor: this.config.customize.evenRowBackgroundColor
        }
      } else {
        return {
          backgroundColor: this.config.customize.oddRowBackgroundColor
        }
      }
    },
    // 表格点击事件
    rowClick (row) {
      this.linkage(row)
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
      // const config = cloneDeep(oldConfig)
      // if (this.customTheme === 'custom') {
      //   this.headerCellStyleToObj()
      //   this.cellStyleToObj()
      // }
      // if (this.customTheme === 'custom') {
      //   this.headerCellStyleToObj()
      //   this.cellStyleToObj()
      // }
      // if (config.customize.stripe) {
      //   const trs = document
      //     .getElementById(this.config.code)
      //     ?.querySelectorAll('tr.el-table__row--striped')
      //   if (trs) {
      //     trs.forEach(tr => {
      //       tr.style.opacity = '0.9'
      //     // 透明度
      //     // const overlay = document.createElement("div");
      //     // overlay.classList.add("overlay");
      //     // // 将蒙版添加到容器中
      //     // tr.appendChild(overlay);
      //     })
      //   }
      // } else {
      //   const trs = document
      //     .getElementById(config.code)
      //     ?.querySelectorAll('tr.el-table__row--striped')
      //   if (trs) {
      //     trs.forEach(tr => {
      //       tr.style.opacity = '1'
      //     // 透明度
      //     // const overlay = document.createElement("div");
      //     // overlay.classList.add("overlay");
      //     // // 将蒙版添加到容器中
      //     // tr.appendChild(overlay);
      //     })
      //   }
      // // document.querySelectorAll(".overlay").forEach(overlay => {
      // //   overlay.remove();
      // // });
      // }
      // this.chartInit();
      // if (config.customize.evenRowBackgroundColor && !config.customize.oddRowBackgroundColor) {
      //   config.customize.oddRowBackgroundColor = config.customize.bodyBackgroundColor
      // } else if (!config.customize.evenRowBackgroundColor && config.customize.oddRowBackgroundColor) {
      //   config.customize.evenRowBackgroundColor = config.customize.bodyBackgroundColor
      // } else if (!(!config.customize.evenRowBackgroundColor && !config.customize.oddRowBackgroundColor)) {
      //   config.customize.bodyBackgroundColor = ''
      // }
      // this.updateKey = new Date().getTime()
      return config
    },
    dataFormatting (config, data) {
      config.option.tableData = data?.data
      const filteredData = {}
      const columnData = data?.columnData || {}
      const dimensionFieldList = config.dataSource.dimensionFieldList || []
      if (config.dataSource.dimensionFieldList && config.dataSource.dimensionFieldList.length > 0) {
        // 根据config.dataSource.dimensionFieldList 数据的顺序将表格列顺序调整，使其初始化的时候，顺序和组件配置面板中的一致
        const sortedColumnData = {}
        dimensionFieldList.forEach((item, index) => {
          sortedColumnData[item] = columnData[item]
        })
        Object?.keys(sortedColumnData).forEach(key => {
          if (
            config.dataSource.dimensionFieldList.includes(sortedColumnData[key]?.alias)
          ) {
            filteredData[key] = sortedColumnData[key]
          }
        })
        config.option.columnData = filteredData
      } else {
        config.option.columnData = columnData
      }
      this.columnData = cloneDeep(config.option.columnData)
      this.updateKey = new Date().getTime()
      return config
    },
    // 将样式字符串转成对象, 用于自定义主题，表格头部样式
    headerCellStyleToObj () {
      const str = this.themeJson.themeCss
      // 匹配包含header-cell-style的样式字符串
      // 匹配包含header-cell-style的样式字符串
      const regex = /\.header-cell-style\{([^{}]+)\}/
      const match = str.match(regex)
      if (match) {
        // 将样式字符串转成对象
        const styleStr = match[1].trim().replace(/\s*;\s*$/, '') // 去掉末尾的空格和分号
        // const styleObj = {};
        styleStr.split(';').forEach(s => {
          const [key, value] = s.split(':')
          if (key && value) {
            // 判断是否为空字符串
            this.headerCellStyleObj[key.trim()] = value.trim()
          }
        })
      } else {
        this.headerCellStyleObj = {}
      }
    },
    // 将样式字符串转成对象, 用于自定义主题，表格主体样式
    cellStyleToObj () {
      const str = this.themeJson.themeCss
      // 匹配包含header-cell-style的样式字符串
      // 匹配包含header-cell-style的样式字符串
      const regex = /\.cell-style\{([^{}]+)\}/
      const match = str.match(regex)

      if (match) {
        // 将样式字符串转成对象
        const styleStr = match[1].trim().replace(/\s*;\s*$/, '') // 去掉末尾的空格和分号
        styleStr.split(';').forEach(s => {
          const [key, value] = s.split(':')
          if (key && value) {
            // 判断是否为空字符串
            this.cellStyleObj[key.trim()] = value.trim()
          }
        })
      } else {
        this.cellStyleObj = {}
      }
    },
    getLabel (data) {
      return data.remark || data.originalColumn
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  position: relative;
  width: 100%;
  padding: 0 16px;
  height: 100%;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

::v-deep .el-table {
  // height: 100%;
  background-color: transparent;
}
::v-deep .el-table tr {
  background-color: transparent;
}

// ::v-deep .el-table th.gutter {
//   border-bottom: 2px solid var(--bs-el-color-primary) !important;
// }
::v-deep .el-table__body {
  height: 100%;
}

::v-deep .el-table .el-table__header tr {
  background-color: transparent;
}

::v-deep tr.el-table__row--striped {
  z-index: 1;
  /*将容器的 z-index 设为 1，以便其在蒙版之上*/
  position: relative;
  /*设置容器为相对定位*/
  opacity: 0.9;
}

::v-deep tr.el-table__row--striped::before {
  position: absolute;
  /*设置蒙版为绝对定位*/
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  /*设置半透明的灰色背景色*/
  z-index: 2;
  /*将蒙版的 z-index 设为 2，以便其覆盖在容器之上*/
}

::v-deep .overlay {
  position: absolute;
  /*设置蒙版为绝对定位*/
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2) !important;
  /*设置半透明的灰色背景色*/
  z-index: 2;
  /*将蒙版的 z-index 设为 2，以便其覆盖在容器之上*/
}

::v-deep .cell.el-tooltip {
  z-index: 3;
  min-width: 50px;
  white-space: nowrap;
  position: inherit;
}

::v-deep .el-table {
  .el-table__cell {
    border-bottom: none !important;
  }

  &:before {
    display: none !important;
  }

  th.gutter,
  colgroup.gutter {
    width: 0px !important; //此处的宽度值，对应你自定义滚动条的宽度即可
  }
}

// 关键css代码
::v-deep .el-table__header colgroup col[name="gutter"] {
  display: table-cell !important;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 10px; // 横向滚动条
  height: 10px; // 纵向滚动条 必写
  background-color: transparent;
}

// 滚动条的滑块
::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #9093994D;
  border-radius: 5px;

  &:hover {
    background-color: #90939980;
  }
}
</style>
