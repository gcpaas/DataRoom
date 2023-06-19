/*
 * @description: 通用的联动参数
 * @Date: 2023-01-10 09:58:10
 * @Author: xing.heng
 * @LastEditors: xing.heng
 * @LastEditTime: 2023-04-18 17:19:29
 */
export default {
  inParams: [
    {
      // 组件用于入参的参数列表
      name: '', // 参数名
      code: '' // 参数值
    }
  ],
  // 查询表单联动
  linkage: {
    action: {
      type: 'js',
      script: '' // 联动执行的逻辑
    },
    components: []
  }
}
