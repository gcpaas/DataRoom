<template>
  <el-page-header class="dataroom-el-page-header">
    <template slot="content">
      <div class="page-header">
        <div class="page-header-left">
          {{ title }}
        </div>
        <div class="page-header-right">
          <el-button
            class="bs-el-button-default"
            @click="window.open(url, '_blank')"
          >
            帮助
          </el-button>
          <el-button
            v-if="saveBtn"
            type="primary"
            @click="$emit('save')"
          >
            保存
          </el-button>
          <el-button
            class="back bs-el-button-default"
            @click="$emit('back')"
          >
            返回
          </el-button>
        </div>
      </div>
    </template>
  </el-page-header>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    saveBtn: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-el-page-header {
  .page-header {
  display: flex;
  position: relative;

  .page-header-right {
    position: absolute;
    right: 16px;
  }
}
  ::v-deep .el-page-header__left {
    display: none;
  }

  ::v-deep .el-page-header__content {
    width: 100%;
    font-size: 14px;
    font-weight: 600;
    padding: 16px 0px;
    margin-bottom: 16px;
    position: relative;
    border-bottom: 1px solid #EBEEF5;
  }
}

.page-header-left{
  font-size: 14px;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
  // border-bottom: 1px solid #409eff;

  &::before {
    content: "";
    height: 14px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    border-left: 4px solid #409eff;
  }
}
</style>
