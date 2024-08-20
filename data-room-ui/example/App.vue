<template>
  <div>
    <transition name="fade">
      <router-view />
    </transition>
    <el-dialog
      class="disclaimer-dialog"
      title="免责声明"
      :visible.sync="dialogVisible"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="false"
      width="80%"
    >
      <span v-html="message" />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="out">退出</el-button>
        <el-button
          type="primary"
          :disabled="time>0"
          @click="agree"
        >我已知晓<span
          v-if="time"
          style="padding-left: 4px"
        >{{ time }}</span></el-button>

      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'App',
  updated () {
    const loading = document.getElementById('loader-wrapper')
    if (loading) {
      document.body.removeChild(loading)
    }
  },
  data () {
    return {
      dialogVisible: false,
      message: '',
      timer: null,
      time: 10

    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 如果不是演示环境或者已经阅读过免责声明，则不显示弹窗
      if ((!window?.SITE_CONFIG?.demoEnv) || sessionStorage.getItem('disclaimer') === 'read ') {
        return
      }
      this.dialogVisible = true
      // 新建是否阅读免责声明的本地存储
      sessionStorage.setItem('disclaimer', '')
      this.$dataRoomAxios.get('/dataroom/opensource/disclaimer').then(res => {
        this.message = res
        this.timer = setInterval(() => {
          if (this.time > 0) {
            this.time--
          } else {
            clearInterval(this.timer)
          }
        }, 1000)
      })
    },
    out () {
      try {
        window.close()
      } catch (e) {
        window.location.href = 'about:blank'
      }
    },
    agree () {
      sessionStorage.setItem('disclaimer', 'read ')
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
@import '../packages/assets/style/bsTheme.scss';
</style>
