import axios from 'axios'
import { Loading, Message } from 'element-ui'
import _ from 'lodash'
export default function axiosFormatting (customConfig) {
  // 将请求头和请求参数的值转化为对象形式
  // const headers = arrToObject(customConfig.headers)
  // const params = arrToObject(customConfig.params)
  const httpConfig = {
    timeout: 1000 * 30,
    baseURL: '',
    headers: customConfig.headers
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
    // https://mock.presstime.cn/mock/64bf8a00ce1b0ea640809069/test_copy_copy_copy/httpData?token=123&ss=ss
    const req = { ...config, urlKey: {} }
    eval(customConfig.requestScript)
    for (const key in req.urlKey) {
      customConfig.url = replaceUrlParam(customConfig.url, key, req.urlKey[key])
    }
    config = { ...config, ...req, url: customConfig.url }
    return config
  }, error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  })

  /** 添加响应拦截器  **/
  instance.interceptors.response.use(response => {
    if (response.data.code === 200) {
      // 执行响应脚本
      const resp = _.cloneDeep(response.data)
      eval(customConfig.responseScript)
      Message({
        message: '执行成功',
        type: 'success'
      })
      console.log(resp.data.list[0])
      return Promise.resolve(resp)
    } else {
      Message({
        message: response.data.message,
        type: 'error'
      })
      return Promise.reject(response.data.message)
    }
  })
  const body = {}
  const pattern = /(body\.\w+)=(\w+)/g
  const replacement = "$1='$2'"
  customConfig.body = customConfig.body.replace(pattern, replacement)
  eval(customConfig.body)
  return new Promise((resolve, reject) => {
    instance({
      method: customConfig.method,
      url: customConfig.url,
      params: customConfig.params,
      data: customConfig.method === 'post' ? body : undefined
    }).then(response => {
      resolve(response)
    }).catch(error => {
      reject(error)
    })
  })
}
// 动态替换url后面参数的值
function replaceUrlParam (url, paramName, paramValue) {
  const regex = new RegExp(`([?&])${paramName}=.*?(&|$)`, 'i')
  const separator = url.indexOf('?') !== -1 ? '&' : '?'
  if (url.match(regex)) {
    return url.replace(regex, `$1${paramName}=${paramValue}$2`)
  } else {
    return `${url}${separator}${paramName}=${paramValue}`
  }
}
