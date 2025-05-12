import Cookies from 'vue-cookie'

const set = ( value) => {
  Cookies.set('dataRoomToken', value)
}

// 获取方式
const get = () => {
  return Cookies.get('dataRoomToken')
}

// 删除方式
const remove = () => {
  Cookies.delete('dataRoomToken')
}

export {
  set,
  get,
  remove
}
