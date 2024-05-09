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
  inject: ['canvasInst'],
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    // 修改样式
    changeStyle () {
      // 将修改过的配置更新到chartList中
      this.canvasInst.updateChartConfig(this.config)
      this.canvasInst.updateStyleHandler(this.config)
    }
  }
}
