function getFileUrl (url) {
  // 如果是空的直接返回
  if (!url) {
    return url
  }
  if (url.startsWith('/dataroom/file/reference')) {
    return window.SITE_CONFIG.dataRoom?.baseURL + url
  }
  // 如果是http开头的直接返回
  if (/^http/.test(url)) {
    return url
  }
  // 如果没有以/开头的加上/
  if (!/^\//.test(url)) {
    url = `/${url}`
  }
  return `${window.SITE_CONFIG.dataRoom?.fileUrlPrefix}${url}`
}

export {
  getFileUrl
}
