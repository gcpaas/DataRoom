import Cookies from 'vue-cookie'

const set = ( value) => {
  Cookies.set('token', value)
}

// 获取方式
const get = () => {
  return Cookies.get('token')
}

// 删除方式
const remove = () => {
  Cookies.delete('token')
}

export {
  set,
  get,
  remove
}
