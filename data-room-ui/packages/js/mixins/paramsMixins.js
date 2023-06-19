/*
 * @description: 封装组件内部的非props外部参数
 */
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('bigScreen', {
      pageInfo: state => state.pageInfo,
      customTheme: state => state.pageInfo.pageConfig.customTheme,
      themeJson: state => state.pageInfo.pageConfig?.themeJson
    })
  }
}
