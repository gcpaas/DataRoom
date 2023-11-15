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
      <!-- :label="getLabel(col)" -->
      <el-table-column
        v-for="(col, index) in columnData"
        :key="index"
        show-overflow-tooltip
        :prop="col.alias"
        align="center"
        :render-header="renderHeader"
      >
        <!-- 自定义头部 -->
        <!-- <template
          slot="header"
        >
          <div class="default-class header-cell">
            <Header :render="col.render" />
          </div>
        </template> -->
        <template slot-scope="scope">
          <div
            :style="conditionalStyle(cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)])"
            class="default-class cell"
          >
            <span
              v-if="!conditionalComponent(cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)])"
            >
              {{ conditionalData(scope.row[col.alias], cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)]) }}
            </span>
            <div
              v-if="conditionalComponent(cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)])"
              style="width: 100%;display: flex;justify-content: center;align-items: center;"
            >
              <CellComponent
                :setting-data="cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)]"
                :value="conditionalData(scope.row[col.alias], cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)])"
              />
            </div>
            <!-- <component :is="" /> -->
            <!-- <div v-if="cellStyleList[scope.$index][Object.keys(columnData).findIndex(item => item === scope.column.property)].style.action.component.type">
              123
            </div> -->
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import CellComponent from './renderCellComponent.js'
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
  components: {
    CellComponent
  },
  template: '',
  data () {
    return {
      conditionList: [],
      updateKey: 0,
      headerCellStyleObj: {
        backgroundColor: 'transparent'
      },
      cellStyleObj: {
        backgroundColor: 'transparent'
      },
      columnData: {},
      // 第一次获取
      isInit: true,
      cellStyleList: []
      // 条件脚本
      // conditionList: [
      //   {
      //     exp: 'row === 1',
      //     column: '0',
      //     propertyList: [
      //       {
      //         type: 'style',
      //         style: 'background-color',
      //         value: 'red',
      //         scope: 'row'
      //       },
      //       {
      //         type: 'style',
      //         style: 'font-size',
      //         value: '30',
      //         unit: 'px',
      //         scope: 'column'
      //       },
      //       {
      //         type: 'component',
      //         // component: {
      //         //   type: 'el-button',
      //         //   props: {
      //         //     type: 'primary',
      //         //     size: 'mini'
      //         //   },
      //         //   style: {
      //         //     width: '100%'
      //         //   }
      //         // },
      //         scope: 'row'
      //       },
      //       {
      //         type: 'style',
      //         style: 'font-size',
      //         value: '60',
      //         unit: 'px',
      //         // component: {
      //         //   type: 'el-button',
      //         //   props: {
      //         //     type: 'primary',
      //         //     size: 'mini'
      //         //   },
      //         //   style: {
      //         //     width: '100%'
      //         //   }
      //         // },
      //         scope: 'cell'
      //       },
      //       {
      //         type: 'newValue',
      //         exp: '"新值" + cellValue',
      //         scope: 'row'
      //       }
      //     ]
      //   }
      //   // {
      //   //   exp: "row === 2 && column === 'keyWord'",
      //   //   scope: 'row',
      //   //   action:
      //   //   {updateTableProperty
      //   //     exp: '',
      //   //     component: {
      //   //       type: ''
      //   //     },
      //   //     style: {
      //   //       'background-color': 'yellow',
      //   //       'font-size': '20px'
      //   //     }
      //   //   }
      //   // },
      //   // {
      //   //   exp: " column === 'userNum'",
      //   //   scope: 'column',
      //   //   action:
      //   //   {
      //   //     exp: 'Number(cellValue)',
      //   //     component: {
      //   //       type: 'el-progress',
      //   //       props: {
      //   //         status: 'exception',
      //   //         'stroke-width': 50,
      //   //         'text-inside': true
      //   //       },
      //   //       style: {
      //   //         width: '100%'
      //   //       }
      //   //     },
      //   //     style: {
      //   //       'background-color': '',
      //   //       'font-size': '25px'
      //   //     }
      //   //   }
      //   // },
      //   // {
      //   //   exp: " column === 'searchNum'",
      //   //   scope: 'column',
      //   //   action:
      //   //   {
      //   //     exp: '',
      //   //     component: {
      //   //       type: 'el-input',
      //   //       props: {
      //   //         placeholder: '请输入',
      //   //         disabled: true
      //   //       },
      //   //       style: {
      //   //         width: '300px'
      //   //       }
      //   //     },
      //   //     style: {
      //   //       'background-color': 'pink'
      //   //     }
      //   //   }
      //   // },
      //   // {
      //   //   exp: 'column === "ranking" && cellValue === 1',
      //   //   scope: 'cell',
      //   //   action: {
      //   //     exp: '',
      //   //     component: {
      //   //       type: '',
      //   //       props: {},
      //   //       style: {}
      //   //     },
      //   //     style: {
      //   //       // 使用红色圆圈
      //   //       'background-color': 'red',
      //   //       'border-radius': '50%',
      //   //       'font-size': '30px',
      //   //       width: '80px',
      //   //       height: '80px',
      //   //       display: 'flex',
      //   //       'justify-content': 'center',
      //   //       'align-items': 'center'
      //   //     }
      //   //   }
      //   // },
      //   // {
      //   //   exp: 'column === "ranking" && cellValue === 2',
      //   //   scope: 'cell',
      //   //   action: {
      //   //     exp: '',
      //   //     component: {
      //   //       type: '',
      //   //       props: {},
      //   //       style: {}
      //   //     },
      //   //     style: {
      //   //       // 使用伪元素红色圆环
      //   //       'background-color': 'blue',
      //   //       'border-radius': '50%',
      //   //       'font-size': '30px',
      //   //       width: '80px',
      //   //       height: '80px',
      //   //       display: 'flex',
      //   //       'justify-content': 'center',
      //   //       'align-items': 'center'
      //   //     }
      //   //   }
      //   // },
      //   // {
      //   //   exp: 'column === "ranking" && cellValue === 3',
      //   //   scope: 'cell',
      //   //   action: {
      //   //     exp: '',
      //   //     component: {
      //   //       type: '',
      //   //       props: {},
      //   //       style: {}
      //   //     },
      //   //     style: {
      //   //       // 使用红色圆圈
      //   //       'background-color': 'white !important',
      //   //       'border-radius': '50%',
      //   //       'font-size': '30px',
      //   //       width: '80px',
      //   //       height: '80px',
      //   //       display: 'flex',
      //   //       'justify-content': 'center',
      //   //       'align-items': 'center'
      //   //     }
      //   //   }
      //   // },
      //   // {
      //   //   exp: 'column === "ranking" && cellValue === 4',
      //   //   scope: 'cell',
      //   //   action: {
      //   //     exp: 'cellValue = ""',
      //   //     component: {
      //   //       type: '',
      //   //       props: {},
      //   //       style: {}
      //   //     },
      //   //     style: {
      //   //       'background-image': 'url(https://images.dog.ceo/breeds/samoyed/n02111889_10206.jpg)',
      //   //       // 宽度50px
      //   //       width: '80px',
      //   //       height: '80px',
      //   //       // 图片不裁切
      //   //       'background-size': 'cover'
      //   //     }
      //   //   }
      //   // }
      // ]
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
    EventBus.$on('updateTableProperty', list => {
      this.getTablePropertyData(list).then(data => {
        this.conditionList = data
        this.updateTableProperty(this.config.option.tableData)
      })
    })
    this.getTablePropertyData().then(data => {
      this.conditionList = data
      if (data) {
        if (this.config.option.tableData && this.config.option.tableData.length > 0) {
          this.updateTableProperty(this.config.option.tableData)
        }
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('dragSelectChange')
    EventBus.$off('updateTableProperty')
  },
  methods: {
    getTablePropertyData (conditionListParam) {
      return new Promise(resolve => {
        const list = []
        const conditionList = conditionListParam || cloneDeep(this.config.customize.condition.columnConditionList)
        conditionList.forEach((condition) => {
          // condition.exp = ''
          // condition.expList.forEach(exp => {
          //   condition.exp += ` ${exp.relation ? exp.relation : ''} ${exp.value}`
          // })
          condition.propertyList.forEach((item) => {
            if (item.property === 'background-image' && item.enable) {
              if (item.value.findIndex(item => item === 'url') === -1) {
                item.value = `url(${item.value})`
              }
            }
            // if (item.type === 'component') {
            //   console.log(item.cellComponent.type)
            // }
          })
          // console.log(condition)
          list.push(condition)
          resolve(list)
        })
      })
    },
    updateTableProperty (tableData) {
      const cellSettingList = []
      for (let i = 0; i < tableData.length; i++) {
        cellSettingList.push([])
        for (let j = 0; j < Object.keys(this.columnData).length; j++) {
          cellSettingList[i].push({ style: {}, cellIndex: { rowNum: i, columnNum: j }, cellComponent: { type: '' }, exp: '' })
        }
      }
      const rowNum = null
      const columnNum = null
      const cellRow = null
      const cellColumn = null
      const rowList = []
      // 单元格脚本列表
      const cellExpList = []
      // 单元格样式列表
      const cellStyleList = []
      // 单元格组件列表
      const cellComponentList = []
      tableData.forEach((tableItem, index) => {
        Object.values(tableItem).forEach((data, dataIndex) => {
          this.conditionList.forEach((condition) => {
            const cellValue = data
            const column = Object.keys(this.columnData)[dataIndex]
            const row = index
            if (condition.exp.trim() !== '') {
              // 如果condition.exp空字符串 则不执行
              eval(`if(${condition.exp}){
              if (condition.propertyList.length > 0) {
                condition.propertyList.forEach((property) => {
                  if (property.scope === 'row' && property.enable) {
                    rowNum = index.toString()
                    if (property.type === 'style') {
                      cellStyleList.push({
                        rowNum: index.toString(),
                        style: {
                          [property.property]: property.value + property.unit
                        }
                      })
                    } else if (property.type === 'exp') {
                      cellExpList.push({
                        rowNum: index.toString(),
                        exp: property.exp
                      })
                    } else if (property.type === 'component') {
                      cellComponentList.push({
                        rowNum: index.toString(),
                        component: property.cellComponent
                      })
                    }
                  } else if (property.scope === 'column' && property.enable && condition.column.toString() === dataIndex.toString()) {
                    columnNum = dataIndex.toString()
                    if (property.type === 'style') {
                      cellStyleList.push({
                        columnNum: dataIndex.toString(),
                        style: {
                          [property.property]: property.value + property.unit
                        }
                      })
                    } else if (property.type === 'exp') {
                      cellExpList.push({
                        columnNum: dataIndex.toString(),
                        exp: property.exp
                      })
                    } else if (property.type === 'component') {
                      cellComponentList.push({
                        columnNum: dataIndex.toString(),
                        component: property.cellComponent
                      })
                    }
                  } else if (property.scope === 'cell' && property.enable) {
                    cellRow = index.toString()
                    cellColumn = dataIndex.toString()
                  }
                })
              }
              }`)
              // 生成行数据
              // rowList.push(cellSettingList[row][dataIndex])
              cellStyleList.forEach((cellStyle) => {
                if (cellStyle.rowNum === rowNum) {
                  cellSettingList[Number(cellStyle.rowNum)][dataIndex].style = {
                    ...cellSettingList[Number(cellStyle.rowNum)][dataIndex].style,
                    ...cellStyle.style
                  }
                } else if (cellStyle.columnNum && cellStyle.columnNum === condition.column.toString()) {
                  if (cellSettingList[row][Number(cellStyle.columnNum)]) {
                    cellSettingList[row][Number(cellStyle.columnNum)].style = {
                      ...(cellSettingList[row][Number(cellStyle.columnNum)].style || {}),
                      ...cellStyle.style
                    }
                  }
                }
              })
              cellExpList.forEach((cellExp) => {
                if (cellExp.rowNum === rowNum) {
                  cellSettingList[Number(cellExp.rowNum)][dataIndex].exp = cellExp.exp
                } else if (cellExp.columnNum && cellExp.columnNum === condition.column.toString()) {
                  cellSettingList[row][Number(cellExp.columnNum)].exp = cellExp.exp
                }
              })
              cellComponentList.forEach((cellComponent) => {
                if (cellComponent.rowNum === rowNum) {
                  cellSettingList[Number(cellComponent.rowNum)][dataIndex].cellComponent = {
                    ...cellSettingList[Number(cellComponent.rowNum)][dataIndex].cellComponent,
                    ...cellComponent.component
                  }
                } else if (cellComponent.columnNum && cellComponent.columnNum === condition.column.toString()) {
                  cellSettingList[row][Number(cellComponent.columnNum)].cellComponent = {
                    ...cellSettingList[row][Number(cellComponent.columnNum)].cellComponent,
                    ...cellComponent.component
                  }
                }
              })
              // cellExpList.forEach((cellExp) => {
              // })
              // cellComponentList.forEach((cellComponent) => {
              //   console.log(111, cellComponent)
              //   if (cellComponent.rowNum === row.toString() && cellComponent.columnNum === dataIndex.toString()) {
              //     cellSettingList[row][dataIndex].cellComponent = cellComponent.component
              //   }
              // })
              // condition.propertyList.forEach((property) => {
              //   if (property.scope === 'row') {
              //     // console.log(property.property)
              //     // if (rowNum && property.enable) {
              //     //   cellSettingList[Number(rowNum)].forEach((rowItem) => {
              //     //     if (property.type === 'style') {
              //     //       rowItem.style[property.property] = property.value + property.unit
              //     //     } else if (property.type === 'component') {
              //     //       rowItem.cellComponent = property.cellComponent
              //     //     } else if (property.type === 'exp') {
              //     //       rowItem.cellData.exp = property.exp
              //     //     }
              //     //   })
              //     // }
              //     // rowNum = null
              //   } else if (property.scope === 'column') {
              //     if (columnNum && property.enable) {
              //       if (property.type === 'style') {
              //         cellSettingList[row][Number(condition.column)].style[property.property] = property.value + property.unit
              //       } else if (property.type === 'component') {
              //         cellSettingList[row][Number(condition.column)].cellComponent = property.cellComponent
              //       } else if (property.type === 'exp') {
              //         cellSettingList[row][Number(condition.column)].exp = property.exp
              //       }
              //       if (cellSettingList[row][Number(condition.column)].cellIndex.columnNum !== Number(columnNum)) {
              //         columnNum = null
              //       }
              //     }
              //   } else if (property.scope === 'cell') {
              //     if (cellRow && cellColumn && property.enable) {
              //       if (property.type === 'style') {
              //         cellSettingList[Number(cellRow)][Number(cellColumn)].style[property.property] = property.value + property.unit
              //       } else if (property.type === 'component') {
              //         cellSettingList[Number(cellRow)][Number(cellColumn)].cellComponent = property.cellComponent
              //       } else if (property.type === 'exp') {
              //         cellSettingList[Number(cellRow)][Number(cellColumn)].exp = property.exp
              //       }
              //     }
              //     if (cellSettingList[Number(cellRow)][Number(cellColumn)].cellIndex.rowNum !== Number(cellRow) || cellSettingList[Number(cellRow)][Number(cellColumn)].cellIndex.columnNum !== Number(cellColumn)) {
              //       cellRow = null
              //       cellColumn = null
              //     }
              //   }
              // })

              // if (script.scope === 'row') {
              // // 如果作用范围是行
              //   if (rowNum) {
              //     cellSettingList[rowNum].forEach((rowItem) => {
              //       rowItem.style = script.action.style
              //     })
              //   }
              // } else if (script.scope === 'column') {
              //   // 如果作用范围是列
              //   if (columnNum) {
              //     if (script.action.style && !cellStyleList.find(item => item.columnNum === columnNum)) {
              //       cellStyleList.push({
              //         columnNum: columnNum,
              //         style: script.action.style
              //       })
              //       script.action.style = {}
              //     }
              //     if (cellStyleList.length > 0) {
              //       if (cellStyleList.find(item => item.columnNum === cellSettingList[row][dataIndex].cellIndex.columnNum)) {
              //         cellSettingList[row][dataIndex].style = cellStyleList.find(item => item.columnNum === cellSettingList[row][dataIndex].cellIndex.columnNum).style
              //       }
              //     }
              //     if (script.action.exp && !cellExpList.find(item => item.columnNum === columnNum)) {
              //       cellExpList.push({
              //         columnNum: columnNum,
              //         exp: script.action.exp
              //       })
              //       script.action.exp = ''
              //     }
              //     if (cellExpList.length > 0) {
              //       if (cellExpList.find(item => item.columnNum === cellSettingList[row][dataIndex].cellIndex.columnNum)) {
              //         cellSettingList[row][dataIndex].cellData.exp = cellExpList.find(item => item.columnNum === cellSettingList[row][dataIndex].cellIndex.columnNum).exp
              //       }
              //     }
              //     if (script.action.component && !cellComponentList.find(item => item.columnNum === columnNum)) {
              //       cellComponentList.push({
              //         columnNum: columnNum,
              //         component: script.action.component
              //       })
              //       script.action.component = {}
              //     }
              //     if (cellComponentList.length > 0) {
              //       if (cellComponentList.find(item => item.columnNum === cellSettingList[row][dataIndex].cellIndex.columnNum)) {
              //         cellSettingList[row][dataIndex].component = cellComponentList.find(item => item.columnNum === cellSettingList[row][dataIndex].cellIndex.columnNum).component
              //       }
              //     }
              //   }
              // } else if (script.scope === 'cell') {
              //   if (cellRow && cellColumn) {
              //     cellSettingList[Number(cellRow)][Number(cellColumn)].style = script.action.style
              //     cellSettingList[Number(cellRow)][Number(cellColumn)].cellData.exp = script.action.exp
              //     cellSettingList[Number(cellRow)][Number(cellColumn)].component = script.action.component
              //   }
              // }
            }
          })
          rowList.length = 0
        })
      })
      // console.log('cellSettingList', cellSettingList)
      this.cellStyleList = cellSettingList
    },
    // 条件样式
    conditionalStyle (data) {
      const styleString = Object.keys(data?.style).map((key) => `${this.camelToDash(key)}: ${data.style[key]}`).join('; ')
      return styleString
    },
    camelToDash (str) {
      if (typeof str === 'undefined') {
        return ''
      }
      return str.replace(/([A-Z])/g, '-$1').toLowerCase()
    },
    // 条件脚本
    conditionalData (a, b) {
      const cellValue = a
      let newValue = null
      if (b.exp) {
        newValue = eval(b.exp)
      }
      return newValue || cellValue
    },
    // 判断是否是组件
    conditionalComponent (b) {
      let isComponent
      if (b.cellComponent.type) {
        isComponent = true
      } else {
        isComponent = false
      }
      return isComponent
    },
    renderHeader (h, { column, $index }) {
      const headerBackgroundColor = {
        light: '#ffffff',
        dark: 'transparent'
      }
      const initColor = this.customTheme === 'light' ? '#000000' : '#ffffff'
      const style = {
        backgroundColor: this.config.customize.headerBackgroundColor || headerBackgroundColor[this.customTheme],
        color: this.config.customize.headerFontColor || initColor,
        fontSize: this.config.customize.headerFontSize + 'px' || '14px'
      }
      console.log(11, style)
      return h('div', {
        style: style
      },
      [
        h('span', column.label)
      ])
    },
    // customizeCellStyles (initialIndex, cellData, column, label, scope) {
    //   // eslint-disable-next-line no-unused-vars
    //   const cellValue = cellData[label]
    //   const styleData = ''
    //   // eslint-disable-next-line no-unused-vars
    //   const row = initialIndex + 1
    //   const scopeRow = null
    //   this.conditionScript.forEach((data) => {
    //     eval(`if(${data.exp}){if(data.scope === 'row'){ scopeRow = initialIndex }}`)
    //   })
    //   return styleData
    // },
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
      return config
    },
    dataFormatting (config, data) {
      config.option.tableData = data?.data && data.data.length > 0 ? data.data : []
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
      this.updateTableProperty(config.option.tableData)
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

.default-class {
  height: 100%;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
}

::v-deep .el-table__body {
  width: 100% !important;
}

::v-deep .cell {
  padding: 0;
  width: 100%;
  height: 100%;
}

::v-deep .el-table th.el-table__cell>.cell {
  padding: 0 !important;
}

::v-deep .el-table__cell {
  padding: 0px !important;
}
</style>
