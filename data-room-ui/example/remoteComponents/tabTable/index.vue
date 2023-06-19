<template>
  <div class="tab-table-wrap">
    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="城市管理"
        name="first"
      >
        <el-table
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="城市"
            width="180"
          />
          <el-table-column
            prop="number"
            label="数量"
          />
        </el-table>
        <el-tab-pane
          label="用户信息"
          name="second"
        >
          <el-descriptions title="用户信息">
            <el-descriptions-item label="用户名">
              {{ customize.username }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ customize.phone }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane
          label="角色管理"
          name="third"
        >
          角色管理
        </el-tab-pane>
        <el-tab-pane
          label="定时任务补偿"
          name="fourth"
        >
          定时任务补偿
        </el-tab-pane>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  data () {
    return {
      activeName: 'first'
    }
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    option () {
      return this.config.option
    },
    optionData () {
      return this.option.data
    },
    customize () {
      return this.option.customize
    },
    tableData () {
      if (this.optionData && this.optionData.length) {
        return this.optionData.map((item) => ({
          name: item[this.option.xField],
          number: item[this.option.yField]
        }))
      }
      return []
    }
  },
  methods: {
    handleClick (tab, event) {
    },
    linkage (row) {
      this.$emit('linkage', row)
    }
  }
}
</script>

<style lang="scss" scoped>
  .tab-table-wrap {
    padding: 16px;
    font-size: 20px;
    position: absolute;
    width: 100%;
    height: 100%;
    background: #fff;
  }
</style>
