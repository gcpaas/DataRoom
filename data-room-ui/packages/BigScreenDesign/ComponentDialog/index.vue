<template>
  <el-dialog
    title="组件库"
    :visible.sync="dialogVisible"
    width="80%"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
    @closed="close"
  >
    <div class="content">
      <el-tabs v-model="activeName">
        <el-tab-pane
          label="自定义组件"
          name="combination"
        >
          <div class="big-screen-list-wrap">
            <div class="top-search-wrap">
              <el-select
                v-model="code"
                class="bs-el-select"
                popper-class="bs-el-select"
                placeholder="请选择分组"
                filterable
                clearable
                @change="reSearch"
              >
                <el-option
                  v-for="item in options"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
              <el-input
                v-model="searchKey"
                class="bs-el-input"
                placeholder="请输入组件名称"
                prefix-icon="el-icon-search"
                clearable
                @clear="reSearch"
                @keyup.enter.native="reSearch"
              />
              <el-button
                type="primary"
                @click="reSearch"
              >
                搜索
              </el-button>
            </div>
            <div
              v-if="list.length !== 0"
              v-loading="loading"
              class="list-wrap bs-scrollbar"
              element-loading-text="加载中"
              :style="{
                display: gridComputed ? 'grid' : 'flex',
                justifyContent: gridComputed ? 'space-around' : 'flex-start',
                height: 'calc(100vh - 430px)'
              }"
            >
              <!-- <div v-if="list.length !== 0"> -->
              <div
                v-for="screen in list"
                :key="screen.id"
                class="big-screen-card-wrap"
                :style="{
                  width: gridComputed ? 'auto' : '290px'
                }"
                @click="chooseComponent(screen)"
              >
                <div
                  :class="focus.id == screen.id ? 'focus' : ''"
                  class="big-screen-card-inner"
                >
                  <div class="big-screen-card-img">
                    <el-image
                      :src="screen.coverPicture"
                      fit="contain"
                      style="width: 100%; height: 100%"
                    >
                      <div
                        slot="placeholder"
                        class="image-slot"
                      >
                        加载中···
                      </div>
                      <div
                        slot="error"
                        class="image-slot"
                        style="font-size: 20px"
                      >
                        <div class="error-img-text">
                          {{ screen.name }}
                        </div>
                      </div>
                    </el-image>
                  </div>
                  <div class="big-screen-bottom">
                    <div
                      class="left-bigscreen-title"
                      :title="screen.name"
                    >
                      {{ screen.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="empty"
            >
              暂无数据
            </div>
            <div class="footer-pagination-wrap">
              <div class="bs-pagination">
                <el-pagination
                  class="bs-el-pagination"
                  popper-class="bs-el-pagination"
                  background
                  layout="total, prev, pager, next, sizes"
                  :page-size="size"
                  prev-text="上一页"
                  next-text="下一页"
                  :total="totalCount"
                  :page-sizes="[10, 20, 50, 100]"
                  :current-page="current"
                  @current-change="currentChangeHandle"
                  @size-change="sizeChangeHandle"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="业务组件"
          name="bizComponent"
        >
          <div class="big-screen-list-wrap">
            <div class="top-search-wrap">
              <el-select
                v-model="code"
                class="bs-el-select"
                popper-class="bs-el-select"
                placeholder="请选择分组"
                filterable
                clearable
                @change="reSearch"
              >
                <el-option
                  v-for="item in options"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
              <el-input
                v-model="name"
                class="bs-el-input"
                placeholder="请输入组件名称"
                prefix-icon="el-icon-search"
                clearable
                @clear="reSearch"
                @keyup.enter.native="reSearch"
              />
              <el-button
                type="primary"
                @click="reSearch"
              >
                搜索
              </el-button>
            </div>
            <div
              v-if="bizComponentList.length !== 0"
              v-loading="loading"
              class="list-wrap bs-scrollbar"
              element-loading-text="加载中"
              :style="{
                display: bizFridComputed ? 'grid' : 'flex',
                justifyContent: bizFridComputed ? 'space-around' : 'flex-start',
                height: 'calc(100vh - 430px)'
              }"
            >
              <!-- <div v-if="list.length !== 0"> -->
              <div
                v-for="screen in bizComponentList"
                :key="screen.id"
                class="big-screen-card-wrap"
                :style="{
                  width: bizFridComputed ? 'auto' : '290px'
                }"
                @click="chooseComponent(screen)"
              >
                <div
                  :class="focus.id == screen.id ? 'focus' : ''"
                  class="big-screen-card-inner"
                >
                  <div class="big-screen-card-img">
                    <el-image
                      :src="screen.coverPicture"
                      fit="contain"
                      style="width: 100%; height: 100%"
                    >
                      <div
                        slot="placeholder"
                        class="image-slot"
                      >
                        加载中···
                      </div>
                      <div
                        slot="error"
                        class="image-slot"
                        style="font-size: 20px"
                      >
                        <div class="error-img-text">
                          {{ screen.name }}
                        </div>
                      </div>
                    </el-image>
                  </div>
                  <div class="big-screen-bottom">
                    <div
                      class="left-bigscreen-title"
                      :title="screen.name"
                    >
                      {{ screen.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="empty"
            >
              暂无数据
            </div>
            <div class="footer-pagination-wrap">
              <div class="bs-pagination">
                <el-pagination
                  class="bs-el-pagination"
                  popper-class="bs-el-pagination"
                  background
                  layout="total, prev, pager, next, sizes"
                  :page-size="size"
                  prev-text="上一页"
                  next-text="下一页"
                  :total="bizComponenTotalCount"
                  :page-sizes="[10, 20, 50, 100]"
                  :current-page="current"
                  @current-change="currentChangeHandle"
                  @size-change="sizeChangeHandle"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="系统组件"
          name="remote"
        >
          <div class="big-screen-list-wrap">
            <div
              v-if="remoteComponentlist.length !== 0"
              class="list-wrap bs-scrollbar"
              :style="{
                display: remoteComponentsGridComputed ? 'grid' : 'flex',
                justifyContent: remoteComponentsGridComputed ? 'space-around' : 'flex-start',
                height: 'calc(100vh - 385px)'
              }"
            >
              <div
                v-for="component in remoteComponentlist"
                :key="component.title"
                class="big-screen-card-wrap"
                :style="{
                  width: remoteComponentsGridComputed ? 'auto' : '290px'
                }"
                @click="chooseComponent(component)"
              >
                <div
                  :class="component.title == focus.title ? 'focus' : ''"
                  class="big-screen-card-inner"
                >
                  <div class="big-screen-card-img">
                    <el-image
                      :src="component.img"
                      fit="contain"
                      style="width: 100%; height: 100%"
                    >
                      <div
                        slot="placeholder"
                        class="image-slot"
                      >
                        加载中···
                      </div>
                    </el-image>
                  </div>
                  <div class="big-screen-bottom">
                    <div
                      class="left-bigscreen-title"
                      :title="component.title"
                    >
                      {{ component.title }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="empty"
            >
              暂无数据
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="dialogVisible = false"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="confirm"
      >
        确定
      </el-button>
      <el-button
        type="primary"
        @click="jumpto"
      >
        组件管理
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import * as echarts from 'echarts'
import { displayOption } from 'data-room-ui/js/config'
import { pageMixins } from 'data-room-ui/js/mixins/page'
// import _ from 'lodash'
import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'
import innerRemoteComponents, { getRemoteComponents, getRemoteComponentConfig } from 'data-room-ui/RemoteComponents/remoteComponentsList'
import { getBizComponentPage } from 'data-room-ui/js/api/bigScreenApi'
export default {
  name: 'ComponentDialog',
  mixins: [pageMixins],
  props: {},
  data () {
    return {
      dialogVisible: false,
      loading: false,
      options: [], // 分组列表
      code: '',
      focus: -1,
      list: [],
      searchKey: '',
      name: '', // 业务组件搜索关键字
      activeName: 'combination',
      remoteComponentlist: [],
      // 业务组件列表
      bizComponentList: [],
      bizComponenTotalCount: 0
    }
  },
  computed: {
    gridComputed () {
      return this.list.length > 3
    },
    remoteComponentsGridComputed () {
      return this.remoteComponentlist.length > 3
    },
    bizFridComputed () {
      return this.bizComponentList.length > 3
    }
  },
  watch: {
    activeName () {
      this.getCatalogList()
      this.current = 1
      this.size = 10
      this.getDataList()
    }
  },
  mounted () {
    this.remoteComponentlist = [...innerRemoteComponents, ...getRemoteComponents()]
  },
  methods: {
    jumpto () {
      const { href } = this.$router.resolve('/dataRoom-redirect?edit=component')
      window.open(href, '_blank')
    },
    chooseComponent (component) {
      this.focus = cloneDeep(component)
    },
    close () { },
    init () {
      this.dialogVisible = true
      this.current = 1
      this.searchKey = ''
      this.code = ''
      this.focus = -1
      this.getDataList()
      this.getCatalogList()
    },
    // 点击确定
    confirm () {
      this.dialogVisible = false
      if (this.activeName === 'combination') {
        if (Object.keys(this.focus).length) {
          this.$emit('setComponent', this.focus)
        }
      } else if (['remote'].includes(this.activeName)) {
        if (isEmpty(this.focus)) {
          return
        }
        this.$emit('setRemoteComponent', this.focus)
      } if (['bizComponent'].includes(this.activeName)) {
        let config = {
          setting: [],
          option: {}
        }
        if (isEmpty(this.focus)) {
          return
        }
        config.code = this.focus.code
        config.name = this.focus.name
        config = cloneDeep(getRemoteComponentConfig(this.focus.code, this.focus.name))
        const settingContent = cloneDeep(this.resolveStrSetting(this.focus.settingContent))
        config.setting = settingContent.setting
        config.option = settingContent.option
        config.optionHandler = settingContent.optionHandler
        console.log(config)
        this.$emit('setRemoteComponent', config)
        // config = getRemoteComponentConfig(this.focus.code, this.focus.name)
        // this.$emit('setRemoteComponent', config)
      }
    },
    getDataList () {
      if (this.activeName === 'combination') {
        this.loading = true
        this.$dataRoomAxios.get('/bigScreen/design/page', {
          parentCode: this.code || null,
          current: this.current,
          size: this.size,
          searchKey: this.searchKey,
          type: 'component'
        })
          .then((data) => {
            this.loading = false
            this.list = data.list
            this.totalCount = data.totalCount
          })
          .catch(() => {
            this.loading = false
          })
      } else if (this.activeName === 'bizComponent') {
        this.loading = true
        getBizComponentPage({
          parentCode: this.code || null,
          current: this.current,
          size: this.size,
          searchKey: this.searchKey,
          name: this.name
        })
          .then((data) => {
            this.loading = false
            this.bizComponentList = data.list
            this.bizComponenTotalCount = data.totalCount
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    /**
     * 处理当前组件的字符串配置
     */
    resolveStrSetting (settingContent) {
      // eslint-disable-next-line prefer-const
      let option = {}
      // eslint-disable-next-line prefer-const
      let setting = []
      // eslint-disable-next-line prefer-const, no-unused-vars
      let title = []
      // eslint-disable-next-line prefer-const, no-unused-vars
      let data = []
      // eslint-disable-next-line prefer-const, no-unused-vars
      let optionHandler = ''
      // eslint-disable-next-line prefer-const
      settingContent = settingContent.replaceAll('const ', '')
      // 去掉 export default及后面代码
      settingContent = settingContent.replace(/export default[\s\S]*/, '')
      eval(settingContent)
      option = {
        data,
        displayOption,
        ...option
      }
      return {
        option,
        setting,
        optionHandler
      }
    },
    // 获取目录的列表
    getCatalogList () {
      const url = this.activeName === 'combination' ? '/bigScreen/type/list/componentCatalog' : '/bigScreen/type/list/bizComponentCatalog'
      this.$dataRoomAxios.get(url)
        .then((data) => {
          this.options = data
        })
        .catch(() => { })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
.content{
  height: calc(100vh - 290px);
}
.big-screen-list-wrap {
  .el-select {
    display: inline-block !important;
    position: relative !important;
    width: auto !important;
  }

  position: relative;
  height: 100%;
  // margin:0 16px;
  // padding: 16px;
  margin-bottom: 56px;
  color: #9ea9b2;
  background-color: var(--bs-background-2) !important;

  .top-search-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;

    .el-input {
      width: 200px;
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: var(--bs-background-1) !important;
      }
    }

    .el-select {
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: var(--bs-background-1) !important;
      }
    }
  }

  .list-wrap {
    /* display: grid; */
    overflow: auto;
    // 间隙自适应
    justify-content: space-around;
    // max-height: calc(100vh - 270px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 15px;
    .big-screen-card-wrap {
      position: relative;
      height: 230px;
      cursor: pointer;

      &:hover {
        .screen-card__hover {
          height: 180px;
        }
      }

      .screen-card__hover {
        position: absolute;
        z-index: 999;
        top: 0;
        right: 0;
        left: 0;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        height: 0;
        transition: height 0.4s;
        background: #00000099;
      }

      .focus {
        color: var(--bs-el-text) !important;
        border: 1px solid var(--bs-el-color-primary) !important;
      }

      .big-screen-card-inner {
        overflow: hidden;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background-color: var(--bs-background-2);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        color: var(--bs-el-title);
        border: 1px solid var(--bs-background-1);

        &:hover {
          color: var(--bs-el-text);
          border: 1px solid var(--bs-el-color-primary);
        }

        .add-big-screen-card-text {
          color: var(--bs-el-color-primary);
          font-size: 24px;
        }

        .big-screen-card-img {
          width: 100%;
          height: 180px;

          img {
            width: 100%;
            height: 100%;

            object-fit: cover;
          }

          ::v-deep .image-slot {
            height: 100%;
            background-color: var(--bs-background-2);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          ::v-deep .el-image__error {
            background-color: #1d1d1d;
          }
        }

        .big-screen-bottom {
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: space-between;
          box-sizing: border-box;
          width: 100%;
          /*height: 26px;*/
          padding: 0 10px;
          height: calc(100% - 180px);
          color: var(--bs-el-title);
          background-color: var(--bs-background-2);

          .left-bigscreen-title {
            font-size: 14px;
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .right-bigscreen-time-title {
            font-size: 14px;
            overflow: hidden;
            width: 140px;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .big-screen-card-text {
          font-size: 14px;
          padding: 10px;
          text-align: center;
          color: #333;
        }
      }

      .big-screen-card-inner-add {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .el-loading-parent--relative {
    position: unset !important;
  }

  .footer-pagination-wrap {
    margin-top: 16px;
    position: absolute;
    width: 100%;
  }
}

.bs-pagination {
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}

.empty {
  width: 100%;
  height: 70%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .el-tabs__item {
  color: var(--bs-el-text);
}

.error-img-text {
  overflow: hidden;
  padding: 0 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}

::v-deep .el-tabs__nav-wrap {
  &:after {
    display: none;
  }
}
.empty{
  height: calc(100vh - 430px);
}
</style>
