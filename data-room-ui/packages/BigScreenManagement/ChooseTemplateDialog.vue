<template>
  <el-dialog
    :title="hasCreate ? '新建' : '模板'"
    :visible.sync="dialogVisible"
    width="50%"
    class="bs-dialog-wrap bs-el-dialog"
    :before-close="handleClose"
  >
    <TemplateList
      ref="templateList"
      :has-create="hasCreate"
      :page-info="pageInfo"
      :loading="loading"
      @addNew="addNew"
      @useIt="useIt"
      @replaceItByTemplate="replaceItByTemplate"
    />
  </el-dialog>
</template>

<script>
import TemplateList from 'packages/TemplateList'
export default {
  name: 'ChooseTemplistDialog',
  components: {
    TemplateList
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    hasCreate: {
      type: Boolean,
      default: false
    },
    pageInfo: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      dialogVisible: false,
      parentNode: null,
      type: null
    }
  },
  mounted () {

  },
  methods: {
    init (parentNode, type) {
      this.parentNode = parentNode
      this.type = type
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.templateList.getTemplateList(type)
      })
    },
    handleClose () {
      this.dialogVisible = false
    },
    addNew () {
      this.$emit('addNew', this.parentNode, this.type)
    },
    useIt (id) {
      this.$emit('useIt', id, this.parentNode, this.type)
    },
    replaceItByTemplate (config) {
      this.$emit('replaceItByTemplate', config)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
