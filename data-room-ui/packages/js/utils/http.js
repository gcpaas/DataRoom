import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'
import { Message } from 'element-ui'
/**
 * 统一进行异常输出
 * 如果异常只是弹框显示即可，可使用该实例
 */
const httpConfig = {
  timeout: 1000 * 30,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
}

const httpCustom = axios.create(httpConfig)
/**
 *对于出现异常时还需要做其他操作，可使用该实例
 */
const http = axios.create(httpConfig)

/**
 * 封装的异常对象
 * @param message
 * @param code
 * @constructor
 *
 */
function EipException (message, code) {
  this.msg = message
  this.code = code
}

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  return {
    ...config,
    ..._.merge(httpConfig, window.BS_CONFIG?.httpConfigs)
  }
}, error => {
  return Promise.reject(error)
})

/**
 * 自定义请求拦截
 */
httpCustom.interceptors.request.use(config => {
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  const res = response.data
  // 异常拦截
  // eslint-disable-next-line no-empty
  if (res && res.code === 401) {
  } else if (res && res.code !== 200) {
    // return Promise.reject(response.data.msg)
    Message({
      message: response.data.msg,
      type: 'error'
    })
    throw new EipException(response.data.msg, response.data.code)
  } else {
    return res
  }
}, error => {
  if (error.message && error.message === 'Network Error') {
    Message({
      message: error.message,
      type: 'error'
    })
    return Promise.reject(error)
  // eslint-disable-next-line no-empty
  } else {
  }
  Message({
    message: '服务异常',
    type: 'error'
  })
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
httpCustom.interceptors.response.use(response => {
  const res = response.data
  return res
}, error => {
  if (error.message && error.message === 'Network Error') {
    return Promise.reject(error)
  // eslint-disable-next-line no-empty
  } else {
  }
  Message({
    message: '服务异常',
    type: 'error'
  })
  return Promise.reject(error)
})

/**
 * get请求
 * @param url
 * @param params
 * @returns {Promise<any>}
 */
export function get (url, params = {}, customHandlerException = false) {
  if (!url.startsWith('http')) {
    url = window.BS_CONFIG?.httpConfigs?.baseURL + url
  }
  // 如果是ie浏览器要添加个时间戳，解决浏览器缓存问题
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    params._t = new Date().getTime()
  }
  const axiosInstance = customHandlerException ? httpCustom : http
  return new Promise((resolve, reject) => {
    axiosInstance.get(url, {
      params: params,
      paramsSerializer: params => {
        return qs.stringify(params, { indices: false })
      }
    }).then(response => {
      if (customHandlerException) {
        resolve(response)
      } else {
        resolve(response.data)
      }
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * Post 请求
 * @param url
 * @param params
 * @returns {Promise<any>}
 */
export function post (url, data = {}, customHandlerException = false) {
  if (!url.startsWith('http')) {
    url = window.BS_CONFIG?.httpConfigs?.baseURL + url
  }
  const axiosInstance = customHandlerException ? httpCustom : http
  data = JSON.stringify(data)
  return new Promise((resolve, reject) => {
    axiosInstance.post(url, data).then(response => {
      if (customHandlerException) {
        resolve(response)
      } else {
        resolve(response.data)
      }
    }).catch(err => {
      reject(err)
    })
  })
}
/**
 * download 请求
 * @returns {Promise<any>}
 */

export function download (url, headers = {}, params = {}, body = {}) {
  if (!url.startsWith('http')) {
    url = window.BS_CONFIG?.httpConfigs?.baseURL + url
  }
  // 如果是ie浏览器要添加个时间戳，解决浏览器缓存问题
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    params._t = new Date().getTime()
  }
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: url,
      headers: headers,
      params: params,
      data: body,
      withCredentials: false,
      responseType: 'arraybuffer'
    }).then(res => {
      // IE10,11采用自带下载文件流方法
      if ((!!window.ActiveXObject || 'ActiveXObject' in window) && window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(new Blob([res.data]), res.headers.filename)
        return
      }
      const fileUrl = window.URL.createObjectURL(new Blob([res.data]))
      // 创建超链接
      const fileLink = document.createElement('a')
      fileLink.href = fileUrl
      // 设置下载文件名
      let responseFileName = res.headers.filename
      // 解决中文乱码
      responseFileName = window.decodeURI(responseFileName)
      fileLink.setAttribute('download', responseFileName)
      document.body.appendChild(fileLink)
      // 模拟人工点击下载超链接
      fileLink.click()
      // 释放资源
      document.body.removeChild(fileLink)
      window.URL.revokeObjectURL(fileUrl)
    }).catch(e => {
      const status = e?.response?.status
      if (status === 404) {
        return
      }
      console.error('服务异常')
    })
  })
}
