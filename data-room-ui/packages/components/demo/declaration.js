// 组件声明，这个文件是否需要，是不是根据path直接可以解析出来对应的信息
let name = '这里是解析图片名称'
export default {
  name: name,
  // 与index.vue 定义的name保持一致
  type: 'demo',
  // 具体的实现组件，对应type值
  implType: 'demo',
  img: require('./组件名.png'),
  path: 'components/common/demo'
}
