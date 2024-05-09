<!--
@name:交互弹窗
@description:
@author: byx
@time:
-->
<template>
  <el-dialog
    v-if="dialogVisible"
    :close-on-click-modal="false"
    title="交互设置"
    width="90%"
    :visible.sync="dialogVisible"
    class="dataroom-interactions-wrap dataroom-el-dialog"
    :before-close="beforeClose"
  >
    <el-row class="dataroom-interactions-content">
      <el-col
        :span="4"
        class="left"
      >
        <div class="left-top item-box">
          <div class="item-box-title">
            交互类型
          </div>
          <el-cascader
            ref="cascader"
            v-model="interactionType"
            style="margin-bottom: 10px"
            placeholder="请选择交互类型"
            :options="options"
            :show-all-levels="false"
            :props="props"
            @change="changeInteractionType"
          >
            <template slot-scope="{ node, data }">
              <span @click="handleInteraction(data)">{{ data.name }}</span>
            </template>
          </el-cascader>
        </div>
        <div class="left-center item-box">
          <div class="item-box-title">
            交互列表
          </div>
          <div class="content-box">
            <el-tree
              :data="interactions"
              :props="defaultProps"
              :default-expanded-keys="[0]"
              node-key="code"
              @node-click="handleNodeClick"
            >
              <span
                slot-scope="{ node, data }"
                class="tree-item"
                @mouseenter="toolHandle(true,node,data)"
                @mouseleave="toolHandle(false)"
              >
                <span>{{ data.name }}</span>
                <span
                  v-if="toolShow && hoverId === data.code"
                  class="item-tool"
                  @click.stop="nodeDelHandle(data.code)"
                >
                  <i class="icon el-icon-delete node-del" />
                </span>
              </span>
            </el-tree>
          </div>
        </div>
      </el-col>
      <el-col
        :span="10"
        class="center"
      >
        <div class="item-box center-box">
          <div class="item-box-title">
            交互设置
          </div>
          <div class="content-box">
            <el-form
              v-if="currentEvent"
              ref="form"
              :model="currentEvent"
              label-width="80px"
            >
              <template v-if="currentEvent.trigger === 'event'">
                <el-form-item label-width="0">
                  <codemirror
                    v-model="script"
                    :options="codemirrorOption"
                    class="big-codemirror"
                    style="margin-top: 2px;border: 1px solid rgb(232, 232, 232);"
                    @input="handleScript"
                  />
                </el-form-item>
              </template>
              <template v-else-if="currentEvent.trigger === 'timer'">
                <el-form-item label="事件名称">
                  <el-input
                    v-model="currentEvent.name"
                    @change="updateInteraction"
                  />
                </el-form-item>
                <el-form-item label="定时方式">
                  <el-radio-group
                    v-model="currentEvent.method"
                    class="bs-el-radio-group"
                    @change="updateInteraction"
                  >
                    <el-radio label="delay">
                      延迟定时
                    </el-radio>
                    <el-radio label="timing">
                      定点定时
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item
                  v-if="currentEvent.method === 'delay'"
                  label="延迟/间隔时间"
                >
                  <el-input
                    v-model="currentEvent.delay"
                    @change="updateInteraction"
                  />
                </el-form-item>
                <el-form-item
                  v-if="currentEvent.method !== 'delay' && currentEvent.loop"
                  label="定点周期"
                >
                  <el-input
                    v-model="currentEvent.delay"
                    @change="updateInteraction"
                  />秒
                </el-form-item>
                <el-form-item label="是否循环">
                  <el-switch
                    v-model="currentEvent.loop"
                    @change="updateInteraction"
                  />
                </el-form-item>
                <el-form-item
                  v-if="currentEvent.method !== 'delay'"
                  label="定点时间"
                >
                  <el-date-picker
                    v-model="currentEvent.time"
                    type="datetime"
                    value-format="timestamp"
                    @change="updateInteraction"
                  />
                </el-form-item>
                <el-form-item label-width="0">
                  <codemirror
                    v-model="script"
                    :options="codemirrorOption"
                    class="small-codemirror"
                    style="margin-top: 2px;border: 1px solid rgb(232, 232, 232);"
                    @input="handleScript"
                  />
                </el-form-item>
              </template>
            </el-form>
          </div>
        </div>
      </el-col>
      <el-col
        :span="8"
        class="right"
      >
        <div class="item-box right-box">
          <div class="item-box-title">
            帮助
          </div>
          <div class="content-box">
            <help-dialog
              ref="helpDialog"
              :options="options"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { randomString } from '@gcpaas/data-room-ui/packages/js/utils'
import { getInteraction } from '@gcpaas/data-room-ui/packages/bigScreen/components/interactionInstall'
import HelpDialog from './HelpDialog.vue'
import cloneDeep from 'lodash/cloneDeep'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'
export default {
  name: 'InteractionDialog',
  components: { HelpDialog, codemirror },
  props: {
    resourceType: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      interactionType: [],
      toolShow: false,
      hoverId: '',
      codemirrorOption: {
        mode: 'text/javascript',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'eclipse',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      currentEvent: null,
      options: [],
      filters: null,
      interactions: null,
      script: '',
      currentIndex: 0,
      currentEventIndex: 0,
      dialogVisible: false,
      props: {
        label: 'name',
        value: 'code',
        type: 'type',
        expandTrigger: 'hover'
      },
      defaultProps: {
        children: 'children',
        label: 'name',
        value: 'code',
        method: 'method',
        loop: 'loop',
        delay: 'delay',
        time: 'time',
        event: 'event',
        trigger: 'trigger'
      },
      eventList: [], // 事件列表
      logicList: [], // 已有的交互逻辑列表
      triggerList: [
        {
          label: '组件事件触发',
          value: 'event'
        },
        {
          label: '定时触发',
          value: 'timer'
        }
      ]
    }
  },
  inject: ['canvasInst'],
  computed: {
    // 弹窗列表
    dialogComponentList () {
      return this.canvasInst?.dialogChartList?.map((item) => {
        return {
          name: item?.title?.text,
          type: item.type,
          code: item.code,
          bizCode: item?.bizCode,
          isDialogCom: true
        }
      })
    },
    // 系统内置组件列表
    componentList () {
      return this.canvasInst?.chartList?.map((item) => {
        return {
          name: item?.title?.text,
          type: item.type,
          code: item.code,
          bizCode: item?.bizCode
        }
      })
    }
  },
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    init () {
      this.options = [
        {
          name: '全局',
          code: 'global',
          children: [
            {
              name: '定时器',
              code: 'timer'
            },
            {
              name: '键盘事件',
              code: 'keyboard',
              disabled: true
            }
          ]
        },
        {
          name: '图层组件',
          code: 'component',
          children: this.componentList
        },
        {
          name: '下钻组件',
          code: 'dialogCom',
          children: this.dialogComponentList
        }
      ]
      this.interactions = cloneDeep(this.canvasInst.interactions)
      // // 初始化树节点
      // this.syncTreeData()
      this.filters = cloneDeep(this.canvasInst.filters)
      this.dialogVisible = true
    },
    // 鼠标悬浮节点
    toolHandle (isShow, node, data) {
      if (isShow) {
        this.hoverId = data.code
      }
      this.toolShow = isShow
    },
    // 删除节点同时删除交互信息
    nodeDelHandle (code) {
      this.$confirm('确定删除交互吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(() => {
          this.removeNode(this.interactions, code)
        })
        .catch(() => {})
    },
    removeNode (tree, targetId) {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i].code === targetId) {
          tree.splice(i, 1)
          return
        }
        if (tree[i].children) {
          this.removeNode(tree[i].children, targetId)
        }
      }
    },
    changeInteractionType () {
      this.interactionType = []
    },
    // 选择交互对象
    handleInteraction (data) {
      const code = data.code
      // 如果点击的是定时器
      if (code === 'timer') {
        const timerId = 'timer' + randomString(8)
        // 判断树节点中是否存在全局节点
        const index = this.interactions?.findIndex(item => item.code === 'global')
        // 如果不存在
        if (!(this.interactions && this.interactions.length && index !== -1)) {
          this.interactions.push({
            name: '全局',
            code: 'global',
            children: [{
              code: timerId,
              name: '定时器',
              method: 'delay',
              loop: true,
              delay: 1,
              time: '',
              trigger: 'timer',
              filterId: timerId
            }]
          })
        } else {
          // 如果存在,则在全局节点下面添加子节点
          this.interactions[index].children.push({
            code: timerId,
            name: '定时器' + (this.interactions[index].children.length + 1),
            trigger: 'timer',
            method: 'delay',
            loop: true,
            delay: 1,
            time: '',
            filterId: timerId
          })
        }
        this.filters[timerId] = {
          name: '',
          script: ''
        }
      } else if (code === 'keyboard') {
        // TODO 如果是键盘事件

      } else {
        // 如果是组件交互
        if (!(this.interactions && this.interactions.length && this.interactions.find((item) => item.code === code))) {
          const list = data.isDialogCom ? this.options.find(option => option.code === 'dialogCom')?.children : this.options.find(option => option.code === 'component')?.children
          const com = list?.find((item) => item.code === code)
          let comEvent = []
          if (com) {
            // 如果是一般的组件
            getInteraction(com.type).then((res) => {
              comEvent = res.filter((item) => item.event)
              this.interactions.push({
                name: com?.title?.text || com.name,
                code: com.code,
                children: comEvent.map((item) => {
                  const eventId = 'event' + randomString(8)
                  this.filters[eventId] = {
                    name: '',
                    script: ''
                  }
                  return {
                    code: eventId,
                    name: item.name,
                    event: item.code, // 事件列表的code指的是当前事件的类型，比如click
                    trigger: 'event',
                    filterId: eventId
                  }
                })
              })
            })
          }
        } else {
          this.$message.warning('交互已存在')
        }
      }
    },
    // 自定义脚本逻辑
    handleScript (script) {
      this.$set(this.filters[this.currentEvent.filterId], 'script', script)
    },
    // 点击左侧树节点
    handleNodeClick (obj, node, com) {
      const code = node.data.code
      // 如果点击的是交互的节点
      if (node.isLeaf && node.level !== 1) {
        const parentCode = node.parent.data.code === 'global' ? '' : node.parent.data.code
        this.currentEvent = this.findNodeById(this.interactions, code)
        this.script = this.filters[this.currentEvent.filterId]?.script
        const eventCode = this.currentEvent.event || ''
        // 帮助面板同步点击内容
        this.$refs.helpDialog.handleComponent({ code: parentCode })
        this.$refs.helpDialog.handleEvent(eventCode)
      } else {
        // 如果点击的是目录，则清空设置
        this.currentEvent = {
          trigger: ''
        }
        const code = node.data.code === 'global' ? '' : node.data.code
        // 帮助面板同步点击内容
        this.$refs.helpDialog.handleComponent({ code })
        this.$refs.helpDialog.handleEvent('')
      }
    },
    // 根据id查找节点
    findNodeById (tree, targetId) {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i].code === targetId) {
          return tree[i]
        }
        if (tree[i].children) {
          const foundNode = this.findNodeById(tree[i].children, targetId)
          if (foundNode) {
            return foundNode
          }
        }
      }
      return null
    },
    // 更新交互
    updateInteraction () {
      // 将当前正在编辑的交互信息更新到交互列表里面
      this.replaceItemById(this.interactions, this.currentEvent)
    },
    // 根据id更新某一项
    replaceItemById (nodes, item) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].code === item.code) {
          this.$set(nodes, i, item)
          return
        }
        if (nodes[i].children) {
          this.replaceItemById(nodes[i].children, item)
        }
      }
    },
    // 点击确定按钮
    beforeClose () {
      this.canvasInst.updateInteractions(this.interactions)
      for (const key in this.filters) {
        this.canvasInst.updateDataScript(key, this.filters[key])
      }
      // 点击确定后立即触发定时器
      this.canvasInst.triggerTimer()
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';
.dataroom-interactions-wrap{
  ::v-deep .el-dialog{
    width: 90%;
    height: 80vh;
  }
  ::v-deep .el-dialog__body{
    max-height: unset;
  }
  .dataroom-interactions-content{
    position: absolute;
    width: calc(100% - 40px);
    height: calc(100% - 100px);
    display: flex;
    padding:20px;
    padding-top: 30px;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    .left{
      //position: absolute;
      height: 100%;
      border: 1px solid #dddddd;
      .left-top{
        height: 80px
      }
      .left-center{
        height: calc(100% - 80px);
        //height: 400px;
        border: 1px solid #dddddd;
        .tree-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          padding-right: 8px;

          .item-tool {
            .node-del{
              margin-left: 10px;
              &:hover{
                color:#000000;
              }
            }
          }
        }
      }
    }
    .center{
      //position: absolute;
      height: 100%;
      box-sizing: border-box;
      border: 1px solid #dddddd;
      margin: 0 20px;
      .center-box{
        height:100%;
      }
    }
    .right{
      .right-box{
        height: 100%;
      }
    }
    .help-btn{
      margin-left: 20px;
    }
  }
  .item-box{
    position: relative;
    border: 1px solid #dddddd;
    padding: 10px;
    box-sizing: border-box;
    //overflow-y: auto;
    .item-box-title{
      padding: 10px;
      position: absolute;
      top: -25px;
      background-color: #ffffff;
      color: #1a1a1a;
      font-size: 12px;
    }
    .content-box{
      height: 100%;
      overflow: auto;
    }
  }
  .big-codemirror{
    ::v-deep  .CodeMirror {
      height: 450px !important;
      font-family: Helvetica, Tahoma;
    }
  }
  .small-codemirror{
    ::v-deep  .CodeMirror {
      height: 230px !important;
      font-family: Helvetica, Tahoma;
    }
  }
}

</style>
