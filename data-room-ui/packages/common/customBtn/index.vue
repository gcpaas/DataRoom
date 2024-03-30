<template>
  <div
    class="dataroom-custom-btn"
    :class="{
      'head-btn-disabled': disabled
    }"
    @click="$emit('click')"
  >
    <slot />

    <i
      v-if="loading"
      class="el-icon el-icon-loading"
      style="padding-left: 4px;"
    />
  </div>
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click (e) {
      e.preventDefault()
      if (!this.loading) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-custom-btn {
  display: flex;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  width: auto;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
  padding: 4px 10px;
  font-size: 12px;

  &:hover {
     background-color: rgba(255, 255, 255, 0.27);
  }

  &-disabled {
    background-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    color: #999 !important;
    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  }
}
</style>
