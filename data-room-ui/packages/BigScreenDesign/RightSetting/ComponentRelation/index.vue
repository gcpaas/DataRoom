<!--
 * @description: 设置组件关联的公共组件
 * @Date: 2023-01-04 14:42:51
 * @Author: xing.heng
 * @LastEditors: wujian
 * @LastEditTime: 2023-06-02 15:35:43
-->
<template>
  <div>
    <div class="data-setting-data-box">
      <div class="lc-field-head">
        <div class="lc-field-title">
          组件联动
        </div>
      </div>
      <div class="lc-field-body">
        <div class="select-item select-item-title">
          <span class="input-wrap">目标组件</span>
          <span class="input-wrap">操作</span>
        </div>
        <div
          v-for="(field, index) in config.linkage.components"
          :key="index"
          class="select-item"
          :class="{ 'select-item-active': field.componentKey === activeCode }"
          @mouseenter="chooseComponent(field)"
        >
          <div class="input-wrap">
            <el-form-item
              label-width="0px"
            >
              <el-select
                v-model="field.componentKey"
                popper-class="bs-el-select"
                class="bs-el-select"
                size="mini"
                @change="changeComponent(...arguments, index)"
              >
                <el-option
                  v-for="item in allComponentsExpectSelf(config.code)"
                  :key="item.componentKey"
                  :label="item.name"
                  :value="item.componentKey"
                  :disabled="currentLinkComponentKey.includes(item.componentKey)"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="input-wrap">
            <div
              class="select-line-icon option-add"
              @click="setRelation(field)"
            >
              <el-tooltip
                effect="dark"
                content="组件联动设置"
                placement="top"
              >
                <i class="el-icon-setting" />
              </el-tooltip>
            </div>
            <div
              class="select-line-icon option-delete"
              @click="deleteLinkComponents(index)"
            >
              <i class="el-icon-remove-outline" />
            </div>
          </div>
        </div>
        <el-button
          v-block
          type="primary"
          @click="addLinkComponents"
        >
          新增联动组件
        </el-button>
      </div>
    </div>
    <RelationSetting
      :setting-visible.sync="settingVisible"
      :config-map="configMap"
      :source-field-list="sourceFieldList"
      :target-field-list="targetFieldList"
      @updateConfig="updateConfig"
    />
  </div>
</template>
<script>
import RelationSetting from './RelationSetting.vue'
import cloneDeep from 'lodash/cloneDeep'
import { mapState } from 'vuex'
export default {
  name: 'ComponentRelation',
  components: {
    RelationSetting
  },
  directives: {
    block: {
      bind (el, binding) {
        el.style.width = binding.value || '100%'
      }
    }
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    // 当前组件的联动字段
    sourceFieldList: {
      type: Array,
      default: () => [
        // {
        //   label: '字段1',
        //   value: 'field1'
        // }
      ]
    }
  },
  data () {
    return {
      // 关联设置弹窗
      settingVisible: false,
      cloneDeepConfig: cloneDeep(this.config),
      configMap: {},
      targetFieldList: [],
      activeCode: null
    }
  },
  computed: {
    ...mapState({
      chartList: state => state.bigScreen.pageInfo.chartList
    }),
    // 当前已经关联的组件key
    currentLinkComponentKey () {
      return this.config.linkage.components?.map(item => item.componentKey) || []
    }
  },
  mounted () {
  },
  beforeDestroy () {
  },
  methods: {
    /**
     * @description: 获取除自己之外的所有组件
     */
    allComponentsExpectSelf (code) {
      let layouts = cloneDeep(this.chartList)
      const tabComponents = []
      layouts?.map((ly) => {
        if (ly.type === 'Tabs') {
          ly?.tabList?.map(com => {
            tabComponents.push(com.chart)
          })
        }
      })
      layouts = layouts?.filter(item => item.code !== code && item?.option?.displayOption?.dataAllocation?.enable)
      layouts = [...layouts, ...tabComponents]?.map(item => ({
        name: item.title,
        componentKey: item.code
      }))
      return layouts
    },
    /**
     * @description: 添加关联组件
     */
    addLinkComponents () {
      this.config.linkage.components.push({
        componentKey: '',
        maps: []
      })
    },
    /**
     * @description: 删除关联组件
     */
    deleteLinkComponents (index) {
      this.config.linkage.components.splice(index, 1)
    },
    /**
     * @description: 改变关联组件
     */
    changeComponent (componentKey, index) {
      this.$set(
        this.config.linkage.components,
        index,
        {
          componentKey,
          maps: []
        }
      )
    },
    /**
     * @description: 设置关联弹窗打开
     */
    setRelation (configMap) {
      this.settingVisible = true
      // 如果是tab页内部组件，先平铺
      let layouts = cloneDeep(this.chartList)
      const tabComponents = []
      layouts?.map((ly) => {
        if (ly.type === 'Tabs') {
          ly?.tabList?.map(com => {
            tabComponents.push(com.chart)
          })
        }
      })
      layouts = layouts?.filter(item => item?.option?.displayOption?.dataAllocation?.enable)
      layouts = [...layouts, ...tabComponents]
      this.targetFieldList = layouts.find(
        item => item.code === configMap.componentKey
      )?.inParams?.map(item => ({
        label: item.name,
        value: item.code
      }))
      this.configMap = cloneDeep(configMap)
    },
    /**
     * @description: 更新关联配置
     */
    updateConfig (configMapConfig) {
      const index = this.config.linkage.components?.findIndex(
        item => item.componentKey === configMapConfig.componentKey
      )
      this.$set(
        this.config.linkage.components,
        index,
        configMapConfig
      )
    },
    /**
     * @description: 选择组件
     */
    chooseComponent (field) {
      this.activeCode = field?.componentKey
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}

::v-deep .el-collapse-item__header {
  background: #f2f3f5;
  height: 32px;
  padding: 0 12px;
}

::v-deep .el-collapse-item__content {
  padding-bottom: 0;
}

.lc-field-body {
  padding: 12px;
}

::v-deep .el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}

.design-tab-warp {
  padding: 10px;
}
::v-deep .el-tabs--top {
  height: 100%;
}
::v-deep .el-tabs__content {
  height: calc(100% - 40px);
  overflow-y: auto;
}
.setting-body {
  height: 100%;
}
// 筛选条件的按钮样式
.add-filter-box {
  position: relative;
  .add-filter {
    margin-left: 90px;
    margin-bottom: 10px;
  }
  .add-filter-btn {
    position: absolute;
    top: 0;
  }
}
.select-item {
  display: flex;
  margin-bottom: 8px;
  cursor: pointer;
  align-items: center;
  border: 1px solid #fff;
  padding: 4px;

  .input-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    margin-right: 2px;

    ::v-deep .el-form-item {
      margin-bottom: 0 !important;
    }

    .el-input-number--mini {
      width: 90px !important;
    }
  }
  .input-wrap_left {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: left;
  }

  .select-line-icon {
    width: 30px;
    font-size: 18px;
    cursor: pointer;
    text-align: center;
  }

  .option-delete {
    color: #f56c6c;
  }
}
.select-item-active {
  border: 1px solid var(--bs-el-color-primary);
  background: var(--bs-el-background-3);
}
// 修改设置面板样式
.data-setting-box{
  .data-setting-data-box{
    .lc-field-head{
      height: 30px;
      .lc-field-title{
        position: relative;
        padding-left: 12px;
        line-height: 30px;
        height: 30px;
        &:after{
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          content: '';
          width: 4px;
          height: 14px;
          background-color: var(--bs-el-color-primary);
        }
      }
    }
  }
}
</style>
