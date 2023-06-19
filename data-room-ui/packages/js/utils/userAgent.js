// 是否是火狐浏览器
export const isFirefox = () => {
  const userAgent = navigator.userAgent
  if (userAgent.indexOf('Firefox') > -1) {
    return true
  }
  return false
}
