import { mapMutations, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import { toJpeg, toPng } from 'html-to-image'
import isEmpty from 'lodash/isEmpty'
import { randomString } from 'data-room-ui/js/utils'
import Contextmenu from 'vue-contextmenujs'
import Vue from 'vue'

Vue.use(Contextmenu)
export default {
  computed: {
    ...mapState({
      activeCode: state => state.bigScreen.activeCode,
      activeCodes: state => state.bigScreen.activeCodes,
      hoverCode: state => state.bigScreen.hoverCode,
      activeItemConfig: state => state.bigScreen.activeItemConfig,
      chartList: state => state.bigScreen.pageInfo.chartList,
      presetLine: state => state.bigScreen.presetLine
    })
  },
  data () {
    return {}
  },
  mounted () {
  },
  methods: {
    ...mapMutations('bigScreen', ['changeHoverCode', 'changeActiveCode', 'changeChartConfig', 'addItem', 'delItem', 'resetPresetLine', 'changeLayout', 'changeZIndex', 'changeLocked', 'saveTimeLine', 'copyCharts', 'pasteCharts', 'clearActiveCodes']), // 改变hover的组件
    changeHover (code) {
      this.changeHoverCode(code)
    }, // 改变激活的组件
    changeActive (code) {
      this.changeActiveCode(code)
    }, // 打开右侧面板
    openRightPanel (config) {
      this.changeActiveCode(config.code)
      this.$emit('openRightPanel', config)
    }, // 查看数据
    dataView (config) {
      this.changeActiveCode(config.code)
      this.$emit('openDataViewDialog', config)
    }, // 复制组件
    copyItem (config) {
      const newConfig = cloneDeep(config)
      newConfig.code = randomString(8)
      newConfig.title = newConfig.title + '_副本'
      // 区分是从左侧添加还是复制的组件
      newConfig.isCopy = true
      newConfig.x = config.x + 20
      newConfig.y = config.y + 20
      if (config.group) {
        newConfig.group = 'copy_' + config.group
      }
      this.addItem(newConfig)
    }, // 删除单个组件
    deleteItem (config) {
      this.$confirm('确定删除该组件吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', customClass: 'bs-el-message-box'
      }).then(() => {
        this.delItem(config.code)
      })
    }, // 批量删除组合元素
    deleteGroupItem (config) {
      this.$confirm('确定批量删除选中的组件吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', customClass: 'bs-el-message-box'
      }).then(() => {
        // 找到和本组件group相同的组件 删除
        const codes = this.chartList.filter(_chart => _chart.group === config.group && config.group).map(_chart => _chart.code)
        if (!isEmpty(codes)) {
          this.delItem(codes)
        } else {
          this.delItem(config.code)
        }
      })
    }, // 获取组件的坐标字符串，取整 （100， 100）
    getPoint ({ x, y }) {
      return `(${Math.round(x)}, ${Math.round(y)})`
    }, // 组合/取消组合图表
    groupChart (chart) {
      if (!chart.group || chart.group === 'tempGroup') {
        // 添加组合
        // eslint-disable-next-line no-unused-expressions
        this.activeCodes?.forEach(code => {
          const config = this.chartList.find(item => item.code === code)
          this.changeChartConfig({
            ...config, group: `group_${chart.code}`
          })
        })
        this.saveTimeLine('组合图表')
      } else {
        // 取消组合
        this.clearActiveCodes()
        // 找到和本组件group相同的组件 取消group
        this.chartList.forEach(_chart => {
          if (_chart.group === chart.group) {
            this.changeChartConfig({
              ..._chart, group: ''
            })
          }
        })
        this.saveTimeLine('取消组合图表')
      }
    }, // 生成图片
    generateImage (chart) {
      let componentDom = document.querySelector(`#${chart.code} .render-item-wrap`)
      if (this.isPreview) {
        componentDom = document.querySelector(`#${chart.code}`)
      }
      toPng(componentDom)
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `${chart.title}.png`
          link.href = dataUrl
          link.click()
          link.addEventListener('click', () => {
            link.remove()
          })
        }).catch((error) => {
          if (error.type === 'error') {
            // 判断的error.currentTarget是img标签，如果是的，就弹出消息说是图片跨域
            if (error.currentTarget.tagName.toLowerCase() === 'img') {
              // 确认框
              this.$confirm('图片资源跨域导致使用toDataURL API生成图片失败，请将图片上传到资源库，然后在组件中使用资源库中的图片资源，确保没有跨域问题。', '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning',
                customClass: 'bs-el-message-box'
              }).then(() => { }).catch(() => { })
            }
          } else {
            this.$message.warning('出现未知错误，请重试')
          }
        })
    }, // 右键菜单
    onContextmenu (event, chart) {
      const isHidden = !chart?.option?.displayOption?.dataAllocation?.enable
      event.preventDefault()
      if (this.isPreview) {
        this.$contextmenu({
          items: [{
            label: '查看数据',
            icon: 'el-icon-view',
            hidden: isHidden,
            onClick: () => {
              this.dataView(chart)
            }
          },
          {
            label: '生成图片',
            icon: 'el-icon-download',
            hidden: isHidden,
            onClick: () => {
              this.generateImage(chart)
            }
          }],
          event, // 鼠标事件信息
          customClass: 'bs-context-menu-class', // 自定义菜单 class
          zIndex: 999, // 菜单样式 z-index
          minWidth: 150 // 主菜单最小宽度
        })
      } else {
        this.$contextmenu({
          items: [{
            label: '配置',
            icon: 'el-icon-setting',
            onClick: () => {
              this.openRightPanel(chart)
            }
          }, {
            label: '删除',
            icon: 'el-icon-delete',
            onClick: () => {
              this.deleteItem(chart)
            }
          }, {
            label: '批量删除',
            icon: 'el-icon-delete',
            onClick: () => {
              this.deleteGroupItem(chart)
            }
          }, {
            label: '复制',
            icon: 'el-icon-copy-document',
            onClick: () => {
              this.copyItem(chart)
            }
          }, {
            label: '组合复制',
            icon: 'el-icon-copy-document',
            onClick: () => {
              this.copyCharts()
              this.pasteCharts()
            }
          }, {
            label: '置于顶层',
            icon: 'el-icon-arrow-up',
            onClick: () => {
              let chartList = cloneDeep(this.chartList)
              // 将当前图表置底
              chartList = chartList.filter(item => item.code !== chart.code)
              chartList.unshift(chart)
              this.changeLayout(chartList)
              this.changeZIndex(chartList)
            }
          }, {
            label: '置于底层',
            icon: 'el-icon-arrow-down',
            onClick: () => {
              let chartList = cloneDeep(this.chartList)
              // 将当前图表置顶
              chartList = chartList.filter(item => item.code !== chart.code)
              chartList.push(chart)
              this.changeLayout(chartList)
              this.changeZIndex(chartList)
            }
          }, {
            label: chart.locked ? '解锁' : '锁定',
            icon: chart.locked ? 'el-icon-unlock' : 'el-icon-lock',
            onClick: () => {
              this.changeLocked(chart)
            }
          }, {
            label: (chart.group && chart.group !== 'tempGroup') ? '取消组合' : '组合',
            icon: (chart.group && chart.group !== 'tempGroup') ? 'iconfont-bigscreen icon-quxiaoguanlian' : 'iconfont-bigscreen icon-zuhe',
            onClick: () => {
              this.groupChart(chart)
            }
          }, {
            label: '查看数据',
            icon: 'el-icon-view',
            hidden: isHidden,
            onClick: () => {
              this.dataView(chart)
            }
          }, {
            label: '生成图片',
            icon: 'el-icon-download',
            onClick: () => {
              this.generateImage(chart)
            }
          }],
          event, // 鼠标事件信息
          customClass: 'bs-context-menu-class', // 自定义菜单 class
          zIndex: 999, // 菜单样式 z-index
          minWidth: 150 // 主菜单最小宽度
        })
      }
      return false
    }
  }
}
