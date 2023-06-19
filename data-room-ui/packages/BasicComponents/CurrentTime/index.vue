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
          config.customize.fontWeight
      "
    >
      {{ nowTime }}
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import paramsMixins from 'packages/js/mixins/paramsMixins'
export default {
  name: 'CurrentTime',
  mixins: [paramsMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
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
@import "~packages/BasicComponents/fonts/index.css";
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
  }
</style>
