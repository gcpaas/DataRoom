<template>
  <div class="application-create-top-wrap">
    <header class="application-create-top">
      <div class="top-center">
        <el-tabs
          v-model="activeName"
          @tab-click="handleClick"
        >
          <el-tab-pane
            v-for="tab in tabList"
            :key="tab.path"
            :label="tab.name"
            :name="tab.path"
          />
        </el-tabs>
      </div>
    </header>
    <div class="router-view-wrap">
      <router-view />
    </div>
    <div />
  </div>
</template>
<script>
export default {
  name: 'ApplicationCreateTop',
  props: [],
  data () {
    return {
      logo: require('./static/app.png'),
      activeName: 'pageManagement',
      app: {
        id: '',
        name: '',
        visibility: '',
        code: '',
        icon: ''
      },
      // 和此处路由保持一致，将会激活tab，请按需更改
      tabList: [
        {
          name: '大屏管理',
          path: window.BS_CONFIG?.routers?.pageManagementUrl || '/pages'
        },
        {
          name: '数据集管理',
          path: window.BS_CONFIG?.routers?.dsManageUrl || '/data-sources'
        }
      ]
    }
  },
  created () {
  },
  methods: {
    handleClick (tab) {
      this.$router.push({
        path: tab.name
      })
    }
  }
}
</script>

<style lang="scss">
.header-new-drop {
  ::v-deep .el-dropdown-menu__item {
    height: 50px !important;
  }
}
</style>
<style lang="scss" scoped>
.application-create-top-wrap {
  overflow: hidden;
  height: 100vh;

  .application-create-top {
    height: 40px;
    display: flex;
    align-items: center;
    background-color: var(--bs-el-color-primary) !important;

    .top-left {
      display: flex;
      align-items: center;

      .log-img,
      .logo-text {
        margin-left: 25px;
        width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .log-img {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .logo-text {
        font-size: 14px;
        /*font-weight: bold;*/
        color: #ffffff;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .top-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      ::v-deep .el-tabs__header {
        margin: 0;

        ::v-deep .el-tabs__item {
          height: 51px;
          line-height: 51px;
          color: #ffffff;
          &:hover {
            background-color: hsla(0, 0%, 100%, 0.1) !important;
          }
        }
      }

      ::v-deep .el-tabs__header {
        margin: 0 !important;
      }

      ::v-deep .el-tabs__item {
        height: 40px !important;
        line-height: 40px !important;
        padding:0 10px!important;
        box-sizing: border-box;
      }

      ::v-deep .el-tabs__active-bar {
        width: 0 !important;
      }

      ::v-deep .el-tabs__item.is-active {
        color: #ffffff !important;
        background-color: hsla(0, 0%, 100%, 0.1) !important;
      }

      ::v-deep .el-tabs__item:hover {
        color: #fff !important;
        cursor: pointer;
        background-color: hsla(0, 0%, 100%, 0.1) !important;
      }

      ::v-deep .el-tabs__item {
        color: #fff !important;
      }
    }

    .top-right {
      display: flex;
      width: 150px;
      align-items: center;
      margin-right: 20px;
      justify-content: flex-end;

      ::v-deep .el-dropdown {
        padding: 4px 8px;
        border-radius: 4px;
      }

      .el-dropdown:hover {
        padding: 4px 8px;
        background-color: rgba(255, 255, 255, 0.1) !important;
      }

      span {
        cursor: pointer;
        font-size: 14px;
        color: #fff;
        font-weight: 500;
      }
    }
  }

  .router-view-wrap {
    box-sizing: border-box;
    // overflow: auto;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 40px);
  }

  .pt16 {
    padding-top: 16px;
  }

  .padding16 {
    padding: 16px;
  }

  ::v-deep .el-tabs__nav-wrap::after {
    width: 0 !important;
  }
}
</style>
