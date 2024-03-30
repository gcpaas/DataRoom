<template>
  <div
    v-show="show"
    style="width: 100%;height: 100%"
    class="dataroom-chart-groupBar-wrapper"
  >
    <div
      :id="'test' + config.code"
      style="width: 100%;height: 100%"
    />
  </div>
</template>

<script>
// 引入g2plot图表的公共方法
import g2plotMixins from '@gcpaas/data-room-ui/packages/components/G2Plots/js/mixins/g2plotMixins.js'
import axios from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import * as g2Plot from '@antv/g2plot'
import chartData from './data.json'
import { getData } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
export default {
  name: 'GroupBar',
  components: {},
  mixins: [g2plotMixins],
  props: {
  },
  data () {
    return {
      chartData,
      show: true
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
</style>
