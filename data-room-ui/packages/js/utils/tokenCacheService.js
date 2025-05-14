import Cookies from 'vue-cookie'

const set = ( value) => {
  Cookies.set('gcpaasToken', value)
}

// 获取方式
const get = () => {
  return Cookies.get('gcpaasToken')
}

// 删除方式
const remove = () => {
  Cookies.delete('gcpaasToken')
}

export {
  set,
  get,
  remove
}
