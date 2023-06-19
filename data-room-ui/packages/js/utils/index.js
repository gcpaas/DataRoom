import _ from 'lodash'
export const randomString = e => {
  e = e || 32
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'
  const a = t.length
  let n = ''
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

export const resolveComponentType = type => {
  return `${_.upperFirst(type)}`
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
