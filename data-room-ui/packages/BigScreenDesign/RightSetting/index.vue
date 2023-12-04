<template>
  <div
    class="bs-setting-wrap"
    @click.stop
  >
    <el-tabs
      v-if="config.option.displayOption.dataAllocation.enable"
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="数据"
        name="data"
      >
        <DataSetting
          ref="dataSetting"
          :key="config.code"
        >
          <template #dataSetSelect="{value}">
            <slot
              name="dataSetSelect"
              :value="value"
            />
          </template>
        </DataSetting>
      </el-tab-pane>
      <el-tab-pane
        label="样式"
        name="second"
      >
        <component
          :is="resolveComponentType(config.type)"
          ref="customSetting"
          :key="config.code"
          :config="config"
          @closeRightPanel="close"
        />
      </el-tab-pane>
    </el-tabs>
    <el-scrollbar
      v-else
      class="bs-setting-wrap bs-scrollbar"
    >
      <component
        :is="resolveComponentType(config.type)"
        ref="customSetting"
        :key="config.code"
        :config="config"
        @closeRightPanel="close"
      />
    </el-scrollbar>
  </div>
</template>
<script>
import { resolveComponentType } from 'data-room-ui/js/utils'
import DataSetting from './DataSetting.vue'
import rightSetting from 'data-room-ui/js/utils/rightSettingImport'
import CustomComponent from './G2CustomSetting.vue'
import EchartsCustomSetting from './EchartsCustomSetting.vue'
import Svgs from 'data-room-ui/Svgs/setting.vue'
import { mapState, mapMutations } from 'vuex'
// import _ from 'lodash'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
// 整体动态导入右侧设置组件，不用手动注册
const components = {}
for (const key in rightSetting) {
  if (Object.hasOwnProperty.call(rightSetting, key)) {
    const component = rightSetting[key]
    components[key] = component
  }
}
export default {
  name: 'RightSetting',
  components: {
    ...components,
    DataSetting,
    CustomComponent,
    Svgs,
    // 远程组件的样式配置也和g2Plot的样式配置一样，采用属性配置, 故使用一个组件
    RemoteComponent: CustomComponent,
    EchartsComponent: EchartsCustomSetting
  },
  data () {
    return {
      activeName: 'data',
      isOperationRollback: false
    }
  },
  computed: {
    ...mapState({
      activeCode: (state) => state.bigScreen.activeCode,
      hoverCode: (state) => state.bigScreen.hoverCode,
      config: (state) => state.bigScreen.activeItemConfig,
      chartList: (state) => state.bigScreen.pageInfo.chartList
    }),
    pageCode () {
      return this.$route.query.code
    },
    configDataSource () {
      return {
        dataSource: cloneDeep(this.config.dataSource),
        linkage: cloneDeep(this.config?.linkage),
        dataHandler: this.config?.dataHandler,
        dataSourceSetting: cloneDeep(this.config?.setting?.filter(item => item.tabName === 'data')) || [],
        code: this.config?.code
      }
    },
    configStyle () {
      return {
        showTitle: this.config.showTitle,
        title: cloneDeep(this.config?.title),
        border: cloneDeep(this.config?.border),
        w: this.config?.w,
        h: this.config?.h,
        x: this.config?.x,
        y: this.config?.y,
        z: this.config?.z,
        rotateX: this.config?.rotateX,
        rotateY: this.config?.rotateY,
        rotateZ: this.config?.rotateZ,
        perspective: this.config?.perspective,
        skewX: this.config?.skewX,
        skewY: this.config?.skewY,
        setting: cloneDeep(this.config?.setting),
        customize: cloneDeep(this.config?.customize),
        url: this.config?.url,
        dateFormat: this.config?.dateFormat,
        endTime: this.config?.endTime
      }
    }
  },
  watch: {
    // 只更新样式部分，不调用接口
    configStyle: {
      handler (val, oldValue) {
        this.handleConfigChange(val, oldValue, 'configStyle')
      },
      deep: true
    },
    // 更新数据源部分，需要调用接口
    configDataSource: {
      handler (val, oldValue) {
        this.handleConfigChange(val, oldValue, 'configDataSource')
      },
      deep: true
    }
  },
  mounted () {
    EventBus.$on('operationRollback', val => {
      this.isOperationRollback = val
    })
  },
  beforeDestroy () {
    EventBus.$off('operationRollback')
  },
  methods: {
    ...mapMutations('bigScreen', [
      'saveTimeLine'
    ]),
    debounce (delay, obj) {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.$emit('updateSetting', { ...obj })
      }, delay)
    },
    handleConfigChange (val, oldValue, type) {
      if (val.code === oldValue.code) {
        if (!isEqual(val, oldValue)) {
          if (type === 'configStyle') {
            if (this.config.type === 'iframeChart') {
              this.debounce(500, { ...val, type: this.config.type, code: this.config.code, parentCode: this.config?.parentCode })
            } else {
              this.$emit('updateSetting', { ...val, type: this.config.type, code: this.config.code, theme: this.config.theme, parentCode: this.config?.parentCode })
            }
          } else {
            this.$emit('updateDataSetting', this.config)
          }
          if (!this.isOperationRollback) {
            this.saveTimeLine(`更新${val?.title ?? this.config.title}组件属性`)
            this.isOperationRollback = false
          }
        }
      }
    },
    close () {
      this.$emit('closeRightPanel')
    },
    handleClick (val) {
      this.$set(this, 'activeName', val.name)
    },
    resolveComponentType,
    // 多个表单校验
    getFormPromise (form) {
      return new Promise((resolve) => {
        form.validate((res) => {
          resolve(res)
        })
      })
    },
    // 更新
    update () {
      // 有数据配置也有自定义配置的组件
      if (this.config.option.displayOption.dataAllocation.enable) {
        // 获取子组件的表单元素
        const commonForm = this.$refs.dataSetting.$refs.form
        const customForm = this.$refs.customSetting.$refs.form
        Promise.all([commonForm, customForm].map(this.getFormPromise)).then(
          async (res) => {
            const vaildateResult = res.every((item) => !!item)
            if (vaildateResult) {
              if (this.$refs.dataSetting.params) {
                const params = this.$refs.dataSetting.params
                const paramsMap = params.reduce((obj, param) => {
                  obj[param.name] = param.value
                  return obj
                }, {})
                this.config.dataSource.params = paramsMap
              }
              this.$emit('updateDataSetting', this.config)
            } else {
              this.$message.warning('请完成数据配置')
              return false
            }
          }
        )
      } else {
        // 只有自定义配置的组件
        if (this.$refs.customSetting?.$refs?.form?.validate) {
          this.$refs.customSetting.$refs.form.validate((valid) => {
            if (valid) {
              this.$emit('updateSetting', this.config)
              this.$message.success('更新成功')
            } else {
              this.$message.warning('请完成配置')
              return false
            }
          })
        } else {
          // 边框装饰组件的右侧配置
          this.$refs.customSetting.$refs.form.$refs.form.validate((valid) => {
            if (valid) {
              this.$emit('updateSetting', this.config)
              this.$message.success('更新成功')
            } else {
              this.$message.warning('请完成配置')
              return false
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/settingWrap.scss';
.add-filter-box {
  position: relative;
  .add-filter {
    margin-left: 100px;
  }
  .add-filter-btn {
    position: absolute;
    top: 0;
  }
}
</style>
