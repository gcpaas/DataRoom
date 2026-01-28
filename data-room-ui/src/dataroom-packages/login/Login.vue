<script setup lang="ts">
import {ref, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {User, Lock} from '@element-plus/icons-vue'
import {setCookie} from '@/dataroom-packages/_common/_cookie'
import request from '@/dataroom-packages/_common/_request.ts'
import {encryptByRsa} from '@/dataroom-packages/_common/_encrypt'
import logo from '@/dataroom-packages/assets/logo.png'

const router = useRouter()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 5, max: 50, message: '用户名长度在 5 到 50 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 8, max: 50, message: '密码长度在 8 到 50 个字符', trigger: 'blur'}
  ]
}

const formRef = ref()
const loading = ref(false)

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
        // 加密密码
        const encryptedPassword = encryptByRsa(loginForm.password)
        if (!encryptedPassword) {
          ElMessage.error('密码加密失败,请重试')
          loading.value = false
          return
        }

        // 调用登录接口
        const token = await request.post('/dataRoom/user/login', {
          username: loginForm.username,
          password: encryptedPassword
        })

        // 保存token到cookie
        setCookie(token)

        ElMessage.success(getGreeting())

        // 跳转到首页
        setTimeout(() => {
          router.push('/')
        }, 500)
      } catch (error: any) {
        console.error('登录失败:', error)
        // 错误信息已在axios拦截器中处理
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
        <img :src="logo" alt="Logo" class="logo"/>
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

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          @keypress="handleKeyPress"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              clearable
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
              :prefix-icon="Lock"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
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
  background: linear-gradient(135deg, var(--dr-primary) 0%, color-mix(in srgb, var(--dr-primary) 80%, #764ba2) 100%);
  display: flex;
  flex-direction: column;

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
        filter: brightness(0) invert(1);
      }

      .title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 0.5px;
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
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 48px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.6s ease-out;

      .login-title {
        text-align: center;
        margin-bottom: 40px;

        h2 {
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      }

      .login-form {
        :deep(.el-form-item) {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(.el-input) {
          .el-input__wrapper {
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #e0e0e0 inset;
            transition: all 0.3s;

            &:hover {
              box-shadow: 0 0 0 1px var(--dr-primary) inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px var(--dr-primary) inset;
            }
          }

          .el-input__inner {
            font-size: 14px;
          }
        }

        .login-button {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 8px;
          background: var(--dr-primary);
          border: none;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px var(--dr-primary2);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }

  // 背景装饰
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        right: -100px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: -50px;
        left: -50px;
        animation-delay: 3s;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        right: 20%;
        animation-delay: 6s;
      }
    }
  }
}

// 动画
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    .login-header {
      padding: 20px 24px;

      .logo-wrapper {
        .logo {
          height: 32px;
        }

        .title {
          font-size: 20px;
        }
      }
    }

    .login-content {
      .login-box {
        padding: 32px 24px;
        border-radius: 12px;

        .login-title {
          h2 {
            font-size: 24px;
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
