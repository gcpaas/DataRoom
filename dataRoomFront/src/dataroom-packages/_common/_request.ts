import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from 'axios'
import {ElMessage} from 'element-plus'
import {getCookie, getCookieName} from './_cookie'
import {type Router} from "vue-router";

/**
 * 路由实例，用于跳转登录页
 */
let router: Router | null = null

/**
 * 供外部注入路由实例（如在 main.ts 中调用）
 * @param router - Vue Router 实例
 */
export const injectRouter = (routerInstance: Router) => {
  router = routerInstance
}

/**
 * 响应数据
 */
interface ResponseData<T = any> {
  code: number
  message?: string
  data?: T
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  }
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config) => {
    // 从 Cookie 中获取认证信息并添加到请求头
    const cookieName = getCookieName()
    const cookieValue = getCookie(cookieName)
    if (cookieValue) {
      config.headers[cookieName] = cookieValue
    }
    return config
  }, (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const res = response.data
    // 根据业务状态码判断
    if (res.code === 200) {
      return res.data as any
    } else if (res.code === 401) {
      const message = res.message || '未授权，请重新登录'
      ElMessage.error(message)
      if (router) {
        router.push('/login')
      } else {
        console.error('router实例未初始化，无法跳转到登录页，请手动跳转')
      }
      return Promise.reject(new Error(message))
    } else {
      const message = res.message || '服务响应异常'
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    console.error('响应错误:', error)
    ElMessage.error('请确定服务是否能够正常连接或请求报文是否正确')
    return Promise.reject(error)
  }
)

/**
 * 封装请求方法
 */
const request = {
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, {params, ...config})
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, {params, ...config})
  },
}
export default request
