<template>
  <div class="application-setting-wrap">
    <div class="left-tab-box">
      <ul>
        <li
          v-for="tab in tabList"
          :key="tab.path"
          :class="{'tab-active': tab.active,'tab-style':true}"
          @click="openTab(tab)"
        >
          <icon-svg
            :name="tab.img"
            class="tabIconStyle"
          />
          <span>{{ tab.name }}</span>
        </li>
      </ul>
    </div>

    <el-scrollbar class="scroll-box">
      <div class="inner-router-view-wrap">
        <router-view v-if="isRresh" />
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import Icon from 'packages/assets/images/dataSourceIcon/export'
import IconSvg from 'packages/SvgIcon'
export default {
  name: 'DataSourceManagement',
  components: {
    IconSvg
  },
  provide () {
    return {
      refresh: this.refresh
    }
  },
  data () {
    return {
      // appIcon: Icon.getNameList(),
      isRresh: true,
      activeTabName: '',
      currentPermission: 1,
      tabList: [
        {
          active: false,
          name: '数据源管理',
          path: window?.routers?.dataSourceUrl,
          // permissionRequire: 0
          img: Icon.getNameList()[0]
        },
        {
          active: false,
          name: '数据集管理',
          path: window?.routers?.dataSetUrl,
          // permissionRequire: 9
          img: Icon.getNameList()[1]
        }
      ]
    }
  },
  watch: {
  },
  created () {
    this.tabList[0].path = window?.BS_CONFIG?.routers?.dataSourceUrl || '/data-sources/data-source-sets'
    this.tabList[1].path = window?.BS_CONFIG?.routers?.dataSetUrl || '/data-sources/data-set-configuration'
  },
  mounted () {
    this.openTab(this.tabList[0])
  },
  methods: {
    refresh () {
      this.isRresh = false
      this.$nextTick(() => {
        this.isRresh = true
      })
    },
    openTab (tab) {
      this.$router.push({
        path: tab.path
      })
      this.tabList.forEach((item) => {
        if (item.path !== tab.path) {
          item.active = false
        } else {
          item.active = true
        }
      })
    },
    setActiveTab (route) {
      this.$router.push({
        path: route.path
      })
      this.tabList.forEach((tab) => {
        if (tab.path === route.path) {
          tab.active = true
        } else {
          tab.active = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.application-setting-wrap {
  display: flex;
  height: calc(100vh - 40px);
  overflow-y: hidden;
  background: #f5f7fa;

  .left-tab-box {
    background: #fff;
    width: 290px;

    ul {
      padding-left: 0;
      li {
        display: flex;
        align-items: center;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
        padding-left: 20px;
        margin: 5px 0;
        img {
          width: 20px;
          vertical-align: middle;
          margin-right: 10px;
        }
        &:hover {
          background-color: #007aff10;
        }
      }
    }

    .tab-active {
      background-color: #007aff10;

      &:before {
        content: "";
        height: 40px;
        line-height: 40px;
        position: absolute;
        left: 0;
        border-left: 4px solid #007aff;
      }
    }

    /deep/ .el-tabs__item {
      text-align: left;
      width: 290px;
    }

    /deep/ .el-tabs__nav-wrap::after {
      background-color: #fff !important;
    }
  }
  .scroll-box {
    width: calc(100% - 300px);
    overflow-y: auto;
    overflow-x: hidden;
    margin: 16px;
    background: #fff;
  }

  .inner-router-view-wrap {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  /deep/.el-scrollbar__view{
    height: 100%;
    .inner-router-view-wrap{
      height: 100%;
      .bs-table-box{
        height: calc(100vh - 205px);
        .el-table{
          height: 100%;
        }
      }
    }
  }
  .tabIconStyle{
    width: 18px;
    height: 18px;
    margin-right: 20px;
  }
}

</style>
