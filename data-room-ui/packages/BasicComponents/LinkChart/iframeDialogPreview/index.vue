<template>
  <div @click.stop>
    <el-dialog
      title="超链接"
      :visible.sync="dialogVisible"
      :width="dialogW"
      :modal="true"
      :modal-append-to-body="false"
      :appen-to-body="true"
      class="bs-dialog-wrap bs-el-dialog"
      @close="close"
    >
      <div
        class="el-dialog-div"
        :style="{height: dialogH}"
      >
        <iframe
          :src="url"
          width="100%"
          height="100%"
          style="border: none;margin: -2px 0"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'IframeDialogPreview',
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    url () {
      return this.config?.customize?.url || ''
    },
    dialogW () {
      return this.config?.customize?.dialogW + 'px' || '1000px'
    },
    dialogH () {
      return this.config?.customize?.dialogH + 'px' || '500px'
    }
  },
  mounted () {

  },
  methods: {
    close () {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-dialog-div{
    overflow: auto;
  }
</style>
