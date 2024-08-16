<template>
  <div
    id="box"
    class="bs-container"
    @mousemove="mousemoveOnBox"
    @mouseup="mouseupOnBox"
  >
    <el-row
      v-show="datasetType === null"
      type="flex"
      class="layout"
    >
      <div
        id="left-box"
        class="left-box"
        :style="{ transition: transition + 's' }"
      >
        <div class="inner-container">
          <TypeTree
            ref="datasetsTypeTree"
            :dataset-type-list="datasetTypeList"
            :app-code="appCode"
            @nodeClick="nodeClick"
            @refreshData="refreshData"
            @expandedNodes="expandedNodes"
            @reCategory="getTreeList"
          />
        </div>
      </div>
      <div
        class="right-box inner-container"
        :style="{ transition: transition + 's' }"
      >
        <div
          id="resize"
          class="resize pack-up-box"
          @mousedown="mousedown"
          @mouseup="mouseup"
          @mousemove="mousemove"
        >
          <a
            v-if="isPackUpTree"
            @click="packUpTree"
            @mousedown="resize = null"
            @mouseup="resize = null"
            @mousemove="resize = null"
          >
            <i
              :class="
                isPackUpTree === false
                  ? 'el-icon-caret-left'
                  : 'el-icon-caret-right'
              "
            />
          </a>
          <a
            v-else
            class="visible-pack-up"
          >
            <span>||</span>
          </a>
        </div>
        <el-form
          ref="queryForm"
          :model="queryForm"
          class="filter-container bs-el-form"
          @submit.native.prevent
        >
          <el-form-item
            class="filter-item"
            prop="name"
          >
            <el-input
              v-model="queryForm.name"
              class="bs-el-input"
              placeholder="请输入数据集名称"
              clearable
              @keyup.enter.native="handleSearch()"
              @clear="handleSearch()"
            />
          </el-form-item>
          <!-- <el-form-item
            class="filter-item"
            prop="labelIds"
          >
            <el-select
              v-model="labelIds"
              class="bs-el-select"
              popper-class="bs-el-select"
              clearable
              filterable
              multiple
              collapse-tags
              placeholder="请选择数据集关联标签"
              @clear="handleSearch()"
            >
              <el-option
                v-for="labelItem in labelList"
                :key="labelItem.id"
                :label="labelItem.labelName"
                :value="labelItem.id"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item class="filter-item">
            <el-button
              :loading="dataListLoading"
              type="primary"
              icon="el-icon-search"
              @click="handleSearch()"
            >
              查询
            </el-button>
          </el-form-item>
          <el-form-item class="filter-item">
            <el-button
              v-if="toAdd"
              class="bs-el-button-default"
              @click="addDataset"
            >
              新增
            </el-button>
          </el-form-item>
        </el-form>
        <div class="dataroom-table-box">
          <el-table
            v-if="isDialog"
            ref="userTable"
            v-loading="dataListLoading"
            class="dataroom-el-table bs-scrollbar"
            :element-loading-text="loadingText"
            :data="tableData"
            :header-cell-style="sortStyle"
            @sort-change="reSort"
            @current-change="handleCurrentChange"
            @select="selectDs"
            @select-all="selectAll"
          >
            <el-empty slot="empty" />
            <el-table-column
              v-if="isDialog && multiple"
              type="selection"
              width="55"
            />
            <el-table-column
              prop="name"
              label="数据集名称"
              align="left"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-radio
                  v-if="isDialog && !multiple"
                  v-model="curRow"
                  :label="scope.row"
                >
                  {{ scope.row.name }}
                </el-radio>
                <span v-else>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="datasetType"
              label="数据集类型"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{
                  datasetTypeList.find(
                    (type) => type.datasetType === scope.row.datasetType
                  )
                    ? datasetTypeList.find(
                      (type) => type.datasetType === scope.row.datasetType
                    ).name
                    : "其他"
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="labelIds"
              label="标签"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ getLabels(scope.row.labelIds).join(",") }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="remark"
              label="备注"
              align="left"
              show-overflow-tooltip
            />
            <!--操作栏-->
            <el-table-column
              v-if="doEdit || isDelete"
              label="操作"
              width="200"
              align="center"
            >
              <template
                v-if="showOperate(scope.row.datasetType)"
                slot-scope="scope"
              >
                <el-button
                  v-if="doEdit"
                  class="bs-el-button-default"
                  :disabled="scope.row.editable === 1 && !appCode"
                  @click="
                    toEdit(
                      scope.row.id,
                      scope.row.datasetType,
                      scope.row.name,
                      scope.row.typeId
                    )
                  "
                >
                  编辑
                </el-button>
                <el-button
                  v-if="isDelete"
                  class="bs-el-button-default"
                  :loading="scope.row.loading"
                  :disabled="scope.row.editable === 1 && !appCode"
                  @click="delDataset(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-table
            v-else
            ref="userTable"
            v-resize-table-height
            v-loading="dataListLoading"
            height="0"
            class="dataroom-el-table bs-scrollbar"
            :element-loading-text="loadingText"
            :data="tableData"
            :header-cell-style="sortStyle"
            @sort-change="reSort"
            @current-change="handleCurrentChange"
            @select="selectDs"
            @select-all="selectAll"
          >
            <el-empty slot="empty" />
            <el-table-column
              v-if="isDialog && multiple"
              type="selection"
              width="55"
            />
            <el-table-column
              prop="name"
              label="数据集名称"
              align="left"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-radio
                  v-if="isDialog && !multiple"
                  v-model="curRow"
                  :label="scope.row"
                >
                  {{ scope.row.name }}
                </el-radio>
                <span v-else>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="datasetType"
              label="数据集类型"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{
                  datasetTypeList.find(
                    (type) => type.datasetType === scope.row.datasetType
                  )
                    ? datasetTypeList.find(
                      (type) => type.datasetType === scope.row.datasetType
                    ).name
                    : "其他"
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="labelIds"
              label="标签"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ getLabels(scope.row.labelIds).join(",") }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="remark"
              label="备注"
              align="left"
              show-overflow-tooltip
            />
            <!--操作栏-->
            <el-table-column
              v-if="doEdit || isDelete"
              label="操作"
              width="200"
              align="center"
            >
              <template
                v-if="showOperate(scope.row.datasetType)"
                slot-scope="scope"
              >
                <el-button
                  v-if="doEdit"
                  class="bs-el-button-default"
                  :disabled="(scope.row.editable === 1 && !appCode)"
                  @click="
                    toEdit(
                      scope.row.id,
                      scope.row.datasetType,
                      scope.row.name,
                      scope.row.typeId
                    )
                  "
                >
                  编辑
                </el-button>
                <el-button
                  v-if="isDelete"
                  class="bs-el-button-default"
                  :loading="scope.row.loading"
                  :disabled="scope.row.editable === 1 && !appCode"
                  @click="delDataset(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="bs-pagination">
          <el-pagination
            class="bs-el-pagination"
            popper-class="bs-el-pagination"
            :current-page="current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="size"
            :total="totalCount"
            background
            prev-text="上一页"
            next-text="下一页"
            layout="total, prev, pager, next, sizes"
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
        </div>
      </div>
    </el-row>
    <!-- 新增-类型窗口 -->
    <DatasetTypeDialog
      ref="DatasetTypeDialog"
      :dataset-type-list="datasetTypeList"
      @openAddForm="openAddForm"
    />
    <check-datasource
      ref="checkDatasource"
      :reason-list="reasonList"
    />
    <component
      :is="componentData.component"
      v-if="datasetType && componentData.component"
      ref="EditForm"
      :key="componentData.key"
      :config="componentData.config"
      :dataset-id="datasetId"
      :dataset-name="datasetName"
      :type-id="typeId"
      :is-edit="isEdit"
      :app-code="appCode"
      @back="back"
    >
      <template #output-field-table-column>
        <slot name="output-field-table-column" />
      </template>
    </component>
  </div>
</template>

<script>
import TypeTree from '@gcpaas/data-room-ui/packages/dataSet/components/TypeTree.vue'
import JsonEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/JsonEditForm.vue'
import resizeTableHeight from '@gcpaas/data-room-ui/packages/assets/js/utils/resizeHeightDirevtive.js'
import ScriptEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/ScriptEditForm.vue'
import CheckDatasource from '@gcpaas/data-room-ui/packages/datasource/components/CheckDatasource.vue'
import CustomEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/CustomEditForm.vue'
import { pageMixin } from '@gcpaas/data-room-ui/packages/assets/js/mixins/page.js'
import OriginalEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/OriginalEditForm.vue'
import HttpEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/HttpEditForm.vue'
import DatasetTypeDialog from '@gcpaas/data-room-ui/packages/dataSet/components/DatasetTypeDialog.vue'
import StoredProcedureEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/StoredProcedureEditForm.vue'
import {
  datasetPage,
  datasetRemove,
  datasetCheck
} from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'
import { getLabelList } from '@gcpaas/data-room-ui/packages/assets/js/api/LabelConfigService'
export default {
  name: 'DataSetManagement',
  directives: {
    resizeTableHeight // 注册自定义指令
  },
  components: {
    TypeTree,
    DatasetTypeDialog,
    OriginalEditForm,
    CustomEditForm,
    JsonEditForm,
    StoredProcedureEditForm,
    ScriptEditForm,
    CheckDatasource,
    HttpEditForm
  },
  mixins: [pageMixin],
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    isDialog: {
      type: Boolean,
      default: false
    },
    dsValue: {
      type: [Array, Object],
      default: null
    },
    appCode: {
      type: String,
      default: ''
    },
    isBorder: {
      type: Boolean,
      default: false
    },
    toAdd: {
      type: Boolean,
      default: true
    },
    doEdit: {
      type: Boolean,
      default: true
    },
    isDelete: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      reasonList: [],
      datasetType: null,
      isEdit: false,
      categoryData: [],
      tableData: [], // 表格数据
      // labelIds: [],
      queryForm: {
        name: '',
        datasetType: '',
        typeId: '', // 分类id
        labelIds: []
      }, // 查询条件
      // 数据集类型
      datasetTypeList: [],
      labelList: [],
      isPackUpTree: false,
      transition: 0.1,
      loadingText: '正在加载数据',
      dataListLoading: false,
      leftBox: null,
      rightBox: null,
      startX: null,
      event: null,
      endX: null,
      resize: null,
      datasetId: '', // 数据集Id，用于详情与编辑
      datasetName: '', // 数据集名称
      typeId: '', // 详情typeId
      curRow: null,
      multipleSelection: [],
      // 远程组件
      componentData: {
        component: null,
        config: null,
        key: new Date().getTime()
      }
    }
  },
  computed: {
    allType () {
      return this.datasetTypeList
        .map((item) => item.datasetType)
        .filter((item) => item !== '')
    }
  },
  watch: {
    datasetType (value) {
      if (value === null) {
        this.datasetId = ''
        this.datasetName = ''
        this.isEdit = false
      }
    }
  },
  mounted () {
    this.init()
    if (
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent)
    ) {
      // 当前浏览器为Safari浏览器
      // 执行相关操作
      document.addEventListener('mousemove', function (event) {
        if (event.buttons === 1) {
          event.preventDefault()
        }
      })
    }
  },
  methods: {
    getLabels (list) {
      const arr = []
      list?.forEach((item) => {
        arr.push(this.labelList.filter((x) => x.id === item)[0]?.labelName)
      })
      return arr
    },
    toggleRowSelection () {
      this.$nextTick(() => {
        const dsIds = this.multipleSelection.map((ds) => ds.id)
        this.$refs.userTable.clearSelection()
        this.tableData.forEach((item) => {
          if (dsIds.includes(item.id)) {
            this.$refs.userTable.toggleRowSelection(item, true)
          }
        })
      })
    },
    // 全选
    selectAll (selection) {
      if (this.isDialog && this.multiple) {
        if (selection.length) {
          const dsIds = this.multipleSelection.map((ds) => ds.id)
          selection.forEach((ds) => {
            if (!dsIds.includes(ds.id)) {
              this.multipleSelection.push(ds)
            }
          })
        } else {
          this.tableData.forEach((row) => {
            const dsIds = this.multipleSelection.map((ds) => ds.id)
            const i = dsIds.indexOf(row.id)
            if (i > -1) this.multipleSelection.splice(i, 1)
          })
        }
      }
    },
    // 手动勾选
    selectDs (selection, row) {
      if (this.isDialog && this.multiple) {
        let dsIndex = null
        const ds = this.multipleSelection.find((ds, index) => {
          if (ds.id === row.id) {
            dsIndex = index
            return ds
          }
        })
        if (!ds) {
          this.multipleSelection.push(row)
        } else {
          this.multipleSelection.splice(dsIndex, 1)
        }
      }
    },
    // 获取选中数据集信息
    getSelectDs () {
      if (!this.isDialog) return
      if (this.multiple) {
        // 多选返回
        return this.multipleSelection
      } else {
        // 单选返回
        return this.curRow ? this.curRow : null
      }
    },
    // 单选数据集
    handleCurrentChange (currentRow) {
      this.curRow = currentRow
    },
    // 删除数据集
    delDataset (row) {
      row.loading = true
      datasetCheck(row.id).then((res) => {
        row.loading = false
        if (res.canDelete) {
          this.$confirm('确定删除当前数据集吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'bs-el-message-box'
          })
            .then(() => {
              datasetRemove(row.id).then((res) => {
                this.init(false)
                this.$message.success('删除成功')
              })
            })
            .catch(() => {})
        } else {
          this.reasonList = res.reasons
          this.$refs.checkDatasource.checkDatasourceVisible = true
        }
      })
    },
    // 详情
    toPreview (id, type, name, typeId) {
      this.datasetId = id
      this.datasetType = type
      this.datasetName = name
      this.typeId = typeId
      this.isEdit = false
    },
    toEdit (id, type, name, typeId) {
      if (window.SITE_CONFIG.dataRoom.datasetBtn.disabled) {
        this.$message.error(window.SITE_CONFIG.dataRoom.datasetBtn.message)
        return
      }
      this.datasetId = id
      this.datasetType = type
      this.componentData =
        this.getComponents(
          this.datasetTypeList.find((item) => item?.datasetType === type)
            ?.componentName
        ) ?? ''
      this.datasetName = name
      this.typeId = typeId
      this.isEdit = true
    },
    // 回到管理端
    back () {
      this.datasetType = null
      this.isEdit = false
    },
    // 新增数据集-类型
    openAddForm (type, componentName) {
      this.datasetType = type
      this.typeId = this.queryForm.typeId
      this.isEdit = true
      this.componentData = this.getComponents(componentName)
    },
    showOperate (datasetType) {
      return (
        this.getComponents(
          this.datasetTypeList.find((type) => type.datasetType === datasetType)
            ?.componentName
        )?.config?.showOperate ?? true
      )
    },
    getComponents (componentName) {
      const components = Object.values(this.$options.components)
      let remoteComponentData = null
      if (
        window.SITE_CONFIG.dataRoom?.customDatasetComponents &&
        window.SITE_CONFIG.dataRoom?.customDatasetComponents.length > 0
      ) {
        // 获取远程组件
        remoteComponentData = window.SITE_CONFIG.dataRoom?.customDatasetComponents.find(
          (item) => item.config.componentName === componentName
        )
      }
      return {
        component:
          components.find((component) => component.name === componentName) ||
          remoteComponentData?.vueFile,
        config: remoteComponentData?.config || null,
        key: new Date().getTime()
      }
    },
    // 初始化
    init (temp = true) {
      if (temp) {
        this.getTreeList()
      }
      if (this.isDialog) {
        if (this.multiple) {
          this.multipleSelection = this.dsValue ? this.dsValue : []
        } else {
          this.curRow = this.dsValue
        }
      }
      this.current = 1
      const list = [
        { name: '全部', datasetType: '' },
        {
          name: '原始数据集',
          datasetType: 'original',
          componentName: 'OriginalEditForm',
          description: '直接查询某个数据库表'
        },
        {
          name: '自助数据集',
          datasetType: 'custom',
          componentName: 'CustomEditForm',
          description: '自定义SQL语句查询'
        },
        {
          name: '存储过程数据集',
          datasetType: 'storedProcedure',
          componentName: 'StoredProcedureEditForm',
          description: '调用数据库存储过程查询'
        },
        {
          name: 'JSON数据集',
          datasetType: 'json',
          componentName: 'JsonEditForm',
          description: '直接定义静态数据'
        },
        {
          name: 'HTTP数据集',
          datasetType: 'http',
          componentName: 'HttpEditForm',
          description: '接入第三方HTTP服务查询'
        },
        {
          name: '脚本数据集',
          datasetType: 'script',
          componentName: 'ScriptEditForm',
          description: '支持ES、Mongodb、国产化数据库、自定义Java代码查询'
        }
      ]
      if (
        window.SITE_CONFIG.dataRoom?.datasetTypeList &&
        window.SITE_CONFIG.dataRoom?.datasetTypeList?.length !== 0
      ) {
        this.datasetTypeList = [
          { name: '全部', datasetType: '' },
          ...list.filter(
            (item) =>
              window.SITE_CONFIG.dataRoom?.datasetTypeList.findIndex(
                (x) => x === item.datasetType
              ) !== -1
          )
        ]
      } else {
        this.datasetTypeList = [...list]
      }
      if (
        window.SITE_CONFIG.dataRoom?.customDatasetComponents &&
        window.SITE_CONFIG.dataRoom?.customDatasetComponents.length > 0
      ) {
        // 将获得到的远程数据集进行组装
        window.SITE_CONFIG.dataRoom?.customDatasetComponents.forEach((item) => {
          this.datasetTypeList.push({
            name: item.config.name,
            datasetType: item.config.datasetType,
            componentName: item.config.componentName
          })
        })
      }
      this.getDataList()
      // getLabelList().then(res => {
      //   this.labelList = res
      // })
    },
    // 新增数据集
    addDataset () {
      if (window.SITE_CONFIG.dataRoom.datasetBtn.disabled) {
        this.$message.error(window.SITE_CONFIG.dataRoom.datasetBtn.message)
        return
      }
      this.$refs.DatasetTypeDialog.dialogVisible = true
    },
    selectChange () {
      this.getDataList()
    },
    getTreeList () {},
    // 获取表格数据
    getDataList () {
      getLabelList().then((res) => {
        this.labelList = res
        // this.labelList.unshift({ id: '', labelName: '全部' })
      })
      this.dataListLoading = true
      datasetPage({
        current: this.current,
        size: this.size,
        ...this.queryForm,
        datasetType:
          this.queryForm.datasetType === ''
            ? [...this.allType]
            : [this.queryForm.datasetType]
      })
        .then((data) => {
          this.tableData = data.list
          this.tableData.forEach((r) => {
            this.$set(r, 'loading', false)
          })
          if (this.isDialog) {
            if (this.multiple && this.multipleSelection.length) {
              this.toggleRowSelection()
            } else if (this.curRow.id) {
              const ds = this.tableData.find(
                (item) => item.id === this.curRow.id
              )
              if (ds) this.curRow = ds
            }
          }
          this.totalCount = data.totalCount
          this.dataListLoading = false
        })
        .catch(() => {
          this.dataListLoading = false
        })
    },
    expandedNodes (data) {
      if (data && data > 50) {
        this.transition = 0
      } else {
        this.transition = 0.1
      }
    },
    nodeClick (row, type) {
      this.current = 1
      const { id } = row
      if (type === 'group') {
        Object.assign(this.queryForm, { typeId: id, datasetType: '', labelIds: [] })
      } else if (type === 'type') {
        Object.assign(this.queryForm, { typeId: '', datasetType: row, labelIds: [] })
      } else if (type === 'tag') {
        Object.assign(this.queryForm, { typeId: '', datasetType: '', labelIds: row })
      }
      this.getDataList()
    },
    refreshData (node) {
      if (node && node.id === this.queryForm.typeId) {
        this.queryForm.typeId = ''
      }
      this.getDataList()
    },
    handleSearch () {
      this.current = 1
      this.queryForm.typeId = ''
      // 清除左侧机构树的选中状态
      // this.$refs.datasetsTypeTree.dataroom-dataset-type-treeObj.cancelSelectedNode()
      this.getDataList()
    },
    // 拖拽修改div宽度
    mousedown (e) {
      this.resize = document.getElementsByClassName('resize')[0]
      this.resize.left = document
        .getElementById('left-box')
        .getBoundingClientRect().width
      this.leftBox = document.getElementsByClassName('left-box')[0]
      this.rightBox = document.getElementsByClassName('right-box')[0]
      this.startX = e.clientX
    },
    mousemove (e) {
      this.event = e
      if (this.resize) {
        const boxWidth = document
          .getElementById('box')
          .getBoundingClientRect().width
        this.endX = e.clientX
        const offset =
          document.getElementById('box').getBoundingClientRect().left > 300
            ? 0
            : 25
        const moveLen = this.resize.left + (this.endX - this.startX) + offset
        this.leftBox.style.width = (moveLen / boxWidth) * 100 + '%'
        this.rightBox.style.width = (1 - moveLen / boxWidth) * 100 + '%'
        this.isPackUpTree = false
        if (moveLen < 100 && this.endX - this.startX < 0) {
          this.isPackUpTree = true
          this.leftBox.style.width = '0%'
          this.rightBox.style.width = '100%'
        } else if (moveLen / boxWidth > 0.5) {
          this.leftBox.style.width = '50%'
          this.rightBox.style.width = '50%'
        }
      }
    },
    packUpTree () {
      this.$refs.datasetsTypeTree.expandedNodes()
      this.isPackUpTree = !this.isPackUpTree
      if (!this.isPackUpTree) {
        this.leftBox.style.width = '25%'
        this.rightBox.style.width = '75%'
      } else {
        this.leftBox.style.width = '0%'
        this.rightBox.style.width = '100%'
      }
    },
    mouseup () {
      if (this.resize) {
        this.resize = null
        if (this.endX < 350 && this.endX - this.startX > 0) {
          this.isPackUpTree = false
          this.leftBox.style.width = '25%'
          this.rightBox.style.width = '75%'
        }
      }
    },
    mousemoveOnBox (e) {
      this.mousemove(e)
    },
    mouseupOnBox () {
      this.resize = null
      if (this.endX < 350 && this.endX - this.startX > 0) {
        this.isPackUpTree = false
        this.leftBox.style.width = '25%'
        this.rightBox.style.width = '75%'
      }
      this.resize = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./assets/css/index.scss";
@import "../assets/style/common.scss";
@import "./assets/css/treePackUp.scss";

::v-deep .big-screen-router-view-wrap {
  padding-left: 16px !important;
}
.bs-pagination {
  margin-top: 4px;
  padding-right: 16px;
  // padding: 0 !important;
  // right: 16px !important;
  // bottom: 16px !important;
  // position: absolute !important;
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}

.bs-container .inner-container .el-form .filter-item {
  ::v-deep .el-input__inner {
    width: 200px;
  }
}

::v-deep .left-tab-box {
  span {
    color: var(--bs-el-text);
  }
}

::v-deep .left-tab-box ul li.tab-active {
  background-color: rgba(64, 158, 255, 0.1);
}

::v-deep .left-tab-box ul li:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.el-dialog {
  .bs-container {
    // max-height: calc(90vh - 236px) !important;

    .el-table {
      height: 41vh;
      overflow: auto;
    }

    ::v-deep .dataroom-dataset-type-tree {
      max-height: calc(90vh - 325px) !important;
    }

    ::v-deep .el-tabs__item.is-active {
      border-bottom: none !important;
    }
  }
}

::v-deep .dataroom-dataset-type-treeNodeMenu {
  ul {
    background-color: var(--bs-background-1);
  }

  li:hover {
    background-color: var(--bs-el-background-3);

    span {
      color: var(--bs-el-color-primary);
    }
  }

  span {
    color: var(--bs-el-text);
  }

  .triangle {
    background-color: var(--bs-background-1) !important;
  }
}

.layout {
  width: 100%;
  height: 100%;
}

// ::v-deep .el-table__body-wrapper {
//   max-height: unset !important;
// }
</style>
