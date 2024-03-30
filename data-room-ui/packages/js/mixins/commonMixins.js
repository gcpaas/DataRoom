/**
 * 所有组件公共方法，私有方法请在组件内部完成
 *  公共方法：
 *    1.样式修改
 *    2.数据修改
 *    2.交互
 *    3.
 *    4.
 *    5.数据联动
 */
export default {
  name: '',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      chart: null
    }
  },
  inject: ['chartProvide'],
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    // 修改样式
    changeStyle () {
      // 将修改过的配置更新到chartList中
      this.chartProvide.updateChartConfig(this.config)
      this.chartProvide.updateStyleHandler(this.config)
    }
    // // 根据配置调获取数据接口
    // getDataByChart () {
    //   // 将修改过的配置更新到chartList中
    //   this.chartProvide.updateChartConfig(this.config)
    //   return new Promise((resolve, reject) => {
    //     this.chartProvide.updateDataHandler(this.config).then(res => {
    //       resolve(res)
    //     }).catch(err => {
    //       reject(err)
    //     })
    //   })
    // }
  }
}
