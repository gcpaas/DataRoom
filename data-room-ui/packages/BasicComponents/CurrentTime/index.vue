<template>
  <div
    class="bs-design-wrap"
    :class="`bs-current-time-${customTheme}`"
  >
    <div
      :class="[
        'time',
        {
          'light-theme': customTheme === 'light',
          'auto-theme': customTheme == 'auto',
          'dark-theme': customTheme == 'dark'
        }
      ]"
      class="time-text-box"
      :style="
        'font-size:' +
          config.customize.fontSize +
          'px;color:' +
          config.customize.color +
          ';font-weight:' +
          config.customize.fontWeight+
          ';font-family:' +
          config.customize.fontFamily
      "
    >
      {{ nowTime }}
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'
import { mapMutations, mapState } from 'vuex'
export default {
  name: 'CurrentTime',
  mixins: [paramsMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapState({
      customTheme: state => state.bigScreen.pageInfo.pageConfig.customTheme,
      activeCode: state => state.bigScreen.activeCode
    })
  },
  data () {
    return {
      nowTime: '',
      time: new Date(),
      currentTime: new Date()
    }
  },
  mounted () {
    this.getCurrentTime(this.config.dateFormat)
  },
  // 销毁定时器
  destroyed () {
    if (this.timer) {
      clearInterval(this.timer) // 关闭
    }
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig',
      changeActiveItemConfig: 'bigScreen/changeActiveItemConfig'
    }),
    changeStyle (config) {
      this.getCurrentTime(config.dateFormat)
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
    },
    // 实时显示当前系统时间
    getCurrentTime (dateFormat) {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.dateFormat(dateFormat)
      this.timer = setInterval(() => {
        this.dateFormat(dateFormat)
      }, 1000)
    },
    // 格式化时间
    dateFormat () {
      this.nowTime = moment(new Date().getTime()).format(
        this.config.dateFormat
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../BasicComponents/fonts/index.css";
@import "../../assets/fonts/numberFont/stylesheet.css";
.bs-design-wrap{
  width: 100%;
}
.time {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-theme {
  background-color: #ffffff;
  color: #000000;
}
.dark-theme {
  background-color:transparent;
  color: #ffffff;
}
.auto-theme {
  background-color: transparent;
  color: #000000;
}
.time-text-box{
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space:nowrap;
  box-sizing: border-box;
  }
</style>
