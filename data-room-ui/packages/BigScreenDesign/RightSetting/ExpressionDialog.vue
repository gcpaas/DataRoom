<template>
  <el-dialog
    :close-on-click-modal="false"
    title="表达式"
    width="60%"
    :visible.sync="formVisible"
    class="bs-dialog-wrap bs-el-dialog"
  >
    <div class="main-box">
      <div class="left-box">
        <el-tree
          ref="tree"
          :data="treeData"
          :indent="0"
          :props="defaultProps"
          :default-expand-all="true"
          :highlight-current="true"
          :expand-on-click-node="false"
          class="bs-el-tree tree-box"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <!-- Check if the node is a top-level node -->
            <span
              v-if="node.level === 1"
              :class="{ 'disabled': node.disabled}"
            >
              <i
                class="el-icon-folder"
              />
              {{ data.label }}
            </span>
            <span
              v-else
              :class="{ 'disabled': node.disabled}"
              style="padding-left: 20px"
            >
              {{ data.label }}
            </span>
          </template>
        </el-tree>
      </div>
      <div class="right-box">
        <div class="codemirror-wrap">
          <codemirror
            ref="codemirrorRef"
            v-model="currentConfig.expression"
            class="codemirror-box"
            :options="codemirrorOption"
            @dragover.prevent
          />
          <el-button
            class="btn-box"
            type="primary"
            @click="executeScript"
          >
            运行脚本
          </el-button>
        </div>
        <div class="script-content-box">
          {{ scriptContent }}
        </div>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default cancel"
        @click="cancel"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="sure"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/nord.css'
import { mapMutations, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'ExpressionDialog',
  components: {
    codemirror
  },
  props: {
    config: {
      type: Object,
      default: () => {
      }
    }
  },
  data () {
    return {
      scriptContent: '', // 脚本执行的内容
      expression: '123',
      formVisible: false,
      codemirrorOption: {
        mode: 'text/javascript',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'nord',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      defaultProps: { label: 'label', children: 'children' }
    }
  },
  computed: {
    ...mapState({
      dataset: state => state.bigScreen.dataset,
      computedDatas: state => state.bigScreen.computedDatas
    }),
    // 获取树节点数据
    treeData () {
      const list = []
      for (const item in this.dataset) {
        let children = []
        if (this.dataset[item][0]) {
          const fields = Object.keys(this.dataset[item][0])
          children = fields.map((field) => {
            return {
              label: field,
              code: item,
              value: `dataset['${item}'][0].${field}`,
              disabled: item.includes(this.config.code)
            }
          })
        }

        list.push({
          label: item.split('_')[0],
          code: item,
          value: `dataset['${item}']`,
          disabled: item.includes(this.config.code),
          children
        })
      }
      for (const item in this.computedDatas) {
        list.push({
          label: item.split('_')[0],
          code: item,
          value: `computedDatas['${item}']`,
          disabled: item.includes(this.config.code)
        })
      }
      return list
    },
    currentConfig () {
      return cloneDeep(this.config)
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig'
    }),
    init () {
      this.formVisible = true
    },
    // 运行脚本
    executeScript () {
      // eslint-disable-next-line no-new-func
      const result = new Function('dataset', 'computedDatas', this.currentConfig.expression)
      this.scriptContent = result(this.dataset, this.computedDatas)
    },
    // 点击树节点将数据添加到脚本编辑器中
    handleNodeClick (node, data, nodeObj) {
      const str = node.value
      const code = node.code
      if (node.disabled) return
      // 判断编辑器里面是return + 0或者多个空格 还是包含其他表达式，每次添加第一个表达式时不要加‘+’,防止计算错误
      const isInit = /^[\w\s]+$/.test(this.currentConfig.expression)
      const newStr = isInit ? this.currentConfig.expression + str : this.currentConfig.expression + ' +  ' + str
      this.$refs.codemirrorRef.codemirror.setValue(newStr)
      // 同时将点击的数据存在expressionCodes中
      if (this.currentConfig.expressionCodes && Array.isArray(this.currentConfig.expressionCodes)) {
        this.currentConfig.expressionCodes.push(code)
      }
    },
    cancel () {
      this.formVisible = false
    },
    sure () {
      this.formVisible = false
      this.changeChartConfig(this.currentConfig)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../assets/style/bsTheme.scss';
.bs-dialog-wrap{
  ::v-deep .el-dialog__body{
    min-height: 500px;
  }
}
  .main-box{
    width: 100%;
    height: 500px;
    display: flex;
    .left-box{
      flex: 1;
      height: 100%;
      .tree-box{
        height: 100%;
        overflow-y: auto;
      }
    }
    .right-box{;
      flex: 3 ;
      height: 100%;
      .codemirror-wrap{
        height: 50%;
        position: relative;
        .btn-box{
          position: absolute;
          right: 10px;
          bottom: 10px;
        }
      }
      .codemirror-box {
        height: 100% !important;
        ::v-deep .CodeMirror {
          height: 100% !important;
          font-family: Helvetica, Tahoma;
        }
      }
      .script-content-box{
        padding:10px
      }
    }
  }
.disabled{
  cursor: not-allowed;
  color: #666666;
}
</style>
