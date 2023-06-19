<template>
  <div class="icon-picker">
    <el-select
      v-model="localValue"
      placeholder="请选择图标"
      filterable
      clearable
      class="bs-el-select"
      popper-class="bs-el-select"
      @change="changeValue"
    >
      <el-option
        v-for="icon in iconList"
        :key="icon"
        :label="icon"
        :value="icon"
      >
        <div class="icon-option">
          <i :class="icon" />
          <span>{{ icon }}</span>
        </div>
      </el-option>
    </el-select>
    <div class="icon">
      <i :class="localValue" />
    </div>
  </div>
</template>
<script>
import iconList from './icon.json'

const originList = iconList.map(name => `el-icon-${name}`)

export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      iconList: originList,
      localValue: this.value,
      key: ''
    }
  },
  watch: {
    key (val) {
      if (val) {
        this.iconList = originList.filter(name => name.indexOf(val) > -1)
      } else {
        this.iconList = originList
      }
    }
  },
  methods: {
    changeValue (event) {
      this.$emit('input', this.localValue)
    }
  }
}
</script>
<style lang="scss" scoped>
.icon-picker {
  display: flex;
}

.icon-option {
    display: flex;
    justify-content: space-between;
    align-items: center;

    i {
      font-size: 20px;
    }
  }
  .icon {
    width: 32px;
    height: 28px;
    margin-left: 5px;
    align-self: center;
    text-align: center;
    background-color: var(--bs-background-1);
  }
</style>
