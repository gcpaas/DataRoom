<template>
  <div class="page-top-setting-wrap">
    <div class="logo-wrap item-wrap">
      <img
        class="menu-img"
        src="../BigScreenDesign/images/app.png"
        alt="返回"
        @click="backManagement"
      >
      <span class="logo-text name-span">{{ pageInfo.name }}</span>
    </div>
    <div class="head-btn-group">
      <el-tooltip
        v-for="(mode,index) in alignList"
        :key="mode.value"
        popper-class="bs-el-tooltip-dark"
        effect="dark"
        :content="mode.label"
        placement="top"
      >
        <CusBtn
          class="align-btn"
          @click="setAlign(mode.value)"
        >
          <icon-svg
            :name="iconList[index]"
          />
        </CusBtn>
      </el-tooltip>

      <CusBtn
        :loading="saveAndPreviewLoading"
        @click.native="designAssign()"
      >
        设计分工
      </CusBtn>
      <CusBtn
        @click.native="showHostory"
      >
        历史操作
      </CusBtn>
      <CusBtn
        :disabled="undoDisabled"
        @click.native="undo(true)"
      >
        <i class="iconfont-bigscreen icon-jiantouqianjin icon-reverse" />
      </CusBtn>
      <CusBtn
        :disabled="redoDisabled"
        @click.native="undo(false)"
      >
        <i class="iconfont-bigscreen icon-jiantouqianjin" />
      </CusBtn>
      <CusBtn
        :loading="saveAndPreviewLoading"
        @click.native="createdImg()"
      >
        生成图片
      </CusBtn>
      <CusBtn
        :loading="saveAndPreviewLoading"
        @click.native="execRun()"
      >
        预览
      </CusBtn>
      <CusBtn
        :loading="saveLoading"
        @click="save('saveLoading')"
      >
        保存
      </CusBtn>
      <CusBtn @click="empty">
        清空
      </CusBtn>
      <CusBtn @click="showPageInfo">
        设置
      </CusBtn>
      <CusBtn @click="updateRightVisiable">
        <i
          class="iconfont-bigscreen"
          :class="rightFold ? 'icon-zhankaicaidan' : 'icon-shouqicaidan'"
        />
      </CusBtn>
    </div>
    <ChooseTemplateDialog
      ref="ChooseTemplateDialog"
      :has-create="false"
      :page-info="pageInfo"
      @replaceItByTemplate="replaceItByTemplate"
    />
    <AssignDialog ref="AssignDialog" />
    <HistoryList ref="HistoryList" />
  </div>
</template>
<script>
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import { toJpeg, toPng } from 'html-to-image'
import { mapMutations, mapActions, mapState } from 'vuex'
import { saveScreen } from 'data-room-ui/js/api/bigScreenApi'
import ChooseTemplateDialog from 'data-room-ui/BigScreenManagement/ChooseTemplateDialog.vue'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import uniqBy from 'lodash/uniqBy'
import { stringifyObjectFunctions } from 'data-room-ui/js/utils/evalFunctions'
import AssignDialog from 'data-room-ui/BigScreenDesign/AssignDialog/index.vue'
import HistoryList from 'data-room-ui/BigScreenDesign/HistoryList/index.vue'
import CusBtn from './BtnLoading'
import icons from 'data-room-ui/assets/images/alignIcon/export'
import IconSvg from 'data-room-ui/SvgIcon'
import {
  showSize,
  dataURLtoBlob,
  translateBlobToBase64
} from 'data-room-ui/js/utils/compressImg'
import * as imageConversion from 'image-conversion'
export default {
  name: 'PageTopSetting',
  components: {
    IconSvg,
    ChooseTemplateDialog,
    AssignDialog,
    CusBtn,
    HistoryList
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    rightFold: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      iconList: icons.getNameList(),
      alignList: [
        {
          label: '左侧对齐',
          value: 'left'
        },
        {
          label: '居中对齐',
          value: 'center'
        },
        {
          label: '右侧对齐',
          value: 'right'
        },
        {
          label: '顶部对齐',
          value: 'top'
        },
        {
          label: '中部对齐',
          value: 'middle'
        },
        {
          label: '底部对齐',
          value: 'bottom'
        },
        {
          label: '水平均分',
          value: 'levelAround'
        },
        {
          label: '垂直均分',
          value: 'verticalAround'
        }
      ],
      appInfo: '',
      saveLoading: false,
      createdImgLoading: false,
      saveAndPreviewLoading: false
    }
  },
  computed: {
    ...mapState({
      pageInfo: (state) => state.bigScreen.pageInfo,
      timelineStore: (state) => state.bigScreen.timelineStore,
      currentTimeLine: (state) => state.bigScreen.currentTimeLine,
      activeCodes: state => state.bigScreen.activeCodes
    }),
    pageCode () {
      return this.$route.query.code || this.code
    },
    undoDisabled () {
      return Boolean(this.currentTimeLine <= 1)
    },
    redoDisabled () {
      return Boolean(
        !this.timelineStore?.length ||
        (
          this.currentTimeLine &&
          this.currentTimeLine === this.timelineStore?.length
        )
      )
    }
  },
  methods: {
    ...mapActions({
      initLayout: 'bigScreen/initLayout'
    }),
    ...mapMutations({
      changeActiveCode: 'bigScreen/changeActiveCode',
      changeActiveItem: 'bigScreen/changeActiveItem',
      changePageInfo: 'bigScreen/changePageInfo',
      undoTimeLine: 'bigScreen/undoTimeLine',
      saveTimeLine: 'bigScreen/saveTimeLine'
    }),
    setAlign (command) {
      const pageInfo = cloneDeep(this.pageInfo)
      // 获取所有选中的组件
      let activeChartList = pageInfo.chartList.filter((chart) => {
        return this.activeCodes.some(code => (code === chart.code))
      })
      // 找到选中组件内的xy最大最小值
      const maxXW = Math.max.apply(Math, activeChartList.map(item => { return item.x + item.w }))
      let maxX = Math.max.apply(Math, activeChartList.map(item => { return item.x }))
      const minX = Math.min.apply(Math, activeChartList.map(item => { return item.x }))
      const maxYH = Math.max.apply(Math, activeChartList.map(item => { return item.y + item.h }))
      const maxY = Math.max.apply(Math, activeChartList.map(item => { return item.y }))
      const minY = Math.min.apply(Math, activeChartList.map(item => { return item.y }))
      const centerW = maxXW - minX
      const centerH = maxY - minY
      switch (command) {
        case 'left':
          activeChartList.forEach((chart) => {
            chart.x = minX
          })
          break
        case 'center':
          // eslint-disable-next-line no-case-declarations
          activeChartList.forEach((chart) => {
            chart.x = (centerW - chart.w) / 2 + minX
          })
          break
        case 'right':
          activeChartList.forEach((chart) => {
            chart.x = maxXW - chart.w
          })
          break
        case 'top':
          activeChartList.forEach((chart) => {
            chart.y = minY
          })
          break
        case 'middle':
          activeChartList.forEach((chart) => {
            chart.y = (centerH - chart.h) / 2 + minY
          })
          break
        case 'bottom':
          activeChartList.forEach((chart) => {
            chart.y = maxYH - chart.h
          })
          break
        case 'levelAround':
          // 先让数组根据x的属性进行排序
          activeChartList = activeChartList.sort(this.compare('x'))
          // eslint-disable-next-line no-case-declarations
          const minXW = activeChartList[0].x + activeChartList[0].w
          maxX = Math.max.apply(Math, activeChartList.map(item => { return item.x }))
          // 中间总的宽度
          // eslint-disable-next-line no-case-declarations
          let totalW = 0
          for (let i = 1; i < activeChartList.length - 1; i++) {
            totalW = totalW + activeChartList[i].w
          }
          // 中间剩余的空格
          // eslint-disable-next-line no-case-declarations
          const padding = (maxX - minXW - totalW) / (activeChartList.length - 1)
          // eslint-disable-next-line no-case-declarations
          let useW = 0
          for (let i = 1; i < activeChartList.length - 1; i++) {
            activeChartList[i].x = minXW + padding * i + useW
            useW = useW + activeChartList[i].w
          }
          break
        case 'verticalAround':
          // 先让数组根据y的属性进行排序
          activeChartList = activeChartList.sort(this.compare('y'))
          // eslint-disable-next-line no-case-declarations
          const minYH = activeChartList[0].y + activeChartList[0].h
          // eslint-disable-next-line no-case-declarations
          let totalH = 0
          for (let i = 1; i < activeChartList.length - 1; i++) {
            totalH = totalH + activeChartList[i].h
          }
          // eslint-disable-next-line no-case-declarations
          const paddingBottom = (maxY - minYH - totalH) / (activeChartList.length - 1)
          // eslint-disable-next-line no-case-declarations
          let useH = 0
          for (let i = 1; i < activeChartList.length - 1; i++) {
            activeChartList[i].y = minYH + paddingBottom * i + useH
            useH = useH + activeChartList[i].h
          }
          break
      }
      pageInfo.chartList = [...pageInfo.chartList, ...activeChartList]
      pageInfo.chartList = uniqBy(pageInfo.chartList, 'code')
      this.changePageInfo(pageInfo)
    },
    compare (property) {
      return function (obj1, obj2) {
        const value1 = obj1[property]
        const value2 = obj2[property]
        return value1 - value2 // 升序
      }
    },
    backManagement () {
      this.$router.push({ path: this.pageInfo.type === 'component' ? (window.BS_CONFIG?.routers?.componentUrl || '/big-screen-components') : (window.BS_CONFIG?.routers?.pageManagementUrl || '/home') })
      const data = { componentsManagementType: 'component' }
      this.$router.app.$options.globalData = data // 将数据存储在全局变量中
    },
    undo (isUndo) {
      this.undoTimeLine(isUndo)
    },
    // 清空
    empty () {
      this.changeActiveCode('')
      this.$emit('empty')
    },
    // 预览
    async execRun () {
      this.save('saveAndPreviewLoading').then((res) => {
        this.preview()
      })
    },
    // 预览
    preview () {
      const { href } = this.$router.resolve({
        path: window.BS_CONFIG?.routers?.previewUrl || '/big-screen/preview',
        query: {
          code: this.pageCode
        }
      })
      window.open(href, '_blank')
    },
    // 保存
    save (loadingType = 'saveLoading', hasPageTemplateId = false) {
      const pageInfo = cloneDeep(this.handleSaveData())
      // 保存页面
      this[loadingType] = true
      return new Promise((resolve, reject) => {
        if (!hasPageTemplateId) {
          delete pageInfo.pageTemplateId
        }
        const node = document.querySelector('.render-theme-wrap')
        toJpeg(node, { quality: 0.2 })
          .then((dataUrl) => {
            const that = this
            if (showSize(dataUrl) > 200) {
              const url = dataURLtoBlob(dataUrl)
              // 压缩到500KB,这里的500就是要压缩的大小,可自定义
              imageConversion
                .compressAccurately(url, {
                  size: 200, // 图片大小压缩到100kb
                  width: 1280, // 宽度压缩到1280
                  height: 720 // 高度压缩到720
                })
                .then((res) => {
                  translateBlobToBase64(res, function (e) {
                    pageInfo.coverPicture = e.result
                    saveScreen(pageInfo)
                      .then((res) => {
                        that.$message.success('保存成功')
                        resolve(res)
                      })
                      .finally(() => {
                        that[loadingType] = false
                      })
                  })
                })
            } else {
              pageInfo.coverPicture = dataUrl
              saveScreen(pageInfo)
                .then((res) => {
                  this.$message.success('保存成功')
                  resolve(res)
                })
                .finally(() => {
                  this[loadingType] = false
                })
            }
          })
          .catch(() => {
            this[loadingType] = false
          })
      })
    },
    goBack (path) {
      this.$router.push({
        path: `/${path}`
      })
    },
    // 得到模板列表
    getTemplateList (type) {
      this.$nextTick(() => {
        this.$refs.ChooseTemplateDialog.init(undefined, type)
      })
    },
    // 选择模版后覆盖配置
    selectTemplate (template) {
      this.pageInfo.pageTemplateId = template.id
      this.save('saveLoading', true).then(() => {
        this.initLayout(this.pageCode)
      })
    },
    replaceItByTemplate (config) {
      this.changePageInfo(config)
    },
    // 处理保存数据
    handleSaveData () {
      const pageInfo = cloneDeep(this.pageInfo)
      const chartList = cloneDeep(this.pageInfo.chartList)

      pageInfo.pageConfig.cacheDataSets =
        pageInfo.pageConfig.cacheDataSets?.map((cache) => ({
          name: cache.name,
          dataSetId: cache.dataSetId
        })) || []

      const newChartList = chartList?.map((chart) => {
        // 如果是自定义组件，需要将option转换为json字符串，因为其中可能有函数
        if (['customComponent', 'remoteComponent'].includes(chart.type)) {
          chart.option.data = []
          chart.option = stringifyObjectFunctions(chart.option)
        }
        return chart
      })
      return cloneDeep({
        ...this.pageInfo,
        chartList: newChartList
      })
    },
    updateRightVisiable () {
      this.$emit('updateRightVisiable', !this.rightFold)
    },
    showPageInfo () {
      this.$emit('showPageInfo')
    },
    designAssign () {
      this.$refs.AssignDialog.init()
    },
    showHostory () {
      this.$refs.HistoryList.init()
    },
    createdImg () {
      this.saveAndPreviewLoading = true
      // 暂停跑马灯动画
      EventBus.$emit('stopMarquee')
      const node = document.querySelector('.render-theme-wrap')
      toPng(node)
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `${this.pageInfo.name}.png`
          link.href = dataUrl
          link.click()
          link.addEventListener('click', () => {
            link.remove()
          })
          this.saveAndPreviewLoading = false
          // 恢复跑马灯动画
          EventBus.$emit('startMarquee')
        })
        .catch(() => {
          this.$message.warning('出现未知错误，请重试')
          this.saveAndPreviewLoading = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../BigScreenDesign/fonts/iconfont.css';
.default-layout-box {
  display: flex;
  flex-wrap: wrap;

  .default-layout-item {
    cursor: pointer;
    width: 42%;
    margin: 9px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .component-name {
      font-size: 12px;
    }

    .sampleImg {
      margin: 0 auto;
      width: 102px;
      height: 73px;
      display: block;
    }

    .img_dispaly {
      margin: 0 auto;
      text-align: center;
      width: 100px;
      height: 70px;
      line-height: 70px;
      background-color: #d7d7d7;
      color: #999;
    }

    .demonstration {
      text-align: center;
    }
  }

  .default-layout-item:hover {
    cursor: pointer;
  }

  ::v-deep .el-radio__label {
    display: none;
  }
}

.page-top-setting-wrap {
  height: 40px;
  background-color: var(--bs-background-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  color: #ffffff;
  padding: 0 5px;

  .app-name {
    cursor: pointer;
  }

  .head-btn-group {
    display: flex;
    margin-left: 50px;

    i {
      font-size: 14px;
    }

    .icon-reverse {
      transform: rotate(180deg);
    }
  }

  .item-wrap {
    display: flex;
    align-items: center;

    .menu-img {
      width: 18px;
      height: 18px;
      margin-left: 9px;
      margin-right: 15px;
      cursor: pointer;
    }

    .logo-text {
      user-select: none;
      margin-left: 9px;
      font-size: 14px;
      color: #ffffff;
    }

    .name-span {
      max-width: 300px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
