export function showSize (base64url) {
  let str = base64url.replace('data:image/png;base64,', '')
  // 找到等号，把等号也去掉
  const equalIndex = str.indexOf('=')
  if (str.indexOf('=') > 0) {
    str = str.substring(0, equalIndex)
  }
  // 原来的字符流大小，单位为字节
  const strLength = base64url.length
  // 计算后得到的文件流大小，单位为字节
  const fileLength = parseInt(strLength - (strLength / 8) * 2)
  // 由字节转换为kb
  let size = ''
  size = (fileLength / 1024).toFixed(2)
  const sizeStr = size + '' // 转成字符串
  const index = sizeStr.indexOf('.') // 获取小数点处的索引
  const dou = sizeStr.substr(index + 1, 2) // 获取小数点后两位的值
  if (dou === '00') {
    // 判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
  }
  return Number(size)
}

export function dataURLtoFile (dataurl, filename) {
  // 将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function dataURLtoBlob (dataurl) {
  const arr = dataurl.split(',')
  const _arr = arr[1].substring(0, arr[1].length - 2)
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(_arr)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], {
    type: mime
  })
}

export function translateBlobToBase64 (blob, callback) {
  const reader = new FileReader()
  reader.onload = function (e) {
    callback(e.target)
  }
  reader.readAsDataURL(blob)
  // 读取后，result属性中将包含一个data:URL格式的Base64字符串用来表示所读取的文件
}

// 压缩方法
export function compressImage (base64, { width: w = 1280, height: h = 720, size = 200, quality = 1 }) {
  return new Promise((resolve, reject) => {
    const newImage = new Image()
    newImage.src = base64
    newImage.setAttribute('crossOrigin', 'Anonymous')
    let imgWidth, imgHeight
    newImage.onload = function () {
      imgWidth = 1280
      imgHeight = 720
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (Math.max(imgWidth, imgHeight) > w) {
        if (imgWidth > imgHeight) {
          canvas.width = w
          canvas.height = w * imgHeight / imgWidth
        } else {
          canvas.height = w
          canvas.width = w * imgWidth / imgHeight
        }
      } else {
        canvas.width = imgWidth
        canvas.height = imgHeight
        quality = 1
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height)
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality) // 压缩语句
      if (showSize(compressedBase64) > Number(size)) {
        compressedBase64 = canvas.toDataURL('image/jpeg', quality - 0.2 > 0.4 ? quality - 0.2 : 0.4)
      }
      resolve(compressedBase64)
    }
    newImage.onerror = function () {
      reject(new Error('Failed to load image'))
    }
  })
}
