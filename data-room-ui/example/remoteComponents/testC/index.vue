<template>
  <div class="test">
    <h1>用户名: {{ customize.username }}</h1>
    <br>
    <div
      v-for="(row, key) in optionData"
      :key="key"
      class="item"
      @click="linkage(row)"
    >
      <span> {{ row[option.xField] }}</span>  -
      <span> {{ row[option.yField] }}</span>
    </div>
  </div>
</template>
<script>

export default {
  name: 'TestC',
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
  font-size: 20px;
  position: absolute;
  width: 100%;
  height: 100%;
  color: #fff;

  .item {
    line-height: 50px;
    width: 100%;
    height: 50px;
    text-align: center;
  }
}
</style>
