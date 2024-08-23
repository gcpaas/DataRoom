<template>
  <div
    class="dataroom-style-wrapper"
    @click.stop
  >
    <div class="title">
      {{config.name}}
    </div>
    <el-form
      ref="form"
      :rules="rules"
      :model="config"
      label-width="100px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <div class="dataroom-base-set-wrapper">
        <BaseSet :config="config" />
      </div>
      <div class="tabs-set-box">
        <el-tabs
          v-model="activeName"
          tab-position="left"
          style="height: 200px;"
        >
          <el-tab-pane
            v-for="(nav,index) in navList"
            :key="index"
            :name="nav.name"
          >
            <span
              slot="label"
              class="label-box"
            >{{ nav.label }}</span>
            <Graph
              v-if="activeName === 'graph' && nav.name === 'graph'"
              :config="config"
            />
            <Legend
              v-if="activeName === 'legend' && nav.name === 'legend'"
              :config="config"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-form>
  </div>
</template>

<script>
import BaseSet from '@gcpaas/data-room-ui/packages/components/common/panel/baseSet/index.vue'
import Graph from './graph.vue'
import Legend from './legend.vue'
export default {
  name: '',
  components: {
    Legend,
    BaseSet,
    Graph
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      activeName: 'graph',
      navList: [
        {
          name: 'graph',
          label: '图形'
        // icon: 'el-icon-picture'
        },
        {
          name: 'legend',
          label: '图例'
          // icon: 'el-icon-picture'
        }

      ],
      rules: {
        'config.option.columnStyle.radius[0]': [
          { type: 'number', message: '请输入数字', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {}
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
