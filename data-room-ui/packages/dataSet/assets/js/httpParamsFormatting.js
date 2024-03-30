import axios from 'axios'
// import { Loading, Message } from 'element-ui'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
export default function axiosFormatting (customConfig) {
  const newCustomConfig = replaceParams(customConfig)
  // 将请求头和请求参数的值转化为对象形式
  const httpConfig = {
    timeout: 1000 * 30,
    baseURL: '',
    headers: { 'Content-Type': 'application/json', ...newCustomConfig.headers }
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
    const req = { ...config, url: {} }
    eval(newCustomConfig.requestScript)
    for (const key in req.url) {
      newCustomConfig.url = replaceUrlParam(newCustomConfig.url, key, req.url[key])
    }
    config = { ...config, ...req, url: newCustomConfig.url }
    return config
  }, error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  })

  /** 添加响应拦截器  **/
  instance.interceptors.response.use(response => {
    const resp = response.data
    // 执行响应脚本
    if (newCustomConfig.responseScript) {
      // eslint-disable-next-line no-new-func
      const getResp = new Function('resp', newCustomConfig.responseScript)
      const res = getResp(resp)
      return Promise.resolve(res)
    } else {
      return Promise.resolve(resp)
    }
  })
  const body = newCustomConfig?.body.replace(/: ,/g, ':undefined,').replace(/, }/g, ',undefined}')
  /** 发送请求  **/
  return new Promise((resolve, reject) => {
    instance({
      method: newCustomConfig.method,
      url: newCustomConfig.url,
      params: newCustomConfig.params,
      // params 序列化操作
      paramsSerializer: (params) => {
        return Object.keys(params)
          .map(key => {
            if (Array.isArray(params[key])) {
              return params[key].map(value => `${key}=${value}`).join('&')
            } else {
              return `${key}=${params[key]}`
            }
          })
          .join('&')
      },
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
  const newConfig = cloneDeep(customConfig)
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
    if (acc[cur.key]) {
      if (Array.isArray(acc[cur.key])) {
        acc[cur.key].push(cur.value)
      } else {
        acc[cur.key] = [acc[cur.key], cur.value]
      }
    } else {
      acc[cur.key] = cur.value
    }
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
