<template>
  <el-dialog
    :close-on-click-modal="false"
    :append-to-body="true"
    title="数据集设置"
    :visible.sync="dataSetVisible"
    width="80%"
    class="bs-dialog-wrap data-set-wrap bs-el-dialog"
    @opened="openedInit"
  >
    <el-tabs
      v-if="isUseSlot"
      v-model="tabsActiveName"
      class="bs-el-tabs"
      @tab-click="handleClickTabs"
    >
      <el-tab-pane
        label="数据集选择"
        name="dataSet"
      >
        <DataSetManagement
          ref="dataSetSetting"
          class="bs-data-set-management"
          :is-border="true"
          :is-dialog="true"
          :ToAdd='isAdd'
          :doEdit='doEdit'
          :isDelete='isDelete'
          :ds-id="dataSetId"
          :multiple="multiple"
          :ds-value="DataDsValue"
        />
      </el-tab-pane>
      <slot
        name="dataSetSelect"
        :value="DataDsValue"
      />
    </el-tabs>
    <DataSetManagement
      v-else
      ref="dataSetSetting"
      class="bs-data-set-management"
      :is-border="true"
      :is-dialog="true"
      :ToAdd='isAdd'
      :doEdit='doEdit'
      :isDelete='isDelete'
      :ds-id="dataSetId"
      :multiple="multiple"
      :ds-value="DataDsValue"
    />
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="dataSetVisible = false"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="sure"
      >
        确定
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import DataSetManagement from 'data-room-ui/DataSetManagement'
export default {
  name: 'DataSetSetting',
  components: { DataSetManagement },
  props: {
    config: {
      type: Object,
      default: () => {
      }
    },
    dsId: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    dsValue: {
      type: [Array, Object],
      default: () => ([])
    }
  },
  data () {
    return {
      dataSetVisible: false,
      dataSetId: null,
      newDataDsValue: '',
      tabsActiveName: 'dataSet',
      // 组件实例
      componentInstance: null,
      // 是否使用了插槽
      isUseSlot: false
    }
  },
  computed: {
    DataDsValue () {
      if (this.multiple) {
        return this.dsValue
      } else {
        return {
          id: this.dsId
        }
      }
    },
    isAdd(){
      let a=-1
      if(window.BS_CONFIG?.datasetAuth) {
       a=window.BS_CONFIG?.datasetAuth.findIndex(item=>item=='unAdd')
      }
      if(a==-1){
        return true
      }else{
        return false
      }
    },
    doEdit(){
      let a=-1
      if(window.BS_CONFIG?.datasetAuth) {
       a=window.BS_CONFIG?.datasetAuth.findIndex(item=>item=='unEdit')
      }
      if(a==-1){
        return true
      }else{
        return false
      }
    },
    isDelete(){
      let a=-1
      if(window.BS_CONFIG?.datasetAuth) {
       a=window.BS_CONFIG?.datasetAuth.findIndex(item=>item=='unDelete')
      }
      if(a==-1){
        return true
      }else{
        return false
      }
    }

  },
  mounted () {
    this.dataSetId = this.dsId
    // 判断是否使用了插槽
    if (this.$scopedSlots && this.$scopedSlots.dataSetSelect && this.$scopedSlots.dataSetSelect()) {
      this.isUseSlot = true
    } else {
      this.isUseSlot = false
    }
  },
  methods: {
    openedInit () {
      // 将内置的组件实例赋值给componentInstance
      this.componentInstance = this.$refs.dataSetSetting
      this.newDataDsValue = this.DataDsValue
    },
    handleClickTabs (vueComponent, event) {
      this.componentInstance = vueComponent.$children[0]
    },
    sure () {
      this.dataSetVisible = false
      const getSelectDs = this.componentInstance.getSelectDs()
      if (Object.prototype.hasOwnProperty.call(getSelectDs, 'id')) {
        this.dataSetId = getSelectDs.id
      }
      this.$emit('getDsId', this.dataSetId)
      this.$emit('getSelectDs', getSelectDs)
    }
  }
}
</script>

<style lang="scss"></style>

<style lang="scss" scoped>
@import '../assets/style/bsTheme.scss';

::v-deep .big-screen-router-view-wrap {
  padding-left: 16px !important;
}

::v-deep .el-tabs__header {
  margin-bottom: 0;
}

.data-set-wrap {
  ::v-deep .el-dialog__body {
    position: relative;
    padding: 0 !important;
    min-height: 550px;
    overflow: hidden;
  }

  ::v-deep .bs-container {
    padding: 0;
    min-height: 550px;

    .el-table {
      max-height: calc(90vh - 350px);
    }

    .bs-table-box {
      margin-bottom: 0px;
    }

    .ztree {
      max-height: none !important;
    }
  }

  .bs-data-set-management {
    ::v-deep .bs-container {
      margin-left: 0 !important;
    }

    ::v-deep .layout {
      position: absolute !important;
    }

    ::v-deep .ztree {
      height: auto !important;
    }

    ::v-deep .bs-table-box {
      height: auto !important;
    }

    ::v-deep .bs-el-pagination {
      right: 6px !important;
    }

    ::v-deep .data-set-scrollbar {
      height: 515px !important;
    }
  }
}
</style>
