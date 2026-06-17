<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { setCookie } from '@/dataRoom/_common/_cookie'
import request from '@/dataRoom/_common/_request.ts'
import { encryptByRsa } from '@/dataRoom/_common/_encrypt'
import logo from '@/dataRoom/assets/logo.png'
import axios from 'axios'

defineOptions({
  name: 'DataRoomLogin',
})

const router = useRouter()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: '',
})

// 验证码相关
const captchaUrl = ref('')
const captchaKey = ref('')

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 50, message: '用户名长度在 5 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 50, message: '密码长度在 8 到 50 个字符', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const formRef = ref()
const loading = ref(false)

// 获取验证码
const refreshCaptcha = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    const response = await axios.get(`${baseUrl}/dataRoom/captcha/generate`, {
      responseType: 'blob',
    })
    // 从响应头获取 captchaKey
    captchaKey.value = response.headers['captcha-key'] || ''
    // 将 blob 转为 URL 用于图片展示
    if (captchaUrl.value) {
      URL.revokeObjectURL(captchaUrl.value)
    }
    captchaUrl.value = URL.createObjectURL(response.data)
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 页面加载时获取验证码
onMounted(() => {
  refreshCaptcha()
})

// 根据时间生成问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  let greeting = ''

  if (hour >= 5 && hour < 9) {
    greeting = '早上好'
  } else if (hour >= 9 && hour < 12) {
    greeting = '上午好'
  } else if (hour >= 12 && hour < 14) {
    greeting = '中午好'
  } else if (hour >= 14 && hour < 18) {
    greeting = '下午好'
  } else if (hour >= 18 && hour < 22) {
    greeting = '晚上好'
  } else {
    greeting = '夜深了'
  }

  return `${greeting},欢迎回来!`
}

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 对用户名和密码进行 trim 处理
        const trimmedUsername = loginForm.username.trim()
        const trimmedPassword = loginForm.password.trim()

        // 加密密码
        const encryptedPassword = encryptByRsa(trimmedPassword)
        if (!encryptedPassword) {
          ElMessage.error('密码加密失败,请重试')
          loading.value = false
          return
        }

        // 调用登录接口（携带验证码信息）
        const token = await request.post('/dataRoom/user/login', {
          username: trimmedUsername,
          password: encryptedPassword,
          captchaKey: captchaKey.value,
          captchaCode: loginForm.captchaCode,
        })

        // 保存token到cookie
        setCookie(token)

        ElMessage.success(getGreeting())

        // 跳转到首页
        setTimeout(() => {
          router.push('/')
        }, 500)
      } catch (error: unknown) {
        console.error('登录失败:', error)
        // 登录失败时刷新验证码
        refreshCaptcha()
        loginForm.captchaCode = ''
      } finally {
        loading.value = false
      }
    }
  })
}

// 回车登录
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 左上角Logo和标题 -->
    <div class="login-header">
      <div class="logo-wrapper">
        <img :src="logo" alt="Logo" class="logo" />
        <span class="title">DataRoom设计器</span>
      </div>
    </div>

    <!-- 登录表单 -->
    <div class="login-content">
      <div class="login-box">
        <div class="login-title">
          <h2>欢迎登录</h2>
          <p>DataRoom 数据可视化平台</p>
        </div>

        <el-form ref="formRef" :model="loginForm" :rules="rules" class="login-form" @keypress="handleKeyPress">
          <el-form-item prop="username" class="login-form-item">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" clearable :prefix-icon="User" />
          </el-form-item>

          <el-form-item prop="password" class="login-form-item">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password clearable :prefix-icon="Lock" />
          </el-form-item>

          <el-form-item prop="captchaCode" class="login-form-item">
            <div class="captcha-wrapper">
              <el-input v-model="loginForm.captchaCode" placeholder="请输入验证码" size="large" clearable class="captcha-input" />
              <img :src="captchaUrl" alt="验证码" class="captcha-image" title="点击刷新验证码" @click="refreshCaptcha" />
            </div>
          </el-form-item>

          <el-form-item class="login-form-item">
            <el-button type="primary" size="large" :loading="loading" class="login-button" @click="handleLogin">
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 版权说明 -->
    <div class="login-footer">
      <p>Copyright &copy; {{ new Date().getFullYear() }} 由科大国创 GCPAAS 开源</p>
    </div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  .login-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 30px 60px;
    z-index: 10;

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo {
        height: 32px;
      }

      .title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        letter-spacing: 0;
      }
    }
  }

  .login-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    padding: 20px;

    .login-box {
      width: 100%;
      max-width: 420px;
      background: var(--el-fill-color-blank);
      border-radius: 8px;
      border: 1px solid var(--el-border-color);
      box-sizing: border-box;
      padding: 48px 40px;
      animation: slideUp 0.4s ease-out;

      .login-title {
        text-align: center;
        margin-bottom: 36px;

        h2 {
          font-size: 28px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 10px 0;
          letter-spacing: 0;
        }

        p {
          font-size: 14px;
          font-weight: 400;
          color: var(--el-text-color-regular);
          margin: 0;
        }
      }

      .login-form {
        .login-form-item {
          margin-bottom: 22px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .login-button {
          width: 100%;
        }

        .captcha-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;

          .captcha-input {
            flex: 1;
          }

          .captcha-image {
            height: 40px;
            border-radius: 6px;
            cursor: pointer;
            border: 1px solid var(--el-border-color);
            box-sizing: border-box;
            transition: opacity 0.2s;

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }

  .login-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    text-align: center;
    z-index: 10;

    p {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }

  // Background decoration - hidden per design system (no decorative elements)
  .bg-decoration {
    display: none;
  }
}

// Animation - subtle slideUp
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive design
@media (max-width: 768px) {
  .login-container {
    .login-header {
      padding: 20px 24px;

      .logo-wrapper {
        .logo {
          height: 28px;
        }

        .title {
          font-size: 16px;
        }
      }
    }

    .login-content {
      .login-box {
        padding: 36px 24px;

        .login-title {
          h2 {
            font-size: 24px;
            letter-spacing: 0;
          }

          p {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
