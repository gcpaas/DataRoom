<template>
  <el-dialog
    v-if="dialogVisible"
    class="dataroom-el-dialog dataroom-edit-dialog"
    title="组件设计"
    :visible.sync="dialogVisible"
    width="90%"
    :before-close="handleClose"
    :append-to-body="true"
    :destroy-on-close="true"
  >
    <el-row class="content-box">
      <el-col
        :span="15"
        class="content-item-box"
      >
        <div class="item-main">
          <render-card
            v-if="config"
            :key="config.code"
            :ref="'renderCard' + config.code"
            :config="config"
          />
        </div>
      </el-col>
      <el-col
        :span="8"
        class="content-item-box"
      >
        <div class="item-main">
          <right-setting
            v-if="config"
            :key="config.code"
            :config="config"
          />
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>

import RenderCard from '@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/Render/RenderCard.vue'
import RightSetting from '@gcpaas/data-room-ui/packages/bigScreen/designer/right/RightSetting.vue'
export default {
  name: 'EditDialog',
  components: { RightSetting, RenderCard },
  props: {
    dialogChartList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      currentCode: '',
      // config: null,
      dialogVisible: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    config: {
      get () {
        return this.dialogChartList.find(item => item.code === this.currentCode)
      },
      set () {

      }

    }
  },
  created () {},
  mounted () {
  },
  methods: {
    init (code) {
      this.dialogVisible = true
      this.currentCode = code
    },
    handleClose () {
      this.dialogVisible = false
      this.config = null
    }
  }
}
</script>

<style scoped lang="scss">
.dataroom-edit-dialog{
  ::v-deep .el-dialog{
    width: 90%;
    height: 80vh;
  }
  ::v-deep .el-dialog__body{
    max-height: unset;
  }
  .content-box{
    position: absolute;
    width: calc(100% - 40px);
    height: calc(100% - 100px);
    .content-item-box{
      height: 100%;
      margin: 5px;
      border-right: 1px solid #ebeef5;
      box-sizing: border-box;
      .item-title{
        height:50px
      }
      .item-main{
        height: calc(100% - 50px);
        overflow: auto;
        padding: 10px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
