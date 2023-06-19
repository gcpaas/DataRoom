<template>
  <el-dialog
    title="超链接"
    :visible.sync="iframeDialog"
    :width="dialogW"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
    @close="close"
  >
    <div class="el-dialog-div" :style="{height: dialogH}">
      <iframe
        :src="url"
        width="100%"
        height="100%"
        style="border: none;margin: -2px 0"
      />
    </div>
  </el-dialog>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'Iframe',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    config: {
      get () {
        return this.$store.state.bigScreen.activeItemConfig
      },
      set () {
      }
    },
    url () {
      return this.config?.customize?.url || ''
    },
    dialogW () {
      return this.config?.customize?.dialogW + 'px' || '1000px'
    },
    dialogH () {
      return this.config?.customize?.dialogH + 'px' || '500px'
    },
    iframeDialog: {
      get () {
        return this.$store.state.bigScreen.iframeDialog
      },
      set () {
      }
    }
  },
  mounted () {

  },
  methods: {
    ...mapMutations('bigScreen', ['changeIframeDialog']),
    close () {
      this.changeIframeDialog(false)
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-dialog-div{
    overflow: auto;
  }
</style>
