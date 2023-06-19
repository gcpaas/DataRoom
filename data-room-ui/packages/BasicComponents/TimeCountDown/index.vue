<template>
  <div
    class="bs-design-wrap"
    :class="`bs-time-count-down-${customTheme}`"
  >
    <span
      v-if="isPast"
      style="color: #ea0b30"
    >(已过期)</span>
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
          config.customize.fontWeight
      "
    >
      {{ dateDiff }}
    </div>
  </div>
</template>

<script>
import paramsMixins from 'packages/js/mixins/paramsMixins'
export default {
  name: 'TimeCountDown',
  mixins: [paramsMixins],
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      timer: '',
      allTime: 0,
      date: '',
      time: new Date().getTime()
    }
  },
  computed: {
    isPast: {
      get () {
        if (new Date(this.config.endTime).getTime() - this.time < 0) {
          return true
        } else {
          return false
        }
      }
    },
    dateDiff: {
      // eslint-disable-next-line vue/return-in-computed-property
      get () {
        if (this.config.endTime) {
          return this.dateFormat(
            new Date(this.config.endTime).getTime() - this.time
          )
        }
      },
      set (val) {
        this.allTime = val
      }
    }
  },
  watch: {
    'config.endTime': {
      handler () {
        this.getTime()
      },
      immediate: true
    }
  },
  mounted () {
    this.config.endTime = this.config.endTime
      ? new Date(this.config.endTime).getTime()
      : new Date().getTime() + 3 * 3600 * 1000 * 24 - 1000
    this.getTime()
  },
  // 销毁定时器
  destroyed () {
    if (this.timer) {
      clearInterval(this.timer) // 关闭
    }
  },

  methods: {
    getTime () {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.time = this.time + 1000
        if (this.dateDiff <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    // 格式化时间
    dateFormat (dateDiff) {
      if (dateDiff < 0) {
        dateDiff = -dateDiff
      }
      const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)) // 计算出相差天数
      const leave1 = dateDiff % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
      const hours = Math.floor(leave1 / (3600 * 1000)) // 计算出小时数
      // 计算相差分钟数
      const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
      const minutes = Math.floor(leave2 / (60 * 1000)) // 计算相差分钟数
      // 计算相差秒数
      const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
      const seconds = Math.round(leave3 / 1000)
      // const leave4=leave3%(60*1000)      //计算分钟数后剩余的毫秒数
      // const minseconds=Math.round(leave4/1000)
      const timeFn =
        dayDiff +
        ' 天 ' +
        hours +
        ' 小时 ' +
        minutes +
        ' 分钟 ' +
        seconds +
        ' 秒'
      return timeFn
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~packages/BasicComponents/fonts/index.css";
.bs-design-wrap{
  width: 100%;
}
.time {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
.light-theme {
  background-color: #ffffff;
  color: #000000;
}
.dark-theme {
  background-color: #000000;
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
  overflow: hidden;
}
</style>
