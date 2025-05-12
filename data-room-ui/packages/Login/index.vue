<template>
  <div class="gc-login">
    <div class="gc-login--left">
      <div class="gc-login__header clearfix">
        <div class="gc-template__header--logo">
          <img
            :src="imgPath"
          >
        </div>
        <div class="gc-template__header--h1">
          {{ starter.title }} <span class="gc-template__header-version">{{ starter.version }}</span>
        </div>
      </div>
      <div
        class="login-font"
        v-html="starter.description"
      />
      <img
        class="login-img"
        :src="loginImgPath"
      >
      <div class="gc-login__copyright">
        <div
          class="gc-copyright"
          v-html="starter.footer.copyright"
        />
      </div>
    </div>

    <div class="gc-login--right">
      <div
        key="login"
        class="gc-login-form"
      >
        <div class="gc-login-title">
          登录
        </div>
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          @keyup.enter.native="login"
        >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                v-support
                suffix-icon="el-icon-user"
                placeholder="请输入账号"
                :autofocus="true"
                clearable
                @blur="loginForm.username = inputChange($event)"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                v-support
                suffix-icon="el-icon-lock"
                type="password"
                placeholder="请输入密码"
                clearable
                @blur="loginForm.password = inputChange($event)"
              />
            </el-form-item>
            <el-form-item
              prop="captcha"
              class="item--verification"
            >
              <el-input
                v-model="loginForm.captcha"
                v-support
                placeholder="请输入验证码"
                clearable
                @blur="loginForm.captcha = inputChange($event)"
              />
              <div class="verification-label">
                <img
                  :src="captchaPath"
                  @click="getCaptcha()"
                >
              </div>
            </el-form-item>
          <div class="gc-login-forget">
            <a
              href="javascript:;"
              @click="getAccount"
            >获取账号</a>
          </div>
          <el-button
            :loading="loading"
            type="primary"
            round
            @click.native.prevent="login"
          >
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { getUUID,msgEncode } from 'data-room-ui/js/utils'
import * as tokenCacheService from 'data-room-ui/js/utils/tokenCacheService'


export default {
  name: 'SysLogin',
  data () {
    return {
      fromTypeLogin: 1,
      starter: window.SITE_CONFIG.starter,
      // 系统默认图形验证码
      imgCaptcha: {
        interval: window.SITE_CONFIG.starter.login.account.interval,
        // 图像验证码上次获取时间，避免频繁获取验证码
        lastDate: undefined
      },
      loginImgPath: require(`./assets/login_bg.png`),
      imgPath: require(`./assets/logo_gc_light.png`),
      captchaPath: '',
      loginForm: {
        username: '',
        password: '',
        uuid: '',
        captcha: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
        captcha: [{ required: true, trigger: 'blur', message: '验证码不能为空' }]
      },
      loading: false
    }
  },
  mounted () {
    this.imgCaptcha.lastDate = undefined
    this.getCaptcha()
  },
  destroyed () {
  },
  methods: {
    inputChange(e){
      return e.target.value
    },
    getAccount(){
      const imgUrl = require('./assets/QQ.png') // 先获取图片路径
      this.$alert(`
    <div>
      <p>请加入官方交流群获取演示环境登录账号：</p>
      <div style="display: flex;justify-content: center">
       <img
        src="${imgUrl}"
        alt="891384200"
      />
       </div>
    </div>
  `, '提示', {
        showConfirmButton: false,
        dangerouslyUseHTMLString: true // 关键：允许渲染HTML
      })
    },
    /**
     * 获取验证码
     */
    getCaptcha (auto) {
      if (!auto && this.imgCaptcha.lastDate && (new Date().getTime() - this.imgCaptcha.lastDate.getTime()) / 1000 < this.imgCaptcha.interval) {
        this.$message.warning('请勿频繁获取验证码')
        return
      }
      this.imgCaptcha.lastDate = new Date()
      const uuid = getUUID()
      this.loginForm.uuid = uuid
      this.captchaPath = this.$dataRoomAxios.wrapUrl(`/sys/captcha?uuid=${uuid}`)
    },
    loginResponseHandler (res) {
      this.loading = false
      if (res.code !== 200) {
        console.error(res.msg)
        this.getCaptcha(true)
        return
      }
      let data = res.data
      tokenCacheService.set(data.token)
      let welcome = this.starter.login.welcome
      this.$notify({
        title: welcome?.title ?? '欢迎',
        message: welcome?.template ?? '您好，欢迎访问大屏设计器',
        type: 'success'
      })
        // 跳转到首页
      this.$router.push({ name: 'BigScreenList' })
    },
    // 错误处理
    exceptionHandler (e) {
      console.error(e)
      this.loading = false
      this.getCaptcha(true)
    },
    /**
     * 登录
     */
    login () {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        this.$dataRoomAxios.post(`/sys/login`,{
          'username': this.loginForm.username,
          'password': msgEncode(this.loginForm.password, this.loginForm.password),
          'uuid': this.loginForm.uuid,
          'captcha': this.loginForm.captcha
        },true).then(res => {
          this.loginResponseHandler(res)
        }).catch(e => {
          this.exceptionHandler(e)
        })
      })
    }
  }
}
</script>
<style lang="scss">
@import "./style/login.scss";
</style>
