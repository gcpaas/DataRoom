// 分页，分页几乎每个列表页面都会存在，代码的重合度很高，所以提出来了
const pageMixins = {
  data () {
    return {
      // 当前页
      current: 1,
      // 每页大小
      size: 10,
      // 总页数
      totalPage: 0,
      // 总数据条数
      totalCount: 0,
      prevText: '',
      nextText: '',
      // 排序相关
      sortForm: {
        /**
         * key: 字段名称
         * value: descending 、ascending、''
         */
        sortFieldMap: {},
        // 定义排序字段的排序，如果不支持多个字段同时排序，可以传入一个即可
        sortFieldOrderList: [],
        // 缓存列和类名信息，方便后面清空排序字段信息
        columnCacheMap: {}
      },
      // 允许多字段排序
      enableMultiFieldOrder: false,
      sortFieldHeaderTipMap: {}
    }
  },
  watch: {
    'sortForm.sortFieldMap': {
      handler (sortFieldMap, oldV) {
        for (const columnName in sortFieldMap) {
          const order = sortFieldMap[columnName]
          if (!order) {
            this.$set(this.sortFieldHeaderTipMap, columnName, '点击升序')
          } else if (order === 'ascending') {
            this.$set(this.sortFieldHeaderTipMap, columnName, '点击降序')
          } else if (order === 'descending') {
            this.$set(this.sortFieldHeaderTipMap, columnName, '取消排序')
          } else {
            this.$set(this.sortFieldHeaderTipMap, columnName, '点击升序')
          }
        }
      },
      deep: true
    }
  },
  methods: {
    /**
     * 初始化排序信息
     * @param sortFieldOrderList 排序字段的优先级
     * @param defaultSortFieldMap 默认排序字段信息 descending： 降序，ascending：升序
     */
    initSortField (sortFieldOrderList = [], defaultSortFieldMap = {}) {
      if (defaultSortFieldMap) {
        for (const field in defaultSortFieldMap) {
          const order = defaultSortFieldMap[field]
          this.$set(this.sortForm.sortFieldMap, field, order)
        }
      }
      for (let i = 0; i < sortFieldOrderList.length; i++) {
        const field = sortFieldOrderList[i]
        const order = this.sortForm.sortFieldMap[field]
        if (!order) {
          // 解决未设置默认排序值字段提示为空
          this.$set(this.sortForm.sortFieldMap, field, '')
        }
      }
      this.sortForm.sortFieldOrderList = sortFieldOrderList
    },
    // 排序状态记录并激活，否则和页面上的排序对不上
    sortStyle ({ row, column, rowIndex, columnIndex }) {
      const sortColumnOrder = this.sortForm.sortFieldMap[column.property]
      if (sortColumnOrder) {
        column.order = sortColumnOrder
      }
      this.sortForm.columnCacheMap[column.property] = column
    },
    // 对应表格的 @sort-change 事件，当用户改变了排序的状态时触发
    reSort (column) {
      if (!this.enableMultiFieldOrder) {
        // 不允许多个字段同时排序，清空之前的排序信息
        for (const field in this.sortForm.columnCacheMap) {
          const column = this.sortForm.columnCacheMap[field]
          column.order = ''
        }
        for (const field in this.sortForm.sortFieldMap) {
          this.sortForm.sortFieldMap[field] = ''
        }
      }
      this.$set(this.sortForm.sortFieldMap, column.prop, column.order)
      this.reSearch()
    },
    reSearch () {
      this.current = 1
      this.getDataList()
    },
    getDataList () {
      console.error('你应该重写getDataList方法')
    },
    // 每页大小改变触发
    sizeChangeHandle (val) {
      this.size = val
      this.current = 1
      this.getDataList()
    },
    // 当前页数改变
    currentChangeHandle (val) {
      this.current = val
      this.getDataList()
    },
    getSortForm () {
      return {
        sortFieldMap: this.sortForm.sortFieldMap,
        sortFieldOrderList: this.sortForm.sortFieldOrderList
      }
    }
  }
}

export { pageMixins }
