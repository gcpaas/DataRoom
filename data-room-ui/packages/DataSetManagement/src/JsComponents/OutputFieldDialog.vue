<template>
  <div>
    <el-dialog
      title="输出字段配置"
      :visible.sync="dialogVisible"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleClose"
      class="bs-dialog-wrap bs-el-dialog"
    >
      <div class="bs-table-box">
        <el-table
          :data="insideFieldList"
          :border="true"
          align="center"
          class="bs-el-table"
        >
          <el-empty slot="empty" />
          <el-table-column
            align="left"
            show-overflow-tooltip
            prop="fieldName"
            label="字段值"
          />
          <el-table-column
            align="center"
            prop="fieldDesc"
            label="字段描述"
          >
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.fieldDesc"
                size="small"
                class="labeldsc bs-el-input"
              />
            </template>
          </el-table-column>
          <!-- 添加一个插槽，供其他人可扩展表格列，并把表格列的数据返回出去 -->
          <slot name="output-field-table-column" />
        </el-table>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default"
          @click="cancelField"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="setField"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'OutputFieldDialog',
  props: {
    outputFieldList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dialogVisible: false,
      structurePreviewListCopy: [],
      // 内部的输出字段列表 用于编辑
      insideFieldList: []
    }
  },
  methods: {
    open () {
      this.insideFieldList = cloneDeep(this.outputFieldList)
      this.dialogVisible = true
    },
    close () {
      this.dialogVisible = false
    },
    handleClose () {
      this.dialogVisible = false
    },
    cancelField () {
      this.dialogVisible = false
    },
    setField () {
      if (this.insideFieldList.length) {
        this.fieldDesc = {}
        this.insideFieldList.forEach(key => {
          this.fieldDesc[key.fieldName] = key.fieldDesc
        })
        this.$emit('setFieldList', this.insideFieldList)
      } else {
        this.fieldDesc = null
      }
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/style/bsTheme.scss';
</style>
