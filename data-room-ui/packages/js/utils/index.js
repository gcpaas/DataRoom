// import _ from 'lodash'
import upperFirst from 'lodash/upperFirst'
import Vue from 'vue'
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
// 树结构数据通过递归来获取节点信息:attribute是具体属性值,type根据哪个属性进行查找
export function getNodeByTree (nodes, attribute, type) {
  for (const node of nodes) {
    if (node[type] === attribute) {
      return node
    }
    if (node.children) {
      const childResult = getNodeByTree(node.children, attribute, type)
      if (childResult) {
        return childResult
      }
    }
  }
  return null // 如果没有找到匹配的类型，返回 null 或者其他适当的值
}
//  递归函数用于搜索指定类型的元素并进行添加和删除操作
export function updateNodeInfo (chartList, draggingCode, dropCode) {
  // Find the dragging node and its parent node
  let draggingNode = null
  let parentNode = null

  // Helper function to find the node by code
  function findNodeByCode (nodes, code) {
    for (const node of nodes) {
      if (node.code === code) {
        return node
      }
      if (node.children) {
        const foundNode = findNodeByCode(node.children, code)
        if (foundNode) return foundNode
      }
    }
    return null
  }

  // Find the dragging node
  draggingNode = findNodeByCode(chartList, draggingCode)

  // Find the parent node of the drop node
  parentNode = findNodeByCode(chartList, dropCode)

  // Update the dragging node's information if both draggingNode and parentNode are found
  if (draggingNode && parentNode) {
    draggingNode.parentCode = dropCode
    draggingNode.x -= parentNode.x
    draggingNode.y -= parentNode.y
    draggingNode.transform = `transform(${draggingNode.x}px, ${draggingNode.y}px)`
  }

  return chartList
}

//  递归函数用于搜索指定类型的元素并替换该元素
export function replaceElement (list, config) {
  // 递归函数用于搜索指定类型的元素并更新其配置值
  function findAndUpdate (node) {
    if (node.code === config.code) {
      // 找到 type 对应的元素 A，将 config 的值复制给它
      Object.assign(node, config)
      return true // 标记找到了匹配的元素
    } else if (node.children) {
      // 递归处理子节点
      for (const child of node.children) {
        if (findAndUpdate(child)) {
          return true // 如果在子节点中找到了匹配的元素，则停止继续搜索
        }
      }
    }
    return false // 表示未找到匹配的元素
  }

  // 遍历树的根节点并调用递归函数
  for (const node of list) {
    findAndUpdate(node)
  }
  return list
}
//  递归函数用于搜索指定类型的元素并删除操作
export function deleteNodesWithCodes (list, coeds) {
  // 递归函数用于遍历树的每个节点并删除包含指定 codes 的节点
  function deleteNodes (nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]

      // 如果当前节点的 code 包含在 codesToDelete 中，则将其从父节点中删除
      if (coeds.includes(node.code)) {
        nodes.splice(i, 1)
      } else {
        // 递归处理当前节点的子节点
        if (node.children) {
          deleteNodes(node.children)
        }
      }
    }
  }

  // 调用递归函数处理树的根节点
  deleteNodes(list)

  // 返回处理后的树结构
  return list
}
// 计算文件大小
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
// 统一的上传文件的调接口的方法
export function uploadRequest (params) {
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    if (params.data && Object.keys(params.data).length) {
      for (const key in params.data) {
        fd.append(key, params.data[key])
      }
    }
    fd.append('file', params?.file)
    Vue.prototype.$dataRoomAxios.upload(params?.action, fd).then((res) => {
      resolve(res)
    }).catch((err) => {
      reject(err)
    })
  })
}
