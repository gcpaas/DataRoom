/**
 * Cookie 工具类
 * 用于读取和写入指定名称的 Cookie 值
 */

// 从环境变量读取 Cookie 名称，默认为 'dataRoomToken'
const DATA_ROOM_TOKEN_NAME = 'dataRoomToken'

/**
 * 获取指定名称的 Cookie 值
 * @param name Cookie 名称，默认使用配置的名称
 * @returns Cookie 值，如果不存在返回空字符串
 */
export function getCookie(name: string = DATA_ROOM_TOKEN_NAME): string {
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    // @ts-expect-error ignore
    const cookie = cookies[i].trim()
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }
  return ''
}

/**
 * 设置 Cookie
 * @param value Cookie 值
 * @param name Cookie 名称，默认使用配置的名称
 * @param days 过期天数，默认 7 天
 */
export function setCookie(value: string, name: string = DATA_ROOM_TOKEN_NAME, days: number = 7): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`
}

/**
 * 删除 Cookie
 * @param name Cookie 名称，默认使用配置的名称
 */
export function removeCookie(name: string = DATA_ROOM_TOKEN_NAME): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

/**
 * 获取配置的 Cookie 名称
 * @returns Cookie 名称
 */
export function getCookieName(): string {
  return DATA_ROOM_TOKEN_NAME
}
