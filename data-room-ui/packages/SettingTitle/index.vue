<template>
  <div class="lc-field-head">
    <div class="lc-field-title">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lc-field-head {
    height: 30px;
    // margin-bottom: 12px;

    .lc-field-title {
        position: relative;
        padding-left: 12px;
        line-height: 30px;
        height: 30px;

        &:after {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            content: '';
            width: 4px;
            height: 14px;
            background-color: var(--bs-el-color-primary);
        }
    }
}
</style>
