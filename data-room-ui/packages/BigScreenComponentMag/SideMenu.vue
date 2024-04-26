<template>
  <div class="side-catalog-wrap">
    <el-scrollbar class="side-catalog-box">
      <div
        v-for="(com, index) in componentList"
        :key="index"
        class="component-item-box"
        :class="{ 'active-catalog': activeType === com.type }"
        @click="componentHandle(com)"
      >
        {{ com.name }}
      </div>
    </el-scrollbar>
  </div>
</template>
<script>
export default {
  components: {},
  data () {
    return {
      componentList: [
        {
          name: '自定义组件',
          type: 'component'
        },
        {
          name: '业务组件',
          type: 'bizComponent'
        },
        {
          name: '系统组件',
          type: 'system'
        }
      ],
      activeType: 'component'
    }
  },
  watch: {
    $route: {
      handler (val) {
        const { globalData } = this.$router.app.$options
        if (globalData?.componentsManagementType) {
          this.activeType = globalData.componentsManagementType
          this.$emit('getPageInfo', globalData.componentsManagementType)
          // 清除this.$router.app.$options.globalData.componentsManagementType
          delete globalData.componentsManagementType
        }
      },
      immediate: true
    }
  },
  created () { },
  methods: {
    // 点击左侧组件
    componentHandle (com) {
      this.activeType = com.type
      this.$emit('getPageInfo', com.type)
    }
  }
}
</script>
<style lang="scss" scoped>
  @import '../assets/style/bsTheme.scss';
  .side-catalog-wrap {
    .component-item-box {
      width: 100%;
      padding: 0px 16px;
      line-height: 36px;
      display: flex;
      justify-content: space-between;

      &:hover {
        cursor: pointer;
      }
    }
  }
  .side-catalog-wrap{
    // padding-top: 16px;
    width: 220px;
    // height: 100%;
    // margin-bottom: 16px;
    box-sizing: border-box;
    color: var(--bs-el-title);
    background-color: var(--bs-background-2);
    .side-catalog-box{
      height: calc(100% - 50px);
      overflow-y: auto;
      .side-catalog-all{
        font-weight: bold;
      }
      .side-catalog-item{
        width: 100%;
        padding: 0px 16px;
        line-height: 36px;
        display: flex;
        justify-content: space-between;
        &:hover{
          cursor: pointer;
        }
        .el-icon-more{
          transform: rotate(90deg);
          color: var(--bs-el-title);
          font-weight: 400;
        }
        .active-icon-more{
          color:var(--bs-el-text);
        }
        .catalog-name{
          overflow:hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          -o-text-overflow:ellipsis;
        }
        .page-list-dropdown{
          opacity: 0;
        }
        .dropdown-show{
          opacity: 1;
        }
      }
      /*菜单激活时的样式*/
      .active-catalog{
        position: relative;
        background-color: rgba(var(--bs-el-color-primary-active), 0.4);
        color: var(--bs-el-text);
        &::before{
          content: '';
          position: absolute;
          left: 0;
          width: 4px;
          height: 36px;
          background-color: var(--bs-el-color-primary);
        }
      }
    }
    .add-catalog-box{
      padding: 10px 0;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      margin: 0 8px;
      &:hover{
        background-color: var(--bs-background-1);
        cursor: pointer;
        color: var(--bs-el-text);;
      }
      .el-icon-plus{
        padding: 0 5px;
      }
    }

  }
  .dropdown-menu-box{
    left: 50%;
    transform: translateX(-40%);
    width: 100px!important;
    ::v-deep .el-dropdown-menu__item{
      text-align: center;
      padding: 5px;
    }
    ::v-deep .popper__arrow{
      left: 50% !important;
      transform: translateX(-50%) !important;
    }
  }
</style>
