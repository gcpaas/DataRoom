<!--
 * @description: 时间线
-->
<template>
  <el-dialog
    title="历史操作"
    :visible.sync="dialogVisible"
    width="50%"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
  >
    <div class="layer-list-wrap">
      <!-- el-table 三列，动作，时间，操作。操作栏中是回退 -->
      <el-table
        :data="chartList"
        border
        style="width: 100%"
        class="bs-el-table"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          prop="timelineTitle"
          label="动作"
          class-name="bs-el-table-column"
        />
        <el-table-column
          prop="updateTime"
          label="时间"
          width="180"
          class-name="bs-el-table-column"
        />
        <el-table-column
          prop="operation"
          label="操作"
          width="100"
          class-name="bs-el-table-column"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="rollback(scope.$index)"
            >
              回退
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="dialogVisible = false"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="clearTimeline"
      >
        清除历史
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'HistoryList',
  props: {},
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    ...mapState({
      chartList: state => state.bigScreen.timelineStore,
      currentTimeLine: state => state.bigScreen.currentTimeLine
    })
  },
  mounted () {},
  methods: {
    ...mapMutations({
      clearTimeline: 'bigScreen/clearTimeline',
      rollbackTimeline: 'bigScreen/rollbackTimeline'
    }),
    init () {
      this.dialogVisible = true
    },
    rollback (index) {
      this.rollbackTimeline(index)
      this.dialogVisible = false
    },
    tableRowClassName ({ row, rowIndex }) {
      if (rowIndex === this.currentTimeLine - 1) {
        return 'choosed-row'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/BigScreenDesign/fonts/iconfont.css';
@import '~packages/assets/style/bsTheme.scss';
.layer-list-wrap {
  /deep/ .choosed-row {
    .bs-el-table-column {
      border-color: var(--bs-el-border) !important;
      background: var(--bs-background-2) !important;
      background-color: var(--bs-background-2) !important;
      opacity: 0.7;
    }
  }
}
</style>
