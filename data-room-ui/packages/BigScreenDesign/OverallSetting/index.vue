<template>
  <div class="bs-overall-wrap">
    <SettingTitle>整体布局</SettingTitle>
    <el-scrollbar class="side-catalog-box">
      <div class="bs-overall-setting-wrap">
        <el-form
          ref="form"
          v-model="form"
          label-width="100px"
          label-position="left"
          class="setting-body bs-el-form"
        >
          <el-form-item label="推荐分辨率">
            <el-select
              v-model="resolutionRatioValue"
              class="bs-el-select select"
              popper-class="bs-el-select"
              placeholder="请选择分辨率"
              clearable
              @change="resolutionRatioValueHandel"
            >
              <el-option
                v-for="resolutionRatio in resolutionRatioOptions"
                :key="resolutionRatio.value"
                :label="resolutionRatio.label"
                :value="resolutionRatio.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="大屏宽度">
            <el-input-number
              v-model="form.w"
              class="bs-el-input-number"
              :min="100"
              :max="8000"
            />
          </el-form-item>
          <el-form-item label="大屏高度">
            <el-input-number
              v-model="form.h"
              class="bs-el-input-number"
              :min="100"
              :max="8000"
            />
          </el-form-item>
          <el-form-item label="自适应模式">
            <el-select
              v-model="form.fitMode"
              class="bs-el-select"
              popper-class="bs-el-select"
              placeholder="自适应模式"
              clearable
            >
              <el-option
                v-for="mode in autoModeOptions"
                :key="mode.value"
                :label="mode.label"
                :value="mode.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开启磁吸">
            <el-switch
              v-model="currentSnap"
              class="bs-el-switch"
              active-color="#007aff"
              :active-value="30"
              :inactive-value="3"
              @change="snapHandler"
            />
          </el-form-item>
          <el-form-item label="主题">
            <el-select
              v-model="form.customTheme"
              class="bs-el-select select"
              popper-class="bs-el-select"
              placeholder="请选择主题"
              clearable
              @change="changeTheme"
            >
              <el-option
                v-for="themeItem in themeOptions"
                :key="themeItem.value"
                :label="themeItem.label"
                :value="themeItem.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="背景图">
            <el-button
              v-if="!form[currentBg]"
              type="primary"
              @click="$refs.bgImg.init()"
            >
              选择背景图
            </el-button>
            <el-image
              v-if="form[currentBg]"
              class="bg-img bs-el-img"
              :src="getCoverPicture(form[currentBg])"
              fit="cover"
              @click="$refs.bgImg.init()"
            />
            <div
              v-show="form[currentBg]"
              @click="form[currentBg] = ''"
            >
              <i class="el-icon-circle-close close-icon" />
            </div>
            <span
              v-if="form[currentBg]"
              class="description"
            >（背景图优先级高于背景色，设置后将覆盖背景色）</span>
            <BgImg
              ref="bgImg"
              :form="form"
              @imgUrl="form[currentBg] = $event"
            />
          </el-form-item>
          <el-form-item label="背景色">
            <ColorPicker
              v-model="form[currentBgColor]"
              :placeholder="form[currentBg] ? '' : '请选择背景色'"
              :predefine-colors="predefineColors"
            />
          </el-form-item>
        </el-form>
      </div>
      <div>
        <SettingTitle>定时器</SettingTitle>
        <!-- 定时器空数据 -->
        <el-empty
          v-if="timerEmptyState()"
          description="请添加图表，并绑定数据集"
        />
        <div
          v-else
          class="bs-overall-setting-wrap"
        >
          <div class="title">
            <span>时间（秒）</span>
            <span>图表</span>
            <span />
          </div>
          <div
            v-for="(timer, index) in pageInfo.pageConfig.refreshConfig"
            :key="index"
            class="bs-timer-item"
          >
            <el-input-number
              v-model="timer.time"
              class="bs-el-input-number"
              :min="0"
              :max="999999"
              :step="1"
              placeholder="请输入定时器时间"
              style="margin-right: 8px;"
            />
            <el-select
              v-model="timer.code"
              class="bs-el-select"
              popper-class="bs-el-select"
              placeholder="请选择需要刷新的图表"
              @change="chartChange"
            >
              <el-option
                v-for="chart in chartOptions"
                :key="chart.code"
                :label="chart.title"
                :value="chart.code"
                :disabled="chart.disabled"
              />
            </el-select>
            <el-button
              style="margin-left: 8px;"
              class="bs-el-button-default"
              @click="deleteTimer(index)"
            >
              删除
            </el-button>
          </div>
          <el-button
            v-if="pageInfo.chartList.length !== pageInfo.pageConfig.refreshConfig.length"
            type="primary"
            style="width: 100%;"
            @click="createTimer"
          >
            新建
          </el-button>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import BgImg from 'data-room-ui/BigScreenDesign/OverallSetting/BgImgDialog.vue'
import { mapState, mapMutations } from 'vuex'
import { themeToSetting } from 'data-room-ui/js/utils/themeFormatting'
import { predefineColors } from 'data-room-ui/js/utils/colorList'
import { getFileUrl } from 'data-room-ui/js/utils/file'
export default {
  name: 'OverallSetting',
  components: {
    ColorPicker,
    SettingTitle,
    BgImg
  },
  directives: {
    block: {
      bind (el, binding) {
        el.style.width = binding.value || '100%'
      }
    }
  },
  data () {
    return {
      resolutionRatioValue: '',
      // 自适应模式  无(none) 、自动(auto)、宽度铺满(fitWidth)、高度铺满(fitHeight)和 双向铺满（cover） 5 种自适应模式
      autoModeOptions: [
        {
          value: 'none',
          label: '无'
        },
        {
          value: 'auto',
          label: '自动'
        },
        {
          value: 'fitWidth',
          label: '宽度铺满'
        },
        {
          value: 'fitHeight',
          label: '高度铺满'
        },
        {
          value: 'cover',
          label: '双向铺满'
        }
      ],
      drawerVisible: false,
      resolutionRatioOptions: [
        {
          value: '1024*768',
          label: '1024*768'
        },
        {
          value: '1280*720',
          label: '1280*720'
        },
        {
          value: '1920*1080',
          label: '1920*1080'
        },
        {
          value: '2560*1440',
          label: '2560*1440'
        },
        {
          value: '3840*2160',
          label: '3840*2160'
        },
        {
          value: '5120*2880',
          label: '5120*2880'
        },
        {
          value: '7680*4320',
          label: '7680*4320'
        }
      ],
      themeOptions: [
        {
          value: 'dark',
          label: '暗黑'
        },
        {
          value: 'light',
          label: '明亮'
        }
        // {
        //   value: 'auto',
        //   label: '透明'
        // },
        // {
        //   value: 'custom',
        //   label: '自定义'
        // }
      ],
      form: {
        w: 1920,
        h: 1080,
        bg: '',
        bgColor: '#151a26', // 背景色
        lightBg: '',
        lightBgColor: '#f5f7fa',
        opacity: 100,
        customTheme: 'dark',
        themeJson: {},
        cacheDataSets: [],
        refreshConfig: [],
        fitMode: 'none'
      },
      // 预设主题色
      predefineColors,
      // 图表列表
      chartOptions: []
    }
  },
  computed: {
    ...mapState({
      pageInfo: state => state.bigScreen.pageInfo,
      config: state => state.bigScreen.activeItemConfig
    }),
    currentSnap: {
      get () {
        // return this.snap
        return this.$store.state.bigScreen.snapTolerance
      },
      set (val) {
      }
    },
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    },
    // 根据主题色来决定背景色和背景图绑定什么变量
    currentBgColor () {
      return this.form.customTheme === 'light' ? 'lightBgColor' : 'bgColor'
    },
    currentBg () {
      return this.form.customTheme === 'light' ? 'lightBg' : 'bg'
    },
    dsValue () {
      return this.form.cacheDataSets?.map(dSet => ({
        id: dSet.dataSetId,
        name: dSet.name
      })) || []
    }
  },
  watch: {
    form: {
      handler (val) {
        this.changePageConfig(val)
        // 改变大屏的整体配置后，需要判断元素是否在大屏内，如果不在大屏内，需要将元素尽量往内部靠拢
        this.pageInfo.chartList.forEach(item => {
          if (item.x + item.w > this.form.w) {
            item.x = this.form.w - item.w
          }
          if (item.y + item.h > this.form.h) {
            item.y = this.form.h - item.h
          }
        })
      },
      deep: true
    },
    'pageInfo.pageConfig.refreshConfig': {
      handler (val) {
        if (Array.isArray(val) && val.length) {
          this.chartOptions.forEach(chart => {
            chart.disabled = val?.findIndex(item => item.code === chart.code) !== -1
          })
        }
      },
      deep: true
    }
  },

  created () { },
  mounted () {
    this.initResolution()
    this.init()
  },
  methods: {
    ...mapMutations('bigScreen', [
      'changePageLoading',
      'changePageConfig',
      'changeLayout',
      'changeChartKey',
      'changeRefreshConfig',
      'changePageInfo',
      'snapChange'
    ]),
    // 切换主题时更新主题配置
    changeTheme (theme) {
      const pageInfo = this.pageInfo
      pageInfo.chartList = themeToSetting(pageInfo.chartList, theme)
      this.changePageInfo(pageInfo)
      pageInfo.chartList.forEach(chart => {
        if (chart.type === 'remoteComponent') {
          this.$emit('styleHandler', chart)
        }
      })
      if (!this.isPreview) {
        const themeLabel = theme === 'light' ? '明亮' : '暗黑'
        const htmlStr = `<span>当前已切换到<strong>${themeLabel}</strong>主题，颜色设置针对当前主题生效</span>`
        this.$notify({
          title: '注意',
          dangerouslyUseHTMLString: true,
          message: htmlStr,
          customClass: 'ds-el-notify',
          type: 'warning'
        })
      }
    },
    init () {
      if (!this.pageInfo.pageConfig.refreshConfig) {
        this.pageInfo.pageConfig.refreshConfig = []
      }
      this.form = { ...this.pageInfo.pageConfig }
      this.drawerVisible = true
      if (this.pageInfo.chartList.length === 0) {
        this.pageInfo.pageConfig.refreshConfig = []
        this.changeRefreshConfig([])
        this.form.refreshConfig = []
      } else {
        this.pageInfo.chartList.forEach(chart => {
          if (chart.dataSource?.businessKey || chart.type === 'marquee') {
            this.chartOptions.push({
              code: chart.code,
              title: chart.title,
              disabled: false
            })
          } else {
            this.pageInfo.pageConfig.refreshConfig = this.pageInfo?.pageConfig?.refreshConfig?.filter(item => item.code !== chart.code) || []
          }
        })
      }
    },
    // 添加定时器
    createTimer () {
      const timer = {
        code: '',
        time: 0
      }
      if (!this.pageInfo.pageConfig.refreshConfig) {
        this.pageInfo.pageConfig.refreshConfig = []
      }
      this.pageInfo.pageConfig.refreshConfig.push(timer)
    },
    chartChange (val) {
      this.chartOptions.find(item => item.code === val).disabled = true
    },
    deleteTimer (timerIndex) {
      this.pageInfo.pageConfig.refreshConfig.splice(timerIndex, 1)
    },
    resolutionRatioValueHandel (val) {
      if (val) {
        this.form.w = Number(val.split('*')[0])
        this.form.h = Number(val.split('*')[1])
      } else {
        this.form.w = this.pageInfo.type === 'component' ? 1024 : 1920
        this.form.h = this.pageInfo.type === 'component' ? 768 : 1080
      }
    },
    initResolution () {
      this.resolutionRatioValue = this.pageInfo.pageConfig.w + '*' + this.pageInfo.pageConfig.h
    },

    // 新增数据集
    addCacheDataSet () {
      this.form.cacheDataSets.push({
        // 数据集名称
        name: '',
        // 数据集id
        dataSetId: ''
      })
    },
    // 删除数据集
    deleteCacheDataSet (index) {
      this.form.cacheDataSets.splice(index, 1)
    },
    // 选择数据集
    getSelectDs (selectDs) {
      this.form.cacheDataSets = selectDs?.map(ds => ({
        name: ds.name,
        dataSetId: ds.id
      }))
    },
    close () {
      this.drawerVisible = false
      this.$emit('close')
    },
    timerEmptyState () {
      return this.pageInfo.chartList.every(chart => chart.dataSource?.businessKey === '' && chart.type !== 'marquee')
    },
    snapHandler (val) {
      // this.$emit('changeSnap', val)
      this.snapChange(val)
    },
    /**
     * 获取图片访问地址,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture (url) {
      return getFileUrl(url)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';

.bs-overall-wrap {
  position: relative;
  height: 100%;
  background: var(--bs-background-2);

  .bs-overall-setting-wrap {
    padding: 16px;

    .title {
      display: flex;
      justify-content: space-around;
      margin-bottom: 18px;
    }

    .bs-timer-item {
      display: flex;
      margin-bottom: 18px;
    }
  }

  ::v-deep .el-input__inner,
  ::v-deep .el-color-picker__color-inner,
  ::v-deep .el-input-number--mini,
  ::v-deep .el-textarea__inner,
  ::v-deep .el-input-group__append,
  ::v-deep .el-radio__label {
    background: var(--bs-el-background-1);
    color: var(--bs-el-text);
    border: 0 !important;
  }

  ::v-deep .el-form-item__label {
    color: var(--bs-el-title);
    font-size: 12px;
  }

  ::v-deep .el-radio {
    margin-right: 10px
  }

  ::v-deep .el-table {
    background: var(--bs-el-background-1);
    border-bottom: 1px solid var(--bs-el-title);
  }

  ::v-deep .el-table__cell {
    background: var(--bs-el-background-1) !important;
    color: var(--bs-el-title) !important;
    border-color: var(--bs-el-text) !important;
  }

  ::v-deep .el-input__inner {
    &:placeholder {
      color: var(--bs-el-text);
    }
  }
}

.bg-img {
  width: 180px;
  height: 150px;
  cursor: pointer;
  position: relative;
}

.close-icon {
  left: 150px;
  top: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #ffffff;
  position: absolute;
}

.select {
  display: table-footer-group;
}

.description {
  display: block;
  margin-top: 8px;
  font-size: 12px;
}

.toolbar {
  width: 320px;
  height: 50px;
  bottom: 0;
  z-index: 10;
  position: fixed;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bs-background-1);

  .el-button {
    margin-right: 10px;
  }
}

::v-deep .el-drawer__wrapper {
  z-index: 2000 !important;

  .setting-body {
    padding: 16px;
  }
}

::v-deep .el-drawer__body {
  padding: 0;
  margin-bottom: 0;
  overflow: hidden;
}

::v-deep .el-drawer__container {
  height: calc(100% - 40px) !important;
  top: 40px !important;
  position: relative;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
}

.select-item {
  display: flex;
  margin-bottom: 8px;
  cursor: pointer;
  align-items: center;
  border: 1px solid #fff;
  padding: 4px;

  .input-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    margin-right: 2px;
    color: #36474f;

    ::v-deep .el-form-item {
      margin-bottom: 0 !important;
    }

    .el-input-number--mini {
      width: 90px !important;
    }
  }

  .input-wrap-right {
    width: 30px;
    flex: unset;
  }

  .input-wrap_left {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: left;
  }

  .select-line-icon {
    width: 30px;
    font-size: 18px;
    cursor: pointer;
    text-align: center;
  }

  .option-delete {
    color: #f56c6c;
  }
}

::v-deep .el-color-picker--mini .el-color-picker__trigger {
  height: 32px;
  width: 32px;
  border: 1px solid var(--bs-el-background-1);
  background: var(--bs-el-background-1);

  .el-color-picker__color {
    background: var(--bs-el-background-1);
    border: 0 !important;
  }
}

.side-catalog-box {
  height: calc(100% - 50px);
  overflow-y: auto;
}

</style>
<style lang="scss">
//修改notify的样式
.ds-el-notify {
  background-color: var(--bs-el-background-1)!important;
  border: var(--bs-el-border)!important;
  .el-notification__title{
    color: #fff!important;
  }
  .el-notification__content{
    color: #fff!important;
  }
  .el-notification__closeBtn{
    color: #fff!important;
  }
}
</style>
