<template>
  <div class="data-setting-data-box">
    <div class="lc-field-head">
      <div class="lc-field-title">
        组件绑定
      </div>
    </div>
    <div class="lc-field-body">
      <div class="select-item select-item-title">
        <span class="input-wrap">绑定组件</span>
        <span class="input-wrap">操作</span>
      </div>
      <div
        v-for="(field, index) in config.customize.bindComponents"
        :key="index"
        class="select-item"
        :class="{ 'select-item-active': field.name === activeCode }"
        @mouseenter="chooseComponent(field)"
      >
        <div class="input-wrap">
          <el-form-item label-width="0px">
            <el-select
              v-model="field.name"
              popper-class="bs-el-select"
              class="bs-el-select"
              size="mini"
              clearable
              @change="changeComponent(...arguments, index)"
            >
              <el-option
                v-for="item in allComponentsExpectSelf(config.code)"
                :key="item.name"
                :label="item.comment"
                :value="item.name"
                :disabled="currentLinkComponentKey.includes(item.name)"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="input-wrap">
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
        @click="addBindComponents"
      >
        新增绑定组件
      </el-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
export default {
  name: 'ComponentBinding',
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
      default: () => []
    }
  },
  data () {
    return {
      // 关联设置弹窗
      settingVisible: false,
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
      return this.config.dataSource.dimensionFieldList?.map(item => item) || []
    }
  },
  mounted () { },
  beforeDestroy () {
  },
  methods: {
    /**
     * @description: 获取除自己之外的所有组件
     */
    allComponentsExpectSelf (code) {
      let layouts = _.cloneDeep(this.chartList)
      const tabComponents = []
      layouts?.map((ly) => {
        if (ly.type === 'Tabs') {
          ly?.tabList?.map(com => {
            tabComponents.push(com.chart)
          })
        }
      })
      layouts = layouts?.filter(item => item.code !== code && !['Tabs', 'titles', 'currentTime', 'timeCountDown', 'iframeChart', 'linkChart', 'carousel'].includes(item.type))
      layouts = [...layouts, ...tabComponents]?.map(item => ({
        name: item.code,
        comment: item.title
      }))
      return layouts
    },
    /**
     * @description: 添加关联组件
     */
    addBindComponents () {
      this.config.customize.bindComponents.push({
        name: '',
        comment: ''
      })
    },
    /**
     * @description: 删除关联组件
     */
    deleteLinkComponents (index) {
      this.config.customize.bindComponents.splice(index, 1)
    },
    /**
     * @description: 改变关联组件
     */
    changeComponent (data, index) {
      this.$set(
        this.config.dataSource.dimensionFieldList,
        index,
        data
      )
      this.$set(
        this.config.customize.bindComponents,
        index,
        {
          name: this.config.customize.bindComponents[index].name,
          comment: this.allComponentsExpectSelf(this.config.code).find(item => item.name === data).comment
        }
      )
    },
    chooseComponent (field) {
      this.activeCode = field?.componentKey
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}

/deep/ .el-tabs__nav-wrap::after {
  height: 0;
}

/deep/ .el-collapse-item__header {
  background: #f2f3f5;
  height: 32px;
  padding: 0 12px;
}

/deep/ .el-collapse-item__content {
  padding-bottom: 0;
}

.lc-field-body {
  padding: 12px;
}

/deep/ .el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}

/deep/ .el-tabs__nav-wrap::after {
  height: 0;
}

.design-tab-warp {
  padding: 10px;
}
/deep/.el-tabs--top {
  height: 100%;
}
/deep/ .el-tabs__content {
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

    /deep/.el-form-item {
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
