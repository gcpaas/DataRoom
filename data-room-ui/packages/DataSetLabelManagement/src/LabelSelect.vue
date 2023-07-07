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
        icon="el-icon-plus"
        style="margin-left: 10px"
        @click="addLabel"
      />
    </el-tooltip>
    <!-- 标签列表弹窗 -->
    <el-dialog
      :append-to-body="true"
      :before-close="handleClose"
      :visible.sync="dialogFormVisible"
      title="选择标签"
      width="1000px"
    >
      <div v-loading="labelCheckLoading">
        <el-form
          :inline="true"
          class="filter-container"
        >
          <el-form-item label="标签名称">
            <el-input
              v-model="searchForm.labelName"
              clearable
              placeholder="请输入标签名称"
            />
          </el-form-item>

          <el-form-item label="标签类型">
            <el-select
              v-model="searchForm.labelType"
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
        </el-form>
        <!--  标签选项组   -->
        <el-checkbox-group
          v-model="checkLabelList"
          style="padding-bottom: 10px"
        >
          <el-row :gutter="2">
            <el-col
              v-for="label in labelList"
              :key="label.id"
              :span="4"
              style="padding-top: 10px"
            >
              <el-tooltip
                v-if="label.labelDesc || getByteLength(label.labelName) > 18"
                effect="light"
                placement="top-start"
              >
                <div slot="content">
                  <div v-if="getByteLength(label.labelName) > 18">
                    名称: {{ label.labelName }}
                  </div>
                  <div v-if="label.labelDesc">
                    描述: {{ label.labelDesc }}
                  </div>
                </div>
                <el-checkbox
                  :label="label.id"
                  @change="labelCheckChange(label)"
                >
                  {{ getByteLength(label.labelName) > 18 ? ellipsis(label.labelName, 18) : label.labelName }}
                </el-checkbox>
              </el-tooltip>
              <el-checkbox
                v-else
                :label="label.id"
                @change="labelCheckChange(label)"
              >{{label.labelName}}</el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>

        <div class="page-container">
          <el-pagination
            :current-page="current"
            :page-size="sizeLabel"
            :page-sizes="[20, 40, 60, 80]"
            :total="totalCount"
            background
            layout="total, prev, pager, next,sizes,jumper"
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
        </div>

        <div align="center">
          <el-button @click="handleClose">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="commitLabel"
          >
            确定
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>


</template>

<script>
import { pageMixins } from 'packages/js/mixins/page'
import { getLabelType, labelList, getLabelListByDatasetId } from 'packages/js/utils/LabelConfigService'

export default {
  name: 'LabelSelect',
  components: {},
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
      idListCopy: this.idList,
      selectLabelList: [],
      // 初始选中的标签列表
      selectLabelListInitial : [],
      labelList: [],
      dialogFormVisible: false,
      searchForm: {
        labelName: '',
        labelType: ''
      },
      checkLabelList: [],
      sizeLabel: 20,
      labelTypeList: [],
      labelCheckLoading: false
    }
  },
  mounted() {
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
        this.checkLabelList = []
        val.forEach((label) => {
          this.selectLabelList.forEach((selected) => {
            if (label.id === selected.id) {
              this.checkLabelList.push(label.id)
            }
          })
        })
      },
      deep: true
    },
    // 根据selectLabelList的变化，将id赋值给idList
    selectLabelList: {
      handler (val) {
        this.checkLabelList = []
        this.idListCopy = []
        val.forEach((item) => {
          this.idListCopy.push(item.id)
          this.checkLabelList.push(item.id)
        })
      },
      deep: true
    }

  },
  methods: {
    /**
     * 初始化方法
     */
    init () {
      this.dialogFormVisible = true
      this.getDataList()
      this.getLabelType()
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
      let params = {
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
     * 标签选项组选中事件
     */
    labelCheckChange(label) {
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
     * 点击添加标签按钮
     */
    addLabel () {
      // 初始化
      this.init()
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
    getByteLength (str) {
      return unescape(encodeURIComponent(str)).length
    },
    ellipsis (str, len) {
      if ((!str && typeof (str) !== 'undefined')) {
        return ''
      }
      var num = 0
      var str1 = str
      var str = ''
      for (var i = 0, lens = str1.length; i < lens; i++) {
        num += ((str1.charCodeAt(i) > 255) ? 2 : 1)
        if (num > len - 3) {
          break
        } else {
          str = str1.substring(0, i + 1)
        }
      }
      return str + '...'
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
