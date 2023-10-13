function getFileUrl(url){
  // 如果是空的直接返回
  if (!url) {
    return url
  }
  // 如果是http开头的直接返回
  if (/^http/.test(url)) {
    return url
  }
  // 如果没有以/开头的加上/
  if (!/^\//.test(url)) {
    url = `/${url}`
  }
  return `${window.BS_CONFIG?.httpConfigs?.fileUrlPrefix}${url}`
}


export {
  getFileUrl
}
