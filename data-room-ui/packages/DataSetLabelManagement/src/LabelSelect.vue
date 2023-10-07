<template>
  <div>
    <el-tag
      v-for="label in selectLabelListInitial"
      :key="label.id"
      :closable="isEdit"
      :disable-transitions="false"
      style="margin-right: 2px;margin-left: 2px;background-color: #2f3440;border-color: #313640;"
      @close="handleCloseTag(label)"
    >
      {{ label.labelName }}
    </el-tag>
    <el-tooltip
      class="item"
      content="添加关联标签"
      effect="dark"
      placement="bottom"
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
    <el-button
      type="text"
      @click="manageLabel"
    >
      管理
    </el-button>
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
              @clear="getDataList"
            />
          </el-form-item>
          <el-form-item
            class="filter-item"
            prop="labelType"
          >
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
                key="all"
                label="全部"
                value=""
              />
              <el-option
                v-for="(type, index) in labelTypeList"
                :key="index"
                :label="type"
                :value="type"
              >
                <span>
                  {{ type }}
                </span>
                <span style="float: right;padding-right: 20px">
                  <el-button
                    v-show="isManage"
                    icon="el-icon-edit"
                    type="text"
                    @click.stop="editLabelType(type)"
                  />
                  <el-button
                    v-if="isManage"
                    icon="el-icon-delete"
                    type="text"
                    @click.stop="deleteLabelType(type)"
                  />
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="current=1;getDataList()"
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
          height="calc(100vh - 450px)"
          @select="labelCheckChange"
          @select-all="selectAll"
        >
          <el-empty slot="empty" />
          <el-table-column
            v-if="!isManage"
            key="selection"
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
            v-if="isManage"
            key="opt"
            align="center"
            label="操作"
            width="200"
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
      </div>

      <span
        slot="footer"
        class="dialog-footer"
      >
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
      </span>
    </el-dialog>
    <label-edit
      v-if="editFormVisible"
      ref="labelEdit"
      @afterEdit="afterEdit"
    />
    <label-type-edit
      v-if="labelTypeEditVisible"
      ref="labelTypeEdit"
      @afterEdit="afterEdit(true)"
    />
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import LabelEdit from './LabelConfigEdit'
import LabelTypeEdit from './LabelTypeEdit.vue'
import { pageMixins } from 'data-room-ui/js/mixins/page'
import { getLabelType, labelList, getLabelListByDatasetId, removeLabel, removeLabelByType } from 'data-room-ui/js/utils/LabelConfigService'

export default {
  name: 'LabelSelect',
  components: {
    LabelEdit,
    LabelTypeEdit
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
      // 标签类型编辑弹窗可见性
      labelTypeEditVisible: false,
      searchForm: {
        labelName: '',
        labelType: ''
      },
      sizeLabel: 10,
      labelTypeList: [],
      labelCheckLoading: false
    }
  },
  mounted () {
    // 根据数据集id获取关联的标签列表
    if (this.datasetId) {
      getLabelListByDatasetId(this.datasetId).then((data) => {
        this.selectLabelListInitial = cloneDeep(data)
        this.selectLabelList = cloneDeep(data)
        const idList = []
        data.forEach((item) => {
          idList.push(item.id)
        })
        this.$emit('commit', idList)
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
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        removeLabel(id).then(() => {
          this.getDataList()
          this.$message.success('删除成功')
          // 如果selectLabelList中包含id相同的项，则从selectLabelList中移除
          if (this.selectLabelList.some(item => item.id === id)) {
            this.selectLabelList = this.selectLabelList.filter(item => item.id !== id)
          }
          this.selectLabelListInitial = cloneDeep(this.selectLabelList)
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
      this.idListCopy = []
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
      this.selectLabelList.forEach(item => {
        this.idListCopy.push(item.id)
      })
      this.$emit('commit', this.idListCopy)
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
    manageLabel () {
      this.init(true)
    },
    /**
     * 选中标签类型
     */
    selectLabelType () {
      this.getDataList()
    },
    /**
     * 标签类型编辑
     */
    editLabelType (type) {
      this.labelTypeEditVisible = true
      this.$nextTick(() => {
        this.$refs.labelTypeEdit.dialogFormVisible = true
        this.$refs.labelTypeEdit.init(type)
      })
    },
    /**
     * 标签类型删除
     */
    deleteLabelType (type) {
      this.$confirm('是否删除当前标签类型? ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        removeLabelByType({ labelType: type }).then(() => {
          this.$nextTick(() => {
            this.getDataList()
            this.getLabelType()
            this.$message.success('删除成功')
          })
        })
      })
    },
    /**
     * 弹窗关闭
     */
    handleClose () {
      this.selectLabelList = cloneDeep(this.selectLabelListInitial)
      this.dialogFormVisible = false
    },
    /**
     * 确认按钮
     */
    commitLabel () {
      this.labelCheckLoading = false
      this.dialogFormVisible = false
      this.selectLabelListInitial = cloneDeep(this.selectLabelList)
      this.$emit('commit', this.idListCopy)
    },
    /**
     * 标签编辑/新增、标签类型编辑 后回调
     */
    afterEdit (cleanType) {
      if (cleanType) {
        this.searchForm.labelType = ''
      }
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
