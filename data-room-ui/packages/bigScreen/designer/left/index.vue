<!--
 * @description: 左侧组件列表
-->
<template>
  <transition name="slide-fade">
    <div
      class="dataroom-bigscreen-left-wrap"
      @click.stop
    >
      <el-tabs
        v-model="activeName"
        tab-position="left"
        style="height: 200px"
        class="first-tabs-box"
        @tab-click="tabClick"
      >
        <el-tab-pane
          v-for="menu in menuList"
          :key="menu.code"
          :name="menu.code"
        >
          <div
            slot="label"
            class="first-tabs--item-label"
          >
            <i
              class="icon"
              :class="menu.icon"
            />
            <span class="menu-title-span">{{ menu.name }}</span>
          </div>
          <!-- 图层 -->
          <Coverage
            v-if="activeName === menu.code && show && menu.code === 'coverage'"
            @closePanel="closePanel"
          />
          <!-- 组件库 -->
          <ComponentLibrary
            v-else-if="activeName === menu.code && show && menu.code === 'component'"
            :menu="componentMenu"
            @closePanel="closePanel"
          />
          <globalVariableList
            v-else-if="activeName === menu.code && show && menu.code === 'globalVariable'"
            @closePanel="closePanel"
          />
          <!-- 素材库(通过弹窗展示） -->
          <!-- 交互(通过弹窗展示） -->
          <!-- 下钻组件(通过弹窗展示） -->
        </el-tab-pane>
      </el-tabs>
      <resource-library
        ref="resourceLibrary"
        @chooseResource="chooseResource"
      />
      <interaction-dialog
        ref="interactionDialog"
      />
      <model-com-dialog ref="modelComDialog" />
    </div>
  </transition>
</template>
<script>
import menuList from './menu/index.js'
import pictureConfig from '@gcpaas/data-room-ui/packages/components/media/picture/bigScreenDefinition'
const ComponentLibrary = () => import('./components/ComponentLibrary/index.vue')
const ResourceLibrary = () => import('./components/ResourceLibrary/index.vue')
const Coverage = () => import('./components/coverage/index.vue')
const globalVariableList = () => import('./components/globalVariableList/index.vue')

const InteractionDialog =
  () => import('@gcpaas/data-room-ui/packages/bigScreen/designer/left/components/InteractionDialog/index.vue')
const ModelComDialog =
  () => import('@gcpaas/data-room-ui/packages/bigScreen/designer/left/components/ModelComDialog/index.vue')
export default {
  name: 'LeftPanel',
  components: {
    ModelComDialog,
    InteractionDialog,
    ComponentLibrary,
    ResourceLibrary,
    Coverage,
    globalVariableList
  },
  props: {
    headerShow: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: '100vh'
    }
  },
  data () {
    return {
      show: true, // tab内容显隐
      value: 'all',
      currentTab: null,
      activeName: 'component', // 设置左侧一级tab栏的默认值
      menuList: menuList
    }
  },
  inject: ['canvasInst'],
  computed: {
    componentMenu () {
      return this.menuList.find(item => item.code === 'component')
    },
    designLibraryMenu () {
      return this.menuList.find(item => item.code === 'designLibrary')
    }
  },
  watch: {
  },
  created () {

  },
  mounted () {
  },
  methods: {
    changeActiveCode () {

    },
    // tabs面板内部关闭tab
    closePanel () {
      this.show = false
    },
    // 点击素材库弹窗的回调函数
    chooseResource (resource) {
      this.$refs.resourceLibrary.dialogVisible = false
      // TODO: 临时组装一个config，测试画布可渲染
      const config = {
        ...pictureConfig(),
        url: resource.url
      }
      this.canvasInst.addChart(config, 'import')
      this.dialogVisible = false
    },
    // 点击tab标签
    tabClick (tab) {
      // 点击相同的tab就会折叠
      if (tab.name === this.currentTab) {
        this.show = !this.show
      } else {
        // 点击不同的tab标签会展开左侧面板
        this.show = true
      }
      this.currentTab = tab.name
      if (tab.name === 'resource') {
        this.$refs.resourceLibrary.dialogVisible = true
      } else if (tab.name === 'interactions') {
        this.$refs.interactionDialog.init()
      } else if (tab.name === 'modelComDialog') {
        this.$refs.modelComDialog.init()
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.dataroom-bigscreen-left-wrap {
  display: flex;
  background-color: #FCFCFC;

  .bs-folder-wrap {
    width: 20px;
    position: relative;

    i {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      font-size: 20px;
      color: #fff;
      cursor: pointer;
      z-index: 1;
    }

    &:hover {
      background: rgba(143, 225, 255, 0.1);
    }
  }

  .page-left {
    box-sizing: border-box;

    >* {
      color: #000000;
    }

    .iconfont-bigscreen {
      color: #fff;
    }

    .flexible {
      width: 45px;
      /* border-right: 1px solid #ccc; */
      text-align: center;
    }
  }

  .page-left-fold {
    width: 60px;
    overflow: hidden;
  }
  //一级tabs样式
  .first-tabs-box {
    height: 100% !important;
    .active-panel{
      color: #0a0a0a;
      .icon{
        color: #1F6AFF;
      }
    }
   ::v-deep .el-tabs__content {
      height: 100% !important;
      border: none;
    }
    ::v-deep .el-tab-pane{
      height: 100% !important;
      //display: flex;
    }
    ::v-deep .el-tabs__item {
      height: 50px !important;
      margin-bottom: 16px!important;
      padding: 0 3px!important;
      box-sizing: border-box;
      color: #a3a3a3!important;
      .first-tabs--item-label {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        .menu-icon {
          height: 20px;
        }

        .menu-title-span {
          display: block;
          width: 100%;
          font-size: 12px;
          text-align: center;
          height: 20px;
          line-height: 20px;
        }
        &:hover{
          background-color: #efefef;
          border-radius: 3px;
        }
      }
    }
    ::v-deep .el-tabs__item.is-active{
      color: #1F6AFF!important;
      .menu-title-span{
        color:#0a0a0a
      }
    }
    ::v-deep .el-tabs__active-bar{
      display: none;
    }
    ::v-deep .el-tabs__item.is-left {
      text-align: center;
      padding: 0;
    }
    ::v-deep .el-tabs__header {
      width: 60px;
      height: 100%;
      margin-right: 0 !important;
      padding-top: 20px;
      color: #a3a3a3!important;
      border-right: 1px solid #ededed!important;
    }
    ::v-deep .el-tabs__nav-wrap::after{
      width: 0px;
      //background-color: #ededed!important;
    }
  }

}

</style>
