// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'

const datasetMixins = {
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    datasetId: {
      type: String,
      default: null
    },
    datasetName: {
      type: String,
      default: ''
    },
    typeId: {
      type: String,
      default: ''
    },
    appCode: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dataForm: {},
      dataPreviewList: [],
      structurePreviewList: [],
      structurePreviewListCopy: [],
      typeName: '',
      categoryData: [],
      current: 1,
      size: 10,
      totalCount: 0,
      fieldDescVisible: false,
      fieldsetVisible: false,
      tableLoading: false,
      saveLoading: false,
      saveText: '',
      typeSelect: [
        { value: 'String' },
        { value: 'Integer' },
        { value: 'Double' },
        { value: 'Long' },
        { value: 'Date' }
      ]
    }
  },
  methods: {
    /**
     * 使用字段名填充字段描述
     */
    fieldDescFill () {
      this.structurePreviewList.forEach(field => {
        if (field.fieldDesc === '' || !field.hasOwnProperty('fieldDesc')) {
          field.fieldDesc = field.fieldName
        }
      })
      this.save('form')
      this.fieldDescVisible = false
    },
    /**
     * 打开字段描述编辑弹窗
     */
    fieldDescEdit () {
      this.fieldDescVisible = false
      this.fieldsetVisible = true
    },
    /**
     * 跳过字段描述编辑直接保存
     */
    toSave () {
      this.save('form', true)
      this.fieldDescVisible = false
    },
    /**
     * 取消编辑字段
     */
    cancelField () {
      this.structurePreviewListCopy = cloneDeep(this.structurePreviewList)
      this.fieldsetVisible = false
    },
    /**
     * 保存字段设置
     */
    setField () {
      this.structurePreviewList = cloneDeep(this.structurePreviewListCopy)
      this.fieldsetVisible = false
    },
    /**
     * 清空分类选择
     */
    clearType () {
      this.typeName = ''
      this.dataForm.typeId = ''
    },
    /**
     * 分类展开高亮
     * @param $event
     */
    setCurrentNode ($event) {
      if ($event) {
        const key = this.dataForm.typeId || null
        this.$refs.categorySelectTree.setCurrentKey(key)
      }
    },
    /**
     * 分类选择
     * @param value
     */
    selectParentCategory (value) {
      this.dataForm.typeId = value.id
      this.typeName = value.name
      this.$refs.selectParentName.blur()
    },
    goBack () {
      this.$emit('back')
    },
    // 每页大小改变触发
    sizeChangeHandle (value) {
      this.size = value
      this.current = 1
      this.datasetTest(false)
    },
    // 当前页数改变
    currentChangeHandle (value) {
      this.current = value
      this.datasetTest(false)
      const tableBodyWrapperEl = document.querySelector('.el-table__body-wrapper') || {}
      this.$nextTick(() => {
        if (tableBodyWrapperEl) {
          // 表格滚动到顶部
          tableBodyWrapperEl.scrollTop = 0
        }
      })
    },
    // 表头添加提示
    renderHeader (h, { column, index }) {
      const labelLong = column.label.length // 表头label长度
      const size = 14 // 根据需要定义标尺，直接使用字体大小确定就行，也可以根据需要定义
      column.minWidth = labelLong * size < 120 ? 120 : labelLong * size // 根据label长度计算该表头最终宽度
      return h('span', { class: 'cell-content', style: { width: '100%' } }, [column.label])
    },
    openNewWindow (url) {
      window.open(url, '_blank')
    }
  }
}
export { datasetMixins }
