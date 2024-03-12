// 自定义序列化方法：解决JSON.stringify方法忽略函数属性的问题
export function customSerialize (obj) {
  // 将对象属性和函数转换为字符串形式
  const serializedObj = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'function') {
      return value.toString() // 将函数转换为字符串
    }
    return value // 保持其他属性不变
  })

  return serializedObj
}
// 自定义反序列化方法
export function customDeserialize(serializedObj){
  const parsedObject = JSON.parse(serializedObj, function(key, value) {
    if (typeof value === 'string' && value.indexOf('function') === 0) {
      // 将字符串还原为函数
      return new Function('return ' + value)()
    }
    return value // 保持其他属性不变
  })
  return parsedObject
}
