<template>
  <div
    class="bs-design-wrap"
    :class="`bs-current-time-${customTheme}`"
  >
    <div
      ref="customHtml"
      v-html="config.customize.htmlStr"
    />
  </div>
</template>

<script>
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { mapMutations, mapState } from 'vuex'
export default {
  name: 'CustomHtml',
  mixins: [paramsMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapState({
    })
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  // 销毁定时器
  destroyed () {
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig',
      changeActiveItemConfig: 'bigScreen/changeActiveItemConfig'
    }),
    changeStyle (config) {
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../BasicComponents/fonts/index.css";
@import "../../assets/fonts/numberFont/stylesheet.css";
.bs-design-wrap{
  width: 100%;
  padding: 10px;
}
</style>
