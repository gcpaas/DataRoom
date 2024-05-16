<template>
  <div
    class="dataroom-advanced-panel-wrap"
  >
    <div class="advanced-panel-title">
      <span>关联全局变量</span>
    </div>
    <div class="advanced-panel-content">
      <el-collapse
        v-for="event in config.fieldMapping"
        :key="event.name"
      >
        <el-collapse-item>
          <template slot="title">
            <div class="collapse-item-title">
              <span>{{ event.name }}</span>
              <el-switch
                v-model="event.enable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @click.native.stop
              />
            </div>
          </template>
          <update-to-global-variable
            :config="config"
            :field-map="event"
            :field-name-mapping="fieldNameMapping"
          />
          <div />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
import { getInteraction } from '@gcpaas/data-room-ui/packages/bigScreen/components/interactionInstall'
import updateToGlobalVariable from './updateToGlobalVariable.vue'
export default {
  name: 'AdvancedPanel',
  directives: {
  },
  mixins: [],
  inject: ['canvasInst'],
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    fieldNameMapping: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    updateToGlobalVariable
  },
  data () {
    return {
      eventList: []
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 获取事件列表
      getInteraction(this.config.type).then((res) => {
        this.eventList = res?.filter((item) => item.event)
        // 为对应的事件添加变量映射
        this.eventList.forEach(event => {
          // 判断是否已经存在该事件映射
          if (!this.config.fieldMapping.some(item => item.code === event.code)) {
            this.config.fieldMapping.push({
              name: event.name,
              enable: false,
              code: event.code,
              fieldList: []
            })
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-advanced-panel-wrap{
  height: 100%;
  .advanced-panel-title{
    padding-left: 10px;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #f6f6f6;
  }
  .advanced-panel-content{
    height: calc(100% - 40px);
    .el-collapse-item__header{
      .collapse-item-title{
        padding: 0 10px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style>
