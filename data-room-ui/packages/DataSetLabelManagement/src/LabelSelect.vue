<template>
  <div>
    <el-tag
      v-for="label in selectLabelListInitial"
      :key="label.id"
      :closable="isEdit"
      :disable-transitions="false"
      @close="handleCloseTag(label)"
    >
      {{ label.labelName }}
    </el-tag>
    <el-tooltip
      class="item"
      content="添加关联标签"
      effect="dark"
      placement="right"
    >
      <el-button
        circle
        class="bs-el-button-default"
        icon="el-icon-plus"
        style="margin-left: 10px"
        @click="addLabelRelation"
      />
    </el-tooltip>
    <!--  配置按钮  -->
    <el-button type="text" @click="manageLabel">管理</el-button>
    <!-- 标签列表弹窗 -->
    <el-dialog
      class="bs-dialog-wrap bs-el-dialog"
      :append-to-body="true"
      :before-close="handleClose"
      :visible.sync="dialogFormVisible"
      :title="isManage ? '标签管理' : '选择标签'"
      width="1000px"
    >
      <div>
        <el-form
          :inline="true"
          class="bs-el-form filter-container"
        >
          <el-form-item label="">
            <el-input
              v-model="searchForm.labelName"
              clearable
              class="bs-el-input"
              placeholder="请输入标签名称"
            />
          </el-form-item>

          <el-form-item label="">
            <el-select
              v-model="searchForm.labelType"
              class="bs-el-select"
              popper-class="bs-el-select"
              clearable
              filterable
              placeholder="请选择标签类型"
              @change="selectLabelType"
            >
              <el-option
                label="全部"
                value=""
              />
              <el-option
                v-for="(item, index) in labelTypeList"
                :key="index"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="getDataList"
            >
              查询
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              v-show="isManage"
              type="primary"
              class="bs-el-button-default"
              @click="insertLabel"
            >
              新增
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
          ref="labelTable"
          v-loading="labelCheckLoading"
          class="bs-el-table bs-scrollbar"
          element-loading-text="正在加载中..."
          :data="labelList"
          row-key="id"
          @select="labelCheckChange"
          @select-all="selectAll"
        >
          <el-empty slot="empty" />
          <el-table-column
            key="selection"
            v-if="!isManage"
            type="selection"
            width="55"
          />
          <el-table-column
            key="labelName"
            label="标签名称"
            prop="labelName"
            show-overflow-tooltip
          />
          <el-table-column
            key="labelType"
            label="标签类型"
            prop="labelType"
            show-overflow-tooltip
          />
          <el-table-column
            key="labelDesc"
            label="标签说明"
            prop="labelDesc"
            show-overflow-tooltip
          />
          <el-table-column
            key="opt"
            align="center"
            label="操作"
            width="200"
            v-if="isManage"
          >
            <template slot-scope="scope">
              <el-button
                class="bs-el-button-default"
                @click="editLabel(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                class="bs-el-button-default"
                @click="deleteLabel(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="bs-pagination">
          <el-pagination
            class="bs-el-pagination"
            popper-class="bs-el-pagination"
            :current-page="current"
            :page-size="sizeLabel"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            background
            layout="total, prev, pager, next,sizes,jumper"
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
        </div>

        <div class="el-dialog__footer">
          <el-button
            v-show="!isManage"
            class="bs-el-button-default"
            @click="handleClose"
          >
            取消
          </el-button>
          <el-button
            v-show="!isManage"
            type="primary"
            @click="commitLabel"
          >
            确定
          </el-button>
          <el-button
            v-show="isManage"
            class="bs-el-button-default"
            @click="handleClose"
          >
            返回
          </el-button>
        </div>
        <label-edit
          v-if="editFormVisible"
          @afterEdit="afterEdit"
          ref="labelEdit"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import LabelEdit from './LabelConfigEdit'
import { pageMixins } from 'packages/js/mixins/page'
import {getLabelType, labelList, getLabelListByDatasetId, removeLabel} from 'packages/js/utils/LabelConfigService'

export default {
  name: 'LabelSelect',
  components: {
    LabelEdit
  },
  mixins: [pageMixins],
  props: {
    // 选中的标签id列表
    idList: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    datasetId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      isManage: false,
      idListCopy: this.idList,
      // 选中的标签列表
      selectLabelList: [],
      // 初始选中的标签列表
      selectLabelListInitial: [],
      labelList: [],
      dialogFormVisible: false,
      // 编辑弹窗可见性
      editFormVisible: false,
      searchForm: {
        labelName: '',
        labelType: ''
      },
      sizeLabel: 20,
      labelTypeList: [],
      labelCheckLoading: false
    }
  },
  mounted () {
    // 根据数据集id获取关联的标签列表
    if (this.datasetId) {
      getLabelListByDatasetId(this.datasetId).then((data) => {
        this.selectLabelListInitial = _.cloneDeep(data)
        this.selectLabelList = _.cloneDeep(data)
      })
    }
  },
  watch: {
    // labelList变化时，根据selectLabelList中项的id，设置选中状态
    labelList: {
      handler (val) {
        val.forEach((label) => {
          this.selectLabelList.forEach((selected) => {
            if (label.id === selected.id) {
              // 设置选中状态
              this.$nextTick(() => {
                this.$refs.labelTable.toggleRowSelection(label)
              })
            }
          })
        })
      },
      deep: true
    },
    // 根据selectLabelList的变化，将id赋值给idList
    selectLabelList: {
      handler (val) {
        this.idListCopy = []
        val.forEach((item) => {
          this.idListCopy.push(item.id)
        })
      },
      deep: true
    }
  },
  methods: {
    /**
     * 初始化方法
     */
    init (manage) {
      this.isManage = manage
      this.$nextTick(() => {
        this.dialogFormVisible = true
        this.getDataList()
        this.getLabelType()
      })
    },
    /**
     * 获取标签类型列表
     */
    getLabelType () {
      getLabelType().then((data) => {
        this.labelTypeList = data
      })
    },
    /**
     * 获取标签列表
     */
    getDataList () {
      this.labelCheckLoading = true
      const params = {
        current: this.current,
        size: this.sizeLabel,
        labelName: this.searchForm.labelName,
        labelType: this.searchForm.labelType
      }
      labelList(params).then((data) => {
        this.totalCount = data.totalCount
        this.labelList = data.list
        this.labelCheckLoading = false
      }).catch(() => {
        this.labelCheckLoading = false
      })
    },
    /**
     * 当前页全选
     * @param {*} labelList
     */
    selectAll (labelList) {
      // 如果selectLabelList中包含id相同的项，则忽略，否则，将该项添加到selectLabelList中
      labelList.forEach((label) => {
        if (!this.selectLabelList.some(selected => selected.id === label.id)) {
          this.selectLabelList.push(label)
        }
      })
    },
    /**
     * 新增标签
     */
    insertLabel () {
      this.editFormVisible = true
      this.$nextTick(() => {
        this.$refs.labelEdit.labelTypeList = this.labelTypeList
        this.$refs.labelEdit.init()
      })
    },
    editLabel (row) {
      this.editFormVisible = true
      this.$nextTick(() => {
        this.$refs.labelEdit.labelTypeList = this.labelTypeList
        this.$refs.labelEdit.init(row)
      })
    },
    deleteLabel (id) {
      this.$confirm('确定删除当前标签吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLabel(id).then(() => {
          this.getDataList()
          this.$message.success('删除成功')
          // 如果selectLabelList中包含id相同的项，则从selectLabelList中移除
          if (this.selectLabelList.some(item => item.id === id)) {
            this.selectLabelList = this.selectLabelList.filter(item => item.id !== id)
          }
          this.selectLabelListInitial = _.cloneDeep(this.selectLabelList)
        })
      }).catch(() => {
      })
    },
    /**
     * 标签选项组选中事件
     */
    labelCheckChange (selection, label) {
      // 如果selectLabelList中包含id相同的项，则从selectLabelList中移除
      if (this.selectLabelList.some(item => item.id === label.id)) {
        this.selectLabelList = this.selectLabelList.filter(item => item.id !== label.id)
      } else {
        // 否则，将该项添加到selectLabelList中
        this.selectLabelList.push(label)
      }
    },
    /**
     * 移除选中的标签
     */
    handleCloseTag (label) {
      this.selectLabelListInitial.forEach((item, index) => {
        if (item.id === label.id) {
          this.selectLabelListInitial.splice(index, 1)
        }
      })
      this.selectLabelList.forEach((item, index) => {
        if (item.id === label.id) {
          this.selectLabelList.splice(index, 1)
        }
      })
    },
    /**
     * 点击添加标签关联按钮
     */
    addLabelRelation () {
      // 初始化
      this.init(false)
    },
    /**
     * 标签管理按钮
     */
    manageLabel() {
      this.init(true)
    },
    /**
     * 选中标签类型
     */
    selectLabelType () {
      this.getDataList()
    },
    /**
     * 弹窗关闭
     */
    handleClose () {
      this.selectLabelList = _.cloneDeep(this.selectLabelListInitial)
      this.dialogFormVisible = false
    },
    /**
     * 确认按钮
     */
    commitLabel () {
      this.labelCheckLoading = false
      this.dialogFormVisible = false
      this.selectLabelListInitial = _.cloneDeep(this.selectLabelList)
      this.$emit('commit', this.idListCopy)
    },
    /**
     * 标签编辑/新增后回调
     */
    afterEdit () {
      this.getDataList()
      this.getLabelType()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
.bs-pagination {
  ::v-deep .el-input__inner {
    border: none;
    background: var(--bs-el-background-1);
  }
}
</style>
