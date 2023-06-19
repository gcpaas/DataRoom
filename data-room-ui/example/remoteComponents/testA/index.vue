<template>
  <div class="test">
    <el-descriptions title="用户信息">
      <el-descriptions-item label="用户名">
        {{ customize.username }}
      </el-descriptions-item>
      <el-descriptions-item label="手机号">
        {{ customize.phone }}
      </el-descriptions-item>
      <el-descriptions-item label="居住地">
        苏州市
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        <el-tag size="small">
          学校
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系地址">
        江苏省苏州市吴中区吴中大道 1188 号
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script>

export default {
  name: 'TestA',
  components: {
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
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
    }
  },
  methods: {
    linkage (row) {
      this.$emit('linkage', row)
    }
  }
}
</script>
<style lang="scss" scoped>
.test {
  height: 100%;
  position: absolute;
  color: #fff;
  font-size: 20px;
  background: #fff;
  padding: 16px;

  .item {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
}
</style>
