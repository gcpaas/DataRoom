<template>
  <el-dialog
    class="dataroom-model-com-dialog dataroom-el-dialog"
    title="弹窗下钻"
    :visible.sync="dialogVisible"
    width="90%"
    :before-close="handleClose"
  >
    <div class="body-box">
      <el-card
        v-if="dialogStyle"
        class="dialog-set-box content-box"
      >
        <div
          slot="header"
          class="clearfix"
        >
          <span>样式设置</span>
        </div>
        <div class="content-main">
          <el-form>
            <el-collapse v-model="activeNames">
              <el-collapse-item
                title="尺寸"
                name="size"
              >
                <el-form-item label="宽度">
                  <el-input-number
                    v-model="dialogStyle.width"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="高度">
                  <el-input-number
                    v-model="dialogStyle.height"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="全屏">
                  <el-switch
                    v-model="dialogStyle.fullPage"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item
                title="标题"
                name="title"
              >
                <el-form-item label="标题">
                  <el-input
                    v-model="dialogStyle.title.content"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="大小">
                  <el-input-number
                    v-model="dialogStyle.title.fontSize"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="颜色">
                  <el-color-picker
                    v-model="dialogStyle.title.fontColor"
                    show-alpha
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="背景色">
                  <el-color-picker
                    v-model="dialogStyle.title.bgColor"
                    show-alpha
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="高度">
                  <el-input-number
                    v-model="dialogStyle.title.height"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item
                title="主体"
                name="body"
              >
                <el-form-item label="背景颜色">
                  <el-color-picker
                    v-model="dialogStyle.body.bgColor"
                    show-alpha
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="上边距">
                  <el-input-number
                    v-model="dialogStyle.body.padding.top"
                    controls-position="right"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="右边距">
                  <el-input-number
                    v-model="dialogStyle.body.padding.right"
                    controls-position="right"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="下边距">
                  <el-input-number
                    v-model="dialogStyle.body.padding.bottom"
                    controls-position="right"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
                <el-form-item label="左边距">
                  <el-input-number
                    v-model="dialogStyle.body.padding.left"
                    controls-position="right"
                    @change="changeDialogConfig"
                  />
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
      </el-card>
      <el-card class="component-list-box content-box">
        <div
          slot="header"
          class="clearfix"
        >
          <span>组件设置</span>
        </div>
        <div class="content-main">
          <el-cascader
            ref="cascader"
            v-model="componentType"
            style="margin-bottom: 10px"
            placeholder="请选择组件类型"
            :options="componentList"
            :show-all-levels="false"
            :props="props"
            @change="changeComHandler"
          >
            <template slot-scope="{ node, data }">
              <span @click="componentChange(data)">{{ data.name }}</span>
            </template>
          </el-cascader>
          <el-button
            type="danger"
            size="small"
            style="margin-left:20px"
            @click="empty"
          >
            清空组件
          </el-button>
          <el-table
            :data="dialogChartList"
            height="250"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="组件"
            >
              <template slot-scope="scope">
                <div
                  slot="reference"
                  class="name-wrapper"
                >
                  {{ scope.row.title.text }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="code"
              label="标识"
            />
            <el-table-column
              label="操作"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="editHandle(scope.row)"
                >
                  设计
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="delHandle(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <edit-dialog
      ref="editDialog"
      :dialog-chart-list="dialogChartList"
    />
  </el-dialog>
</template>

<script>
import EditDialog from './EditDialog'
import { getDeclaration } from '@gcpaas/data-room-ui/packages/bigScreen/components/configInstall'
import { randomString } from '@gcpaas/data-room-ui/packages/js/utils'
import menuList from '@gcpaas/data-room-ui/packages/bigScreen/designer/left/menu/index.js'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'ModelComDialog',
  components: { EditDialog },
  props: {},
  data () {
    return {
      activeNames: 'size',
      props: {
        label: 'name',
        value: 'code',
        type: 'type',
        expandTrigger: 'hover'
      },
      componentType: null,
      componentList: [], // 组件列表
      config: null,
      dialogVisible: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    dialogChartList: {
      get () {
        return this.canvasInst?.dialogChartList
      },
      set (val) {

      }
    },
    dialogStyle () {
      return this.canvasInst?.dialogStyle
    }
  },
  watch: {
  },
  created () {},
  mounted () {
  },
  methods: {
    init () {
      // 准备组件列表
      this.dialogVisible = true
      // 获取系统内置组件列表
      this.getComponentList()
    },
    // 获取系统内置组件列表
    getComponentList () {
      // 处理系统的组件
      const systemList = cloneDeep(menuList).find(item => item.code === 'component').children
      this.addCodeRecursive(systemList)
      this.componentList = [
        {
          code: 'system',
          name: '系统内置组件',
          children: [
            ...cloneDeep(menuList).find(item => item.code === 'component').children
          ]
        }
      ]
    },
    // 对systemList进行处理，主要是由于数据的格式不一样需要统一
    addCodeRecursive (data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!item.code && item.hasOwnProperty('type')) {
          item.code = item.type
        }
        if (item.children && item.children.length > 0) {
          this.addCodeRecursive(item.children)
        }
      }
    },
    empty () {
      this.$confirm('确定清空组件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(() => {
          this.dialogChartList = []
          this.canvasInst.updateDialogChartList([])
          this.componentType = []
        })
        .catch(() => {})
    },
    changeComHandler () {
      this.componentType = []
    },
    // 选择组件类型
    componentChange (data) {
      // 获取组件详情
      getDeclaration(data.type).then(configModule => {
        this.currentConfig = {
          ...configModule,
          width: configModule.w * this.scale,
          height: configModule.h * this.scale,
          code: randomString(8),
          isDialogCom: true
        }
        this.canvasInst.addDialogChartList(this.currentConfig)
      }).catch(err => {
        console.log(err)
      })
    },
    // 修改弹窗配置
    changeDialogConfig () {
      this.canvasInst.updateDialogStyle(this.dialogStyle)
    },
    handleClose () {
      this.dialogVisible = false
    },
    // 点击编辑
    editHandle (row) {
      // 点击编辑的时候将isScreenSet=false,否则可能会导致面板是大屏设置面板
      this.canvasInst.changeIsScreenSet(false)
      this.$refs.editDialog.init(row.code)
    },
    // 点击删除
    delHandle (row) {
      this.$confirm('确定删除组件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(() => {
          this.canvasInst.deleteDialogComByCode(row.code)
          this.componentType = []
        })
        .catch(() => {})
    }
  }
}
</script>
<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';
.dataroom-model-com-dialog{
  ::v-deep .el-dialog{
    width: 90%;
    height: 80vh;
  }
  ::v-deep .el-dialog__body{
    max-height: unset;
  }
  .body-box{
    position: absolute;
    width: calc(100% - 40px);
    height: calc(100% - 100px);
    display: flex;
    .content-box{
      flex: 1;
      height:100%;
      overflow: auto;
      .content-main{
      }
    }
    .dialog-set-box{
      margin-right: 10px;
    }
    .component-list-box{
      margin-left: 10px;
    }
  }
  .dialog-set-box{
    margin-bottom: 20px;
  }
  /*滚动条样式*/
  ::v-deep ::-webkit-scrollbar {
    width: 6px;
    border-radius: 4px;
    height: 4px;
  }
  ::v-deep ::-webkit-scrollbar-thumb {
    background: #E6E6E6 !important;
    border-radius: 10px;
  }
  ::v-deep .el-input{
    width: auto!important;
  }
}
</style>
