function stringifyObjectFunctions (obj) {
  // 遍历对象属性
  for (const key in obj) {
    const value = obj[key]
    // 如果属性值是函数类型，将函数转换为字符串
    if (typeof value === 'function') {
      obj[key] = `(${value.toString()})`
      // 如果属性值是对象类型，则递归进行转换
    } else if (typeof value === 'object' && value !== null) {
      stringifyObjectFunctions(value)
    }
  }
  return JSON.stringify(obj)
}

function stringToFunction (str) {
  return JSON.parse(str, (key, value) => {
    if (typeof value === 'string' && (value.includes('=>') || value.includes('function'))) {
      // eslint-disable-next-line no-eval
      return eval(`(${value})`)
    }
    return value
  })
}

export {
  stringifyObjectFunctions,
  stringToFunction
}
