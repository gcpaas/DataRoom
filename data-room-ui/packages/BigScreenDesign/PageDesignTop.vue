<template>
  <div class="page-top-setting-wrap">
    <div class="logo-wrap item-wrap">
      <img
        class="menu-img"
        src="../BigScreenDesign/images/app.png"
        alt="返回"
        @click="goBackManage"
      >
      <span class="logo-text name-span">{{ pageInfo.name }}</span>
    </div>
    <div class="head-btn-group">
      <span style="margin-right:8px;font-size:12px">缩放</span>
      <el-input-number
        ref="zoomInput"
        class="bs-el-input-number"
        style="margin-right:10px"
        :value="zoom"
        :min="1"
        label="描述文字"
        :controls="true"
        @change="changeZoom"
      />
      <CusBtn
        :loading="saveAndPreviewLoading"
        @click.native="changeZoom('auto')"
      >
        自适应
      </CusBtn>
      <el-dropdown
        trigger="click"
        class="align-list-dropdown"
      >
        <CusBtn type="primary">
          对齐方式<i class="el-icon-arrow-down el-icon--right" />
        </CusBtn>
        <el-dropdown-menu
          slot="dropdown"
          class="align-dropdown-menu"
        >
          <el-dropdown-item
            v-for="(mode, index) in alignList"
            :key="mode.value"
            @click.native="setAlign(mode.value)"
          >
            <icon-svg
              style="padding:3px 8px"
              :name="iconList[index]"
            />
            <span style="color: #bcc9d4">{{ mode.label }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <CusBtn
        :loading="saveAndPreviewLoading"
        @click.native="designAssign()"
      >
        设计分工
      </CusBtn>
      <CusBtn @click.native="showHostory">
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
  compressImage
} from 'data-room-ui/js/utils/compressImg'
// import * as imageConversion from 'image-conversion'
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
      initialCoverPicture: '',
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
      activeCodes: state => state.bigScreen.activeCodes,
      zoom: (state) => state.bigScreen.zoom
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
  mounted () {
    this.initialCoverPicture = this.pageInfo.coverPicture || ''
    this.$refs.zoomInput.$el.addEventListener('mousewheel', this.handleMouseWheel)
  },
  beforeDestroy () {
    this.$refs.zoomInput.$el.removeEventListener('mousewheel', this.handleMouseWheel)
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
    handleMouseWheel () {
      const delta = Math.sign(event.deltaY)
      // 限制最小缩放比例为10
      if (this.zoom <= 10 && delta > 0) return
      event.preventDefault()
      const zoom1 = this.zoom - delta
      this.$emit('changeZoom', zoom1)
    },
    changeZoom (val) {
      this.$emit('changeZoom', val)
    },
    setAlign (command) {
      const pageInfo = cloneDeep(this.pageInfo)
      // 获取所有选中的组件
      let activeChartList = pageInfo.chartList.filter((chart) => {
        return this.activeCodes.some(code => (code === chart.code))
      })
      // 找到选中组件内的xy最大最小值
      const maxXW = Math.max.apply(Math, activeChartList.map(item => { return item.x + item.w }))
      const maxYH = Math.max.apply(Math, activeChartList.map(item => { return item.y + item.h }))
      let maxX = Math.max.apply(Math, activeChartList.map(item => { return item.x }))
      let maxY = Math.max.apply(Math, activeChartList.map(item => { return item.y }))
      const minX = Math.min.apply(Math, activeChartList.map(item => { return item.x }))
      const minY = Math.min.apply(Math, activeChartList.map(item => { return item.y }))
      const centerW = maxXW - minX
      const centerH = maxYH - minY
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
          maxY = Math.max.apply(Math, activeChartList.map(item => { return item.y }))
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
    goBackManage () {
      this.$confirm('确定返回主页面吗？未保存的配置将会丢失。', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '保存后离开页面',
        cancelButtonText: '离开页面',
        cancelButtonClass: 'cancel-btn',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        const flag = await this.save()
        if (flag) {
          await this.backManagement()
        }
      }).catch((action) => {
        if (action === 'cancel') {
          this.backManagement()
        }
      })
    },
    backManagement () {
      const data = { componentsManagementType: 'component' }
      this.$router.app.$options.globalData = data // 将数据存储在全局变量中
      this.$router.push({ path: this.pageInfo.type === 'component' ? (window.BS_CONFIG?.routers?.componentUrl || '/big-screen-components') : (window.BS_CONFIG?.routers?.pageListUrl || '/big-screen-list') })
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
      this.save('preview').then((res) => {
        if (res) {
          this.preview(res)
        }
      })
    },
    // 预览
    preview (previewCode) {
      const { href } = this.$router.resolve({
        path: window.BS_CONFIG?.routers?.previewUrl || '/big-screen/preview',
        query: {
          code: previewCode || this.pageCode
        }
      })
      window.open(href, '_blank')
    },
    // 保存时判断tabs组件里面的元素是否符合要求
    validateTabs (chartList) {
      let isValid = true
      if (chartList.length) {
        for (const chart of chartList) {
          if (chart.type === 'chartTab' && chart.customize.tabList.length !== 0) {
            for (const tab of chart.customize.tabList) {
              if ((!tab.name) || (!tab.chartCode)) {
                isValid = false
                return isValid
              }
            }
          }
        }
      }
      return isValid
    },
    // 保存
    async save (type, hasPageTemplateId = false) {
      const pageInfo = cloneDeep(this.handleSaveData())
      // 保存时判断tabs组件里面的元素是否符合要求
      const flag = this.validateTabs(pageInfo?.chartList)
      if (!flag) {
        this.$message.warning('请完成tab项配置')
        return false
      }
      // 保存页面
      try {
        if (!hasPageTemplateId) {
          delete pageInfo.pageTemplateId
        }
        if (type === 'preview') {
          pageInfo.isPreview = true
          const res = await saveScreen(pageInfo)
          return res
        } else {
          pageInfo.isPreview = false
          this.saveLoading = true
          pageInfo.coverPicture = this.initialCoverPicture
          const node = document.querySelector('.render-theme-wrap')
          let dataUrl = ''
          let res = null
          try {
            dataUrl = await toJpeg(node, { quality: 0.2 })
          } catch (error) {
            // 判断的error.currentTarget是img标签，如果是的，就弹出消息说是图片跨域
            // 确认框
            this.$confirm('保存封面失败，我们将使用上次保存的封面，不会影响大屏数据的保存。可能是因为图片、视频资源跨域了导致使用toDataURL API生成图片失败，我们可以将资源上传到资源库。然后在组件中使用资源库中的图片资源，以确保没有跨域问题。', '提示', {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'warning',
              customClass: 'bs-el-message-box'
            }).then(async () => {
              res = await saveScreen(pageInfo)
              this.$message.success('保存成功')
            }).catch(async () => {
              res = await saveScreen(pageInfo)
              this.$message.success('保存成功')
            })
          }
          if (dataUrl) {
            if (showSize(dataUrl) > 200) {
              // const newData = compressImage(dataUrl, 800)
              // const url = dataURLtoBlob(dataUrl)
              // // 压缩到500KB,这里的500就是要压缩的大小,可自定义
              // const imgRes = await imageConversion.compressAccurately(url, {
              //   size: 200, // 图片大小压缩到100kb
              //   width: 1280, // 宽度压缩到1280
              //   height: 720 // 高度压缩到720
              // })
              // const base64 = await translateBlobToBase64(imgRes)
              // pageInfo.coverPicture = base64.result
              this.$message.info('由于封面图片过大，进行压缩中')
              const compressCoverPicture = await compressImage(dataUrl, { width: 1280, height: 720, size: 400, quality: 1 })
              pageInfo.coverPicture = compressCoverPicture
            } else {
              pageInfo.coverPicture = dataUrl
            }
            res = await saveScreen(pageInfo)
            this.$message.success('保存成功')
          }
          return res
        }
      } catch (error) {
        console.error(error)
        this.saveLoading = false
        throw error
      } finally {
        this.saveLoading = false
      }
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
        if (['customComponent', 'remoteComponent', 'echartsComponent'].includes(chart.type)) {
          // chart.option.data = []
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
        }).catch((error) => {
          this.saveAndPreviewLoading = false
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
    }
    // createdImg () {
    //   this.saveAndPreviewLoading = true
    //   // 暂停跑马灯动画
    //   EventBus.$emit('stopMarquee')
    //   const node = document.querySelector('.render-theme-wrap')
    //   // 获取node 下的所有img标签，拿到他们的src
    //   const imgTags = node.querySelectorAll('img')
    //   const requests = Array.from(imgTags).map(img => {
    //     const src = img.getAttribute('src')
    //     return fetch(src, {
    //       headers: { 'Access-Control-Allow-Origin': '*' }
    //     }).then(response => {
    //       if (response.ok) {
    //         return response.blob()
    //       } else {
    //         throw new Error('网络请求失败')
    //       }
    //     }).then(blob => {
    //       return new Promise((resolve, reject) => {
    //         const reader = new FileReader()
    //         reader.onload = () => resolve(reader.result)
    //         reader.onerror = reject
    //         reader.readAsDataURL(blob)
    //       })
    //     }).then(dataUrl => {
    //       img.setAttribute('src', dataUrl)
    //     }).catch(error => {
    //       console.error('Fetch error:', error)
    //     })
    //   })

    //   Promise.all(requests).then(() => {
    //     toPng(node)
    //       .then((dataUrl) => {
    //         const link = document.createElement('a')
    //         link.download = `${this.pageInfo.name}.png`
    //         link.href = dataUrl
    //         link.click()
    //         link.addEventListener('click', () => {
    //           link.remove()
    //         })
    //         this.saveAndPreviewLoading = false
    //         // 恢复跑马灯动画
    //         EventBus.$emit('startMarquee')
    //       }).catch((error) => {
    //         console.info(error)
    //         this.$message.warning('出现未知错误，请重试')
    //         this.saveAndPreviewLoading = false
    //       })
    //   }).catch(error => {
    //     console.error('Fetch error:', error)
    //   })
    // }
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
    align-items: center;

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

  .theme-switch {
    margin-right: 10px;

    ::v-deep .el-switch__label {
      color: #bcc9d4 !important;
    }

    ::v-deep .el-switch__label.is-active {
      color: var(--bs-el-color-primary) !important;
    }
  }

  .align-list-dropdown {
    width: 100px !important;
    color: #ffffff !important;
  }

}

// 自定义dropdown的样式
.align-dropdown-menu {
  background-color: var(--bs-background-2) !important;
  border: 1px solid var(--bs-border-1);

  ::v-deep  .el-dropdown-menu__item {
    background-color: var(--bs-background-2) !important;

    &:hover {
      color: var(--bs-el-color-primary) !important;
      background-color: var(--bs-el-background-3) !important;
    }
  }

}

::v-deep .el-input__inner,
::v-deep .el-color-picker__color-inner,
::v-deep .el-input-number--mini,
::v-deep .el-textarea__inner,
::v-deep .el-input-group__append {
  background: var(--bs-el-background-1);
  color: var(--bs-el-text);
  border: 0 !important;
  width: 100px;
}

// .bs-el-input-number{

// }
</style>
