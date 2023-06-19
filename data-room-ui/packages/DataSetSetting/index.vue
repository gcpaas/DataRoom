<template>
  <div class="bs-theme-wrap">
    <el-input
      v-model="datasetNameStr"
      placeholder="请选择数据集"
      readonly
      @focus="openDataSetDialog"
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="openDataSetDialog"
      />
    </el-input>
    <data-set-dialog
      ref="dataSetDialog"
      v-bind="$attrs"
      :multiple="multiple"
      :ds-value="dsValue"
      @getDsId="getDsId"
      @getSelectDs="getSelectDs"
    />
  </div>
</template>

<script>
import dataSetDialog from './dataSetSetting.vue'
export default {
  name: 'Index',
  components: { dataSetDialog },
  props: {
    config: {
      type: Object,
      default: () => {
      }
    },
    datasetName: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    dsValue: {
      type: [Array, Object],
      default: () => ([])
    }
  },
  data () {
    return {
    }
  },
  computed: {
    datasetNameStr () {
      return this.datasetName || this.dsValue?.map(ds => ds.name).join(',')
    }
  },
  methods: {
    openDataSetDialog () {
      this.$refs.dataSetDialog.dataSetVisible = true
    },
    getDsId (dsId) {
      this.$emit('getDsId', dsId)
    },
    getSelectDs (selectDs) {
      this.$emit('getSelectDs', selectDs)
      if (selectDs.datasetType === 'metrics') {
        this.$emit('getMetricsList', JSON.parse(selectDs.data))
        // 选择数据集时修改当前数据集的状态（指标域或者其他数据集）
        this.$emit('changeIsMetrics', true, selectDs.datasetType)
      } else {
        this.$emit('changeIsMetrics', false, selectDs.datasetType)
      }
    }
  }
}
</script>

<style scoped>

</style>
