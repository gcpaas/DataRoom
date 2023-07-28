import axios from 'axios'
import { Loading, Message } from 'element-ui'
import _ from 'lodash'
export default function axiosFormatting (customConfig) {
  const newCustomConfig = replaceParams(customConfig)
  // 将请求头和请求参数的值转化为对象形式
  const httpConfig = {
    timeout: 1000 * 30,
    baseURL: '',
    headers: newCustomConfig.headers
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
    eval(newCustomConfig.requestScript)
    for (const key in req.urlKey) {
      newCustomConfig.url = replaceUrlParam(newCustomConfig.url, key, req.urlKey[key])
    }
    config = { ...config, ...req, url: newCustomConfig.url }
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
      eval(newCustomConfig.responseScript)
      Message({
        message: '执行成功',
        type: 'success'
      })
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
  newCustomConfig.body = newCustomConfig.body.replace(pattern, replacement)
  eval(newCustomConfig.body)
  return new Promise((resolve, reject) => {
    instance({
      method: newCustomConfig.method,
      url: newCustomConfig.url,
      params: newCustomConfig.params,
      data: newCustomConfig.method === 'post' ? body : undefined
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
// 将参数的值替换掉其他配置中对应属性的值
function replaceParams (customConfig) {
  let newConfig = _.cloneDeep(customConfig)
  newConfig.url = evalStrFunc(newConfig.paramsList, newConfig.url)
  newConfig.headers = evalArrFunc(newConfig.paramsList, newConfig.headers)
  newConfig.params = evalArrFunc(newConfig.paramsList, newConfig.params)
  newConfig.body = evalStrFunc(newConfig.paramsList, newConfig.body)
  return newConfig
}
function evalStrFunc (paramsList, string) {
  // 取name作为变量名, value作为变量值 { name: '站三', token: '123'}
  const params = paramsList.reduce((acc, cur) => {
    acc[cur.name] = cur.value
    return acc
  }, {})
  // 将url中 ${xxx} 替换成 ${params.xxx}
  const str = string.replace(/\$\{(\w+)\}/g, (match, p1) => {
    return '${params.' + p1 + '}'
  })
  const transformStr = ''
  // 将字符串中的${}替换为变量, 使用eval执行
  eval('transformStr = `' + str + '`')
  return transformStr
}
function evalArrFunc (paramsList, arr) {
  // 取name作为变量名, value作为变量值 { name: '站三', token: '123'}
  const params = paramsList.reduce((acc, cur) => {
    acc[cur.name] = cur.value
    return acc
  }, {})

  // 取name作为变量名, value作为变量值 { _name: '${name}', _token: '${token}'}
  const paramsListObj = arr.reduce((acc, cur) => {
    acc[cur.key] = cur.value
    return acc
  }, {})
  // 转成字符串
  const paramsListStr = JSON.stringify(paramsListObj)

  // 将url中 ${xxx} 替换成 ${params.xxx}
  const str = paramsListStr.replace(/\$\{(\w+)\}/g, (match, p1) => {
    return '${params.' + p1 + '}'
  })
  const transformStr = ''
  // 将字符串中的${}替换为变量, 使用eval执行
  eval('transformStr = `' + str + '`')
  const obj = JSON.parse(transformStr)
  return obj
}
