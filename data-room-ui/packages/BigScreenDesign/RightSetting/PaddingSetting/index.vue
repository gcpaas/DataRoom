<template>
  <div class="bs-padding-setting">
    <div class="padding-box">
      <el-input
        v-model.number="paddingValue[0]"
        class="input-top input-item"
        size="mini"
        @change="paddingChange"
      />
      <el-input
        v-model.number="paddingValue[1]"
        class="input-right input-item"
        size="mini"
        @change="paddingChange"
      />
      <el-input
        v-model.number="paddingValue[2]"
        class="input-bottom input-item"
        size="mini"
        @change="paddingChange"
      />
      <el-input
        v-model.number="paddingValue[3]"
        class="input-left input-item bs-el-input"
        size="mini"
        @change="paddingChange"
      />
      <div class="padding-center" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaddingSetting',
  model: {
    prop: 'padding',
    event: 'input'
  },
  props: {
    padding: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      position: 0
    }
  },
  computed: {
    paddingValue () {
      return this.padding
    }
  },
  methods: {
    paddingChange () {
      this.$emit('input', this.paddingValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-padding-setting{
  .padding-box{
    width: 160px;
    height: 190px;
    position: relative;
  }
  .padding-center{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 30%;
    height: 30%;
    background-color: var(--bs-background-1);
  }
  .input-item{
    width: 50px;
    position: absolute;
    text-align: center;
    /deep/ .el-input__inner{
      text-align: center;
    }
  }
  .input-top{
    top: 20px;
    left:50%;
    transform: translateX(-50%);
  }
  .input-bottom{
    bottom: 20px;
    left:50%;
    transform: translateX(-50%);
  }
  .input-left{
    left: 0px;
    top:50%;
    transform: translateY(-50%);
  }
  .input-right{
    right: 0px;
    top:50%;
    transform: translateY(-50%);
  }
}
</style>
