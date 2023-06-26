import _ from 'lodash'
import { EventBus } from 'packages/js/utils/eventBus'
import { mapMutations } from 'vuex'
import { getUpdateChartInfo } from '../api/bigScreenApi'

export default {
  data () {
    return {
      filterList: [],
      treeParentId: 0,
      dataLoading: false
    }
  },
  methods: {
    ...mapMutations('bigScreen', {
      changeChartKey: 'changeChartKey'
    }),
    /**
     * bigScreen数据联动时根据入参的值进行数据处理
     * @param filterList 过滤条件
     * @param isInner    是否是组件内部的数据改变
     */
    dataInit (filterList, isInner = false) {
      if (Array.isArray(filterList) && filterList.length) {
        this.filterList = filterList
      }
      filterList = this.combineFilterList(isInner).filter(
        field => ![undefined, ''].includes(field.value)
      )
      this.dataLinkageHandle(this.config, this.pageInfo.code, filterList)
    },
    // 数据联动时改变数据（与点击设置面板的更新按钮及初始化时的数据处理做区分）
    async dataLinkageHandle (config, pageCode, filterList) {
      const params = {
        chart: {
          ...config,
          option: undefined
        },
        current: 1,
        pageCode,
        type: config.type,
        filterList,
        treeParentId: this.treeParentId || '0'
      }
      this.dataLoading = true
      return getUpdateChartInfo(params)
        .then(res => {
          config = this.buildOption(config, res)
          this.changeChartConfig(config)
          this.changeChartKey(config.code)
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => {
          this.dataLoading = false
        })
    },
    /**
     * 联动数据
     * @param {*} formData
     * */
    linkage (formData) {
      EventBus.$emit('dataInit', formData, this.config.linkage.components)
    },
    /**
     * 绑定数据
     * @param {*} formData
     * */
    // binding (formData) {
    //   EventBus.$emit('dataInit', formData, this.config.binding.components)
    // },
    /**
     * 处理外部联动数据和内部联动数据，合并，如果内部搜索区的参数在外部联动，则赋值上
     * @param {Boolean} isInner 是否是内部组件
     */
    combineFilterList (isInner = false) {
      let filterList = isInner ? [] : _.cloneDeep(this.filterList)
      // 如果内部组件的搜索条件不存在，则直接返回全局的filterList
      if (!this.$refs?.searchForm?.form) {
        return filterList
      }
      // 对比，如果filterList的column和内部参数innerFilterList一致，则赋值内部参数
      const form = this.$refs.searchForm.form
      const innerFilteKeyMap = Object.keys(form)
      // eslint-disable-next-line no-unused-expressions
      filterList?.map(filterItem => {
        if (innerFilteKeyMap.includes(filterItem.column)) {
          this.formData[filterItem.column] = filterItem.value
          this.$refs.searchForm.form[filterItem.column] = filterItem.value
        }
      })
      // 处理内部参数 filterList
      const innerFilterList = this.config?.fields
        ?.map(field => {
          return {
            column: field.name,
            operator: field.queryRule || 'like',
            value: this.formData[field.name]
          }
        })
        .filter(field => ![undefined, ''].includes(field.value))
      // 合并去重
      filterList = [...filterList, ...innerFilterList]
      filterList = _.uniqBy(filterList, 'column')
      return filterList
    }
  }
}
