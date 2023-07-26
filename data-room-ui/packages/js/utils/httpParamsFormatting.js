import axios from 'axios'
import { Loading, Message } from 'element-ui'
export default function axiosFormatting (customConfig) {
  const httpConfig = {
    timeout: 1000 * 30,
    baseURL: '',
    headers: {
      ...customConfig.headers
    }
  }
  // let loadingInstance = null // 加载全局的loading
  const instance = axios.create(httpConfig)
  /** 添加请求拦截器 **/
  instance.interceptors.request.use(config => {
    /**
     * 在这里：可以根据业务需求可以在发送请求之前做些什么。
     * config.headers['token'] = sessionStorage.getItem('token') || ''
     */
    // 执行请求脚本
    eval(customConfig.requestScript)
    return config
  }, error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  })

  /** 添加响应拦截器  **/
  instance.interceptors.response.use(response => {
    if (response.data.code === 200) {
      // 执行响应脚本
      const data = response.data.data
      eval(customConfig.responseScript)
      return Promise.resolve(data)
    } else {
      Message({
        message: response.data.message,
        type: 'error'
      })
      return Promise.reject(response.data.message)
    }
  })
  return new Promise((resolve, reject) => {
    instance({
      method: customConfig.method,
      url: customConfig.url,
      params: customConfig.params,
      data: customConfig.method === 'post' ? customConfig.body : undefined
    }).then(response => {
      resolve(response)
    }).catch(error => {
      reject(error)
    })
  })
}
