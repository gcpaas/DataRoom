<template>
  <div
    class="dataroom-bigscreen-component-library-wrap first-tabs-content"
  >
    <div class="first-tabs-content-top">
      <div class="top-left">
        组件库
      </div>
      <div class="top-right">
        <i
          class="top-right-icon el-icon-close"
          @click="closePanel"
        />
      </div>
    </div>
    <div class="first-tabs-content-bottom">
      <el-tabs
        v-model="secondActiveName"
        class="second-tabs"
        tab-position="left"
        style="height: 200px;"
      >
        <el-tab-pane
          v-for="i in menu.children"
          :key="i.code"
          :name="i.code"
          class="bottom-tab-pane"
        >
          <div
            slot="label"
            class="menu-slot"
          >
            <!--            <el-tooltip-->
            <!--              class="item"-->
            <!--              effect="dark"-->
            <!--              :content="i.title"-->
            <!--              placement="left"-->
            <!--              popper-class="dataroom-el-tooltip"-->
            <!--            >-->
            <!--              <i-->
            <!--                :class="i.icon"-->
            <!--              />-->
            <!--            </el-tooltip>-->
            {{ i.name }}
          </div>
          <div
            v-if="i.code !=='g2Plot'"
            class="item-second-panel"
          >
            <div
              v-for="element in i.children"
              :key="element.type"
              class="bottom-pane-content"
              :class="element.children
                ? 'item menu-component drag-node-com'
                : 'item drag-node-com'
              "
              draggable="true"
              :data-type="element.type"
              :data-name="element.name"
              @click="elementClickHandler(element)"
            >
              <div class="bottom-pane-content-title">
                {{ element.name }}
                <el-tag
                  v-if="element.disabled"
                  style="float: right"
                  type="warning"
                >
                  开发中
                </el-tag>
              </div>
              <div class="bottom-pane-content-img">
                <img
                  :src="element.img"
                  alt=""
                >
              </div>
            </div>
          </div>
          <div
            v-else
            style="height: 100%"
          >
            <el-tabs
              v-model="thirdActiveName"
              class="third-tabs"
              tab-position="left"
              style="height: 200px;"
            >
              <el-tab-pane
                v-for="j in i.children"
                :key="j.code"
                :name="j.code"
                class="bottom-tab-pane"
              >
                <div
                  slot="label"
                  class="menu-slot"
                  :class="{'active-title': thirdActiveName === j.code}"
                >
                  {{ j.name }}
                </div>
                <div
                  v-for="chart in j.children"
                  :key="chart.type"
                  class="bottom-pane-content"
                  :class="chart.children
                    ? 'item menu-component drag-node-com'
                    : 'item drag-node-com'
                  "
                  draggable="true"
                  :data-type="chart.type"
                  :data-name="chart.name"
                  @click="elementClickHandler(chart)"
                >
                  <div class="bottom-pane-content-title">
                    {{ chart.name }}
                    <el-tag
                      v-if="chart.disabled"
                      style="float: right"
                      type="warning"
                    >
                      开发中
                    </el-tag>
                  </div>
                  <div class="bottom-pane-content-img">
                    <img
                      :src="chart.img"
                      alt=""
                    >
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>

import { getNodeByTree } from '@gcpaas/data-room-ui/packages/js/utils'

export default {
  name: 'ComponentLibrary',
  components: {},
  props: {
    menu: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      panelShow: true,
      secondActiveName: 'g2Plot', // 设置左侧二级tab栏的默认值
      thirdActiveName: 'bar' // 设置左侧三级tab栏的默认值'
    }
  },
  computed: {},
  watch: {},
  created () {
    this.nodeDrag()
  },
  inject: ['canvasInst'],
  mounted () {
  },
  methods: {
    nodeDrag () {
      this.$nextTick(() => {
        const nodes = document.querySelectorAll('.drag-node-com')
        nodes.forEach((node) => {
          node.addEventListener('dragstart', (event) => {
            const type = node.getAttribute('data-type')
            const element = getNodeByTree(this.menu.children, type, 'type')
            /* 设置拖拽传输数据 */
            event.dataTransfer.setData(
              'dragComponent',
              JSON.stringify({
                ...element,
                offsetX: event.offsetX,
                offsetY: event.offsetY
              })
            )
          })
        })
        // 阻止默认动作
        document.addEventListener(
          'drop',
          (e) => {
            e.preventDefault()
          },
          false
        )
      })
    },
    // 左侧组件列表点击添加组件
    elementClickHandler (element) {
      if (element.disabled) {
        this.$message.warning('组件正在开发中...')
      } else {
        this.canvasInst.addChart(element, 'add')
      }
    },
    // 点击关闭按钮关闭tab面板
    closePanel () {
      this.$emit('closePanel')
    }
  }
}
</script>

<style scoped lang="scss">
//一级tabs样式
.dataroom-bigscreen-component-library-wrap{
  height:100%;
  color: #a3a3a3;
  .first-tabs-content-top{
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ededed;
    padding: 0 16px;
    box-sizing: border-box;
    .top-left{
      font-size: 12px;
      color: #1a1a1a;
    }
    .top-right{
      .top-right-icon{
        font-size: 12px;
        padding: 0 5px;
        color: #a3a3a3;
      }
      .el-icon-close{
        &:hover{
          cursor: pointer;
        }
      }
    }
  }
  .first-tabs-content-bottom{
    height:100%;
    .menu-slot{
      font-size: 12px;
    }
    //二级tabs样式
    .second-tabs{
      height: 100% !important;

      .item-second-panel{
        height: 100% !important;
        background-color: #F7F7F7;
        padding: 18px;
      }
      ::v-deep .el-tabs__header{
        width: 40px !important;
        padding-top: 10px;
        border: none!important;
      }
      ::v-deep .el-tabs__nav-wrap::after {
        background-color: transparent!important;
      }
      ::v-deep .el-tabs__nav-wrap.is-left{
       margin: 0!important;
      }
      ::v-deep .el-tabs__content{
        width: 260px!important;
        //padding: 18px;
        box-sizing: border-box;
        .bottom-pane-content{
          width: 220px;
          height: 145px;
          margin-bottom: 12px;
          box-sizing: border-box;
          background-color: #ffffff;
          padding: 8px;
          &:hover{
            background-color: #f2f2f2;
          }
          .bottom-pane-content-title{
            width: 100%;
            height: 24px;
            font-size: 12px;
          }
          .bottom-pane-content-img{
            width: 100%;
            height: calc(100% - 24px);
            position: relative;
            padding: 0 8px 4px;
            box-sizing: border-box;
            img{
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }
        }
      }
      ::v-deep .el-tabs__item{
        height: 30px !important;
        margin-bottom: 8px!important;
      }
      ::v-deep .el-tabs__item.is-active{
        color: #1A1A1A!important;
      }
    }
    //三级tabs样式
    .third-tabs{
      height: 100% !important;
      background-color: #F7F7F7;
      ::v-deep .el-tabs__item{
        display: flex;
        align-items: center;
        justify-content: center;
      }
      ::v-deep .el-tabs__nav-wrap::after {
        background-color: transparent!important;
      }
      .menu-slot{
        width: 46px;
        height: 25px;
        text-align: center;
        line-height: 25px;
        font-size: 12px;
        padding: 0 3px;
        color: #a3a3a3;
        &:hover{
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
      .active-title{
        color: #1a1a1a;
        background-color: #ffffff;
      }
      ::v-deep .el-tabs__header{
        width: 50px !important;
        margin-left: 8px;
      }
      ::v-deep .el-tabs__content{
        width: 200px!important;
        padding: 12px!important;
        box-sizing: border-box;
        .bottom-pane-content{
          width: 100%;
          height: 118px;
          margin-bottom: 12px;
          box-sizing: border-box;
          background-color: var(--bs-background-2);
          padding: 8px;
          .bottom-pane-content-title{
            width: 100%;
            height: 24px;
            font-size: 12px;
          }
          .bottom-pane-content-img{
            width: 100%;
            height: calc(100% - 30px);
            position: relative;
            padding: 0;
            box-sizing: border-box;
            img{
              width: 100%;
              height: 100%;
              object-fit: fill;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
