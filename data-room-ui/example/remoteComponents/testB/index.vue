<template>
  <div class="test">
    <Child />
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
import Child from './Child.vue'
export default {
  name: 'TestB',
  components: {
    Child
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
  width: 100%;
  height: 100%;
  position: absolute;
  color: #fff;
  font-size: 20px;
  background: #ccc;

  .item {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
}
</style>
