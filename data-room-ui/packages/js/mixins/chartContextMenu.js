
import cloneDeep from 'lodash/cloneDeep'
import { toPng } from 'html-to-image'
import isEmpty from 'lodash/isEmpty'
import { randomString } from '@gcpaas/data-room-ui/packages/js/utils'
import Contextmenu from 'vue-contextmenujs'
import Vue from 'vue'

Vue.use(Contextmenu)
export default {
  computed: {
    chartList () {
      return this.canvasInst.chartList
    }
  },
  data () {
    return {}
  },
  inject: ['canvasInst'],
  mounted () {
  },
  methods: {
    changeHover (code) {
    },
    // 打开右侧面板
    openRightPanel (config) {
      this.canvasInst.updateActiveChart(config.code)
      this.canvasInst.openRightPanel()
      this.canvasInst.changeIsScreenSet(false)
    }, // 查看数据
    dataView (config) {
      this.changeActiveCode(config.code)
      this.$emit('openDataViewDialog', config)
    },
    // 复制组件
    copyItem (config) {
      const _config = cloneDeep(config)
      const newConfig = this.replaceCodeWithrandom(_config)
      newConfig.title.text = _config.title.text + '_副本'
      const isCopy = true
      this.canvasInst.addChart(newConfig, 'copy')
    },
    // 组件深克隆，当组件存在子组件时，需要更新子组件的父节点标识
    replaceCodeWithrandom (config) {
      // 如果 config 不存在，直接返回
      if (!config) {
        return
      }

      // 如果 config 是一个数组，则遍历数组中的每个元素
      if (Array.isArray(config)) {
        config.forEach(item => {
          this.replaceCodeWithrandom(item) // 递归调用
        })
      } else if (typeof config === 'object') {
        // 如果 config 是一个对象，则遍历对象的每个属性
        for (const key in config) {
          if (key === 'code') {
            // 如果当前属性是 'code'，则将其替换为时间戳
            config[key] = randomString(8)
          } else if (Array.isArray(config[key]) || typeof config[key] === 'object') {
            // 如果当前属性是一个数组或者对象，则递归调用 replaceCodeWithTimestamp 函数
            this.replaceCodeWithrandom(config[key])
          }
        }
      }

      return config // 返回替换完成的 config 对象
    },
    // 删除单个组件
    deleteItem (config) {
      this.$confirm('确定删除该组件吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', customClass: 'bs-el-message-box'
      }).then(() => {
        this.canvasInst.deleteChart([config.code])
      })
    }, // 批量删除组合元素
    deleteGroupItem (config) {
      this.$confirm('确定批量删除选中的组件吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', customClass: 'bs-el-message-box'
      }).then(() => {
        // 找到和本组件group相同的组件 删除
        const codes = this.chartList.filter(_chart => _chart.group === config.group && config.group).map(_chart => _chart.code)
        if (!isEmpty(codes)) {
          this.canvasInst.deleteChart(codes)
        } else {
          this.canvasInst.deleteChart([config.code])
        }
      })
    },
    // 组合/取消组合图表
    groupChart (chart) {
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
            this.$message.warning('生成封面数据出现错误，请检查是否使用了跨域图片')
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
              //  TODO: 组合复制的代码待补充
            }
          }, {
            label: '置于顶层',
            icon: 'el-icon-arrow-up',
            onClick: () => {
              let chartList = cloneDeep(this.chartList)
              // 将当前图表置底
              chartList = chartList.filter(item => item.code !== chart.code)
              chartList.unshift(chart)
              // TODO:修改图层关系
            }
          }, {
            label: '置于底层',
            icon: 'el-icon-arrow-down',
            onClick: () => {
              let chartList = cloneDeep(this.chartList)
              // 将当前图表置顶
              chartList = chartList.filter(item => item.code !== chart.code)
              chartList.push(chart)
              // TODO:修改图层关系
            }
          }, {
            label: chart.locked ? '解锁' : '锁定',
            icon: chart.locked ? 'el-icon-unlock' : 'el-icon-lock',
            onClick: () => {
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
