<!--
 * @description: 设置联动的弹窗
 * @Date: 2023-01-04 14:57:06
 * @Author: xing.heng
 * @LastEditors: wujian
 * @LastEditTime: 2023-05-23 15:46:03
-->
<template>
  <el-dialog
    title="组件联动设置"
    :visible.sync="settingVisible"
    :close-on-click-modal="false"
    :before-close="handleClose"
    width="800px"
    append-to-body
    class="bs-dialog-wrap bs-el-dialog"
  >
    <el-form
      ref="form"
      label-width="100px"
      class="bs-el-form"
    >
      <el-table
        :data="configMapConfig.maps"
        class="bs-table bs-el-table"
      >
        <el-empty />
        <el-table-column
          v-if="config.type === 'tables'"
          label="联动时机"
          align="center"
        >
          <template #default="scope">
            <el-select
              v-model="configMapConfig.maps[scope.$index].timing"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="timing in timingOptions"
                :key="timing.value"
                :label="timing.label"
                :value="timing.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          label="当前组件映射参数"
          align="center"
        >
          <template #default="scope">
            <el-select
              v-model="configMapConfig.maps[scope.$index].sourceField"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="sourceField in sourceFieldList"
                :key="sourceField.value"
                :label="sourceField.label"
                :value="sourceField.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          v-if="config.type === 'tables'"
          label="组件数据映射索引"
          align="center"
        >
          <template #default="scope">
            <el-select
              v-if="configMapConfig.maps[scope.$index].timing === 'dataLoaded'"
              v-model="configMapConfig.maps[scope.$index].mappingIndex"
              popper-class="bs-el-select"
              class="bs-el-select"
              placeholder="请选择或输入"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column
          label="映射规则"
          align="center"
        >
          <span>赋值给</span>
        </el-table-column>
        <el-table-column
          label="目标组件接收参数"
          align="center"
        >
          <template #default="scope">
            <el-select
              v-model="configMapConfig.maps[scope.$index].targetField"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="targetField in targetFieldList"
                :key="targetField.value"
                :label="targetField.label"
                :value="targetField.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="100px"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleDelete(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-button
      v-block
      type="primary"
      @click="addRelatedField"
    >
      新增联动字段
    </el-button>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="handleClose"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="updateConfig"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import { operatorList } from 'data-room-ui/js/dict/chartDict'
export default {
  name: 'RalationSetting',
  components: {
  },
  directives: {
    block: {
      bind (el, binding) {
        el.style.width = binding.value || '100%'
        el.style.margin = '10px auto'
      }
    }
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    settingVisible: {
      type: Boolean,
      default: false
    },
    configMap: {
      type: Object,
      default: () => ({})
    },
    sourceFieldList: {
      type: Array,
      default: () => []
    },
    targetFieldList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      operatorList,
      timingOptions: [
        { label: '数据初始化时', value: 'dataLoaded' },
        { label: '点击组件时', value: 'click' }
      ],
      options: [
        { label: '首项', value: 'first' },
        { label: '末项', value: 'last' }
      ]
    }
  },
  computed: {
    configMapConfig () {
      const config = this.configMap || { componentKey: '', maps: [] }
      // 在 getter 内部做兼容处理
      if (config.maps && config.maps.length > 0) {
        config.maps.forEach(item => {
          item.timing = item.timing || 'click'
          item.mappingIndex = item.mappingIndex || 'first'
        })
      }
      return config
    },
    choosedTargetFields () {
      return this.configMapConfig.maps.map(item => item.targetField)
    }
  },
  methods: {
    /**
    * @description: 关闭弹窗
    */
    handleClose () {
      this.$emit('update:settingVisible')
    },
    /**
    * @description: 更新配置
    */
    updateConfig () {
      this.$emit('updateConfig', this.configMapConfig)
      this.handleClose()
    },
    /**
     * @description: 新增关联字段
     */
    addRelatedField () {
      this.configMapConfig.maps.push({
        timing: 'click',
        mappingIndex: 'first',
        targetField: '',
        sourceField: '',
        queryRule: '='
      })
    },
    handleDelete (index) {
      this.configMapConfig.maps.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/style/bsTheme.scss';
</style>
