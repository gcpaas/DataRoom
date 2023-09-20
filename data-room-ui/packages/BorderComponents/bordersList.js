// 得到边框组件的远程列表
// import _ from 'lodash'

const files = require.context('../BorderComponents/', true, /index.vue$/)
const borderComponents = []

files.keys().forEach(key => {
  const title = key.split('/')[1].replace('.vue', '')
  const img = require(`../BorderComponents/${title}/component.png`)
  borderComponents.push({
    title:title,
    img,
  })
})
// 抛出边框组件
export default borderComponents
