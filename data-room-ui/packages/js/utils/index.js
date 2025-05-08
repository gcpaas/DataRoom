// import _ from 'lodash'
import { sha256 } from 'js-sha256'
import upperFirst from 'lodash/upperFirst'
export const randomString = e => {
  e = e || 32
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'
  const a = t.length
  let n = ''
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

export const resolveComponentType = type => {
  return `${upperFirst(type)}`
}
export function deepCompare (obj1, obj2, excludeKeys = []) {
  // eslint-disable-next-line eqeqeq
  if (obj1 == obj2) {
    return false
  }

  // 如果两个对象中的一个是基本类型，则它们不相等
  if (typeof obj1 !== 'object' || obj1 === null ||
    typeof obj2 !== 'object' || obj2 === null) {
    return true
  }

  // 如果两个对象的类型不相同，则它们不相等
  if (obj1.constructor !== obj2.constructor) {
    return true
  }

  // 递归地比较对象的属性
  for (const prop in obj1) {
    // 如果prop是要排除的key，则跳过
    if (excludeKeys.includes(prop)) {
      continue
    }
    if (obj1.hasOwnProperty(prop)) {
      if (!obj2.hasOwnProperty(prop)) {
        return true
      }
      if (deepCompare(obj1[prop], obj2[prop])) {
        return true
      }
    }
  }

  // 检查 obj2 中是否有 obj1 没有的属性
  for (const prop in obj2) {
    if (obj2.hasOwnProperty(prop) && !obj1.hasOwnProperty(prop)) {
      return true
    }
  }

  // 如果上面的检查都通过，则对象是相等的
  return false
}
export function msgEncode (message, salt) {
  return sha256(sha256(message) + salt)
}


/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime (time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj (url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * 获取uuid
 */
export function getUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    return (c === 'x' ? (Math.random() * 16 | 0) : ('r&0x3' | '0x8')).toString(16)
  })
}
/**
 * 将给定的对象值添加到url后面
 * @param url
 * @param params
 * @returns {string}
 */
export function joinObjectToUrl (url, params) {
  if (!params) {
    return url
  }
  let queryStr = ''
  const i = Object.keys(params).length
  if (!params) {
    queryStr = ''
  }
  Object.keys(params).forEach((key, index) => {
    if (i === (index + 1)) {
      queryStr += (key + '=' + params[key])
    } else {
      queryStr += (key + '=' + params[key] + '&')
    }
  })
  if (url.indexOf('?') !== -1) {
    url = url + '&' + queryStr
  } else {
    url = url + '?' + queryStr
  }
  return url
}
