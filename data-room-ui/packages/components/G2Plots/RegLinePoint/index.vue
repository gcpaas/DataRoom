<template>
  <div
    v-show="initRequestData"
    style="width: 100%;height: 100%"
    class="dataroom-chart-baseLine-wrapper"
  >
    <div
      :id="'chart' + config.code"
      style="width: 100%;height: 100%"
    />
  </div>
</template>

<script>
// 引入g2plot图表的公共方法
import g2plotMixins from '@gcpaas/data-room-ui/packages/components/G2Plots/js/mixins/g2plotMixins.js'
import { getData } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
import cloneDeep from 'lodash/cloneDeep'
import mockData from './data.json'

export default {
  name: 'BaseLine',
  components: {},
  mixins: [g2plotMixins],
  props: {},
  data () {
    return {
      mockData,
      show: true
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  mounted () {
  },
  methods: {}
}
</script>

<style scoped lang="scss">
</style>
