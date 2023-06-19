
// 设置表格高度
const doResize = async (el, binding, vnode) => {
  // 获取表格Dom对象
  const {
    componentInstance: $table
  } = await vnode
  // 获取调用传递过来的数据
  const {
    value
  } = binding
  if (!$table.height) {
    throw new Error("使用v-table指令,el-table需设置height,例如: height='0'")
  }
  // 获取距底部距离（用于展示页码等信息）
  const bottomOffset = value || 100
  if (!$table) return
  // 计算列表高度并设置
  let height = window.innerHeight - el.getBoundingClientRect().top - bottomOffset
  height = height + 32 // 针对没有底部适配
  $table.layout.setHeight(height)
  $table.doLayout()
}
// 节流函数
const throttle = (fn) => {
  let flag = null
  return function () {
    if (!flag) {
      flag = setTimeout(() => {
        fn()
        flag = null
      }
      , 500)
    }
  }
}

export default {
  // 初始化设置
  bind (el, binding, vnode) {
    // 设置resize监听方法
    el.resizeListener = async () => {
      await doResize(el, binding, vnode)
    }
    // 绑定监听方法
    window.addEventListener('resize', throttle(el.resizeListener))
  },

  // 绑定默认高度
  async inserted (el, binding, vnode) {
    await doResize(el, binding, vnode)
  },
  // 更新数据时延时绑定高度
  async componentUpdated (el, binding, vnode) {
    await setTimeout(() => {
      doResize(el, binding, vnode)
    }, 500)
  },
  // 销毁时设置
  unbind (el) {
    // 移除resize监听
    window.removeEventListener('resize', throttle(el.resizeListener))
  }
}
