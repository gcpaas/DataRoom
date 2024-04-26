<template>
  <div class="big-screen-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-select
          v-if="catalogInfo !== 'system'"
          v-model="catalogCode"
          class="bs-el-select"
          popper-class="bs-el-select"
          placeholder="请选择分组"
          filterable
          clearable
          @change="reSearch"
        >
          <el-option
            v-for="item in catalogList"
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
        <el-button
          v-if="catalogInfo !== 'system'"
          type="primary"
          @click="catalogManage"
        >
          分组管理
        </el-button>
      </div>
      <div
        v-loading="loading"
        class="list-wrap bs-scrollbar"
        element-loading-text="加载中"
        :style="{
          display: gridComputed ? 'grid' : 'flex',
          justifyContent: gridComputed ? 'space-around' : 'flex-start'
        }"
      >
        <!-- 第一个是新增大屏卡片 -->
        <div
          v-if="catalogInfo !== 'system'"
          class="big-screen-card-wrap"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
          @click="add"
        >
          <div class="big-screen-card-inner big-screen-card-inner-add">
            <div class="add-big-screen-card">
              <div class="add-big-screen-card-inner">
                <div class="add-big-screen-card-text">
                  新增组件
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 后面遍历 list -->
        <div
          v-for="screen in list"
          :key="screen.id"
          class="big-screen-card-wrap"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
        >
          <div class="big-screen-card-inner">
            <div class="screen-card__hover">
              <div class="screen-card__hover-box">
                <div class="preview">
                  <div
                    class="screen-card__oper-label circle"
                    @click="preview(screen)"
                  >
                    <span>预览</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="design(screen)"
                  >
                    <span>设计</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="edit(screen)"
                  >
                    <span>编辑</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="copy(screen)"
                  >
                    <span>复制</span>
                  </div>
                  <div
                    v-if="catalogInfo !== 'system'"
                    class="circle"
                    @click="del(screen)"
                  >
                    <span>删除</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="big-screen-card-img">
              <el-image
                :src="catalogInfo !== 'system' ? getCoverPicture(screen.coverPicture) : screen.img"
                fit="fill"
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
                    {{ catalogInfo !== 'system' ? screen.name : screen.title }}
                  </div>
                </div>
              </el-image>
            </div>
            <div class="big-screen-bottom">
              <div
                class="left-bigscreen-title"
                :title="catalogInfo !== 'system' ? screen.name : screen.title"
              >
                {{ catalogInfo !== 'system' ? screen.name : screen.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="catalogInfo !== 'system'"
        class="footer-pagination-wrap"
      >
        <!-- <div class="footer-pagination-wrap-text">
        总共 {{ totalCount }} 个项目
      </div> -->
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
    <!-- 新增或编辑弹窗 -->
    <EditForm
      v-if="catalogInfo !== 'system'"
      ref="EditForm"
      :type="catalogInfo"
      @refreshData="reSearch"
    />
    <CatalogEditForm
      v-if="catalogInfo !== 'system'"
      ref="CatalogEditForm"
      :catalog-type="catalogType"
      @updateCatalogList="updateCatalogList"
    />
  </div>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
import { getFileUrl } from 'data-room-ui/js/utils/file'
import EditForm from './EditForm.vue'
import CatalogEditForm from './CatalogEditForm'
import innerRemoteComponents, { getRemoteComponents } from 'data-room-ui/RemoteComponents/remoteComponentsList'
export default {
  name: 'BigScreenList',
  mixins: [pageMixins],
  props: {
    catalogInfo: {
      type: String,
      default: ''
    }
  },
  components: { EditForm, CatalogEditForm },
  data () {
    return {
      name: '',
      catalogVisible: false,
      templateLoading: false,
      searchKey: '',
      list: [],
      loading: false,
      catalogList: [], // 分组列表
      catalogCode: ''
    }
  },
  computed: {
    catalogType () {
      if (this.catalogInfo === 'component') {
        return 'componentCatalog'
      } else {
        return 'bizComponentCatalog'
      }
    },
    code () {
      return ''
    },
    gridComputed () {
      return this.list.length > 2
    }
  },
  watch: {
    catalogInfo () {
      this.reset()
      this.init()
    },
    catalogCode (value) {
      this.reSearch()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    reset () {
      this.searchKey = ''
      this.current = 1
      this.size = 10
      this.catalogCode = ''
      this.init()
    },
    init () {
      if (this.catalogInfo !== 'system') {
        this.getDataList()
        this.getCatalogList()
      } else {
        this.list = []
        this.list = [...innerRemoteComponents, ...getRemoteComponents()]
      }
    },
    updateCatalogList (list) {
      this.catalogList = list
    },
    reSearch () {
      if (this.catalogInfo !== 'system') {
        this.current = 1
        this.getDataList()
      } else {
        const arr = [...innerRemoteComponents, ...getRemoteComponents()]
        this.list = arr?.filter((item) => item.title.indexOf(this.searchKey) !== -1)
      }
    },
    catalogManage () {
      this.$refs.CatalogEditForm.formVisible = true
    },
    // 获取分组列表
    getCatalogList () {
      this.$dataRoomAxios.get(`/bigScreen/type/list/${this.catalogType}`)
        .then((data) => {
          this.catalogList = data
        })
        .catch(() => { })
    },
    getDataList () {
      this.loading = true
      if (this.catalogInfo === 'component') {
        this.$dataRoomAxios.get('/bigScreen/design/page', {
          parentCode: this.catalogCode || null,
          current: this.current,
          size: this.size,
          searchKey: this.searchKey,
          type: 'component'
        })
          .then((data) => {
            this.list = data.list
            this.totalCount = data.totalCount
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        this.$dataRoomAxios.get('/bigScreen/bizComponent/page', {
          current: this.current,
          size: this.size,
          // searchKey: this.searchKey,
          name: this.searchKey,
          type: this.catalogCode || null
        })
          .then((data) => {
            this.list = data.list
            this.totalCount = data.totalCount
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    preview (screen) {
      let path = ''
      let query = {
        code: screen.code
      }
      if (this.catalogInfo === 'component') {
        path = (window.BS_CONFIG?.routers?.previewUrl || '/big-screen/preview')
      } else {
        path = (window.BS_CONFIG?.routers?.bizComponentPreviewUrl || 'big-screen-biz-component-preview')
      }
      if (this.catalogInfo === 'system') {
        query = {
          dirName: screen.customize.vueSysComponentDirName
        }
      }
      const { href } = this.$router.resolve({
        path, // 这里写的是要跳转的路由地址
        query
      })
      window.open(href, '_blank')
    },
    design (screen) {
      const path = this.catalogInfo === 'component' ? (window.BS_CONFIG?.routers?.designUrl || '/big-screen/design') : (window.BS_CONFIG?.routers?.bizComponentDesignUrl || 'big-screen-biz-component-design')
      // const { href } = this.$router.resolve({
      //   path,
      //   query: {
      //     code: screen.code
      //   }
      // })
      // 新窗口打开
      // window.open(href, '_self')
      this.$router.push({
        path,
        query: {
          code: screen.code
        }
      })
    },
    add () {
      const page = {
        code: '',
        type: this.catalogInfo === 'component' ? 'bigScreen' : 'bizComponent'
      }
      this.$refs.EditForm.init(page, this.catalogCode)
    },
    edit (screen) {
      this.$refs.EditForm.init(screen, this.catalogCode)
    },
    del (screen) {
      this.$confirm('确定删除该组件', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          const url = this.catalogInfo === 'component' ? `/bigScreen/design/delete/${screen.code}` : `/bigScreen/bizComponent/delete/${screen.id}`
          this.$dataRoomAxios.post(url)
            .then(() => {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.getDataList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            })
        })
        .catch()
    },
    copy (screen) {
      const url = this.catalogInfo === 'component' ? `/bigScreen/design/copy/${screen.code}` : `/bigScreen/bizComponent/copy/${screen.code}`
      this.$confirm('确定复制该组件', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(url)
            .then(() => {
              this.$message({
                type: 'success',
                message: '复制成功'
              })
              this.getDataList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '复制失败!'
              })
            })
        })
        .catch((e) => {
          console.error(e)
        })
    },
    /**
     * 获取封面图片,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture (url) {
      return getFileUrl(url)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/bsTheme.scss';

.big-screen-list-wrap {
  .el-select {
    display: inline-block !important;
    position: relative !important;
    width: auto !important;
  }

  position: relative;
  height: 100%;
  // padding: 16px;
  // margin:0 16px;
  margin-left: 16px;
  color: #9ea9b2;
  background-color: var(--bs-background-2) !important;

  .internal-box {
    height: calc(100% - 32px);
    padding: 16px;
  }

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
    padding-right: 5px;
    // 间隙自适应
    justify-content: space-around;
    // max-height: calc(100vh - 304px);
    max-height: calc(100% - 90px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 15px;
    padding-bottom: 10px;
    // ::v-deep .el-loading-mask {
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   height: calc(100vh - 260px) !important;
    //   z-index: 999;
    //   top: 50px;
    // }

    .big-screen-card-wrap {
      position: relative;
      height: 180px;
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

        .screen-card__hover-box {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #00000080;
          display: flex;
          overflow: hidden;
          align-items: center;
          justify-content: center;
        }

        .preview {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          width: 100%;
          cursor: pointer;
          color: var(--bs-el-color-primary);

          .circle {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid var(--bs-el-color-primary);
            border-radius: 50%;

            &:hover {
              color: #fff;
              background: var(--bs-el-color-primary);
            }

            span {
              font-size: 12px;
            }
          }
        }
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
          height: 150px;

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
          height: calc(100% - 150px);
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

    position: absolute;
    bottom: 16px;
    right: 16px;
  }

  .error-img-text {
    overflow: hidden;
    padding: 0 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }
}

.bs-pagination {
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}
</style>
