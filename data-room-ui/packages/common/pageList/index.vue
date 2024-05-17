<template>
  <div class="dataroom-page-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-input
          v-model="searchKey"
          class="bs-el-input bs-el-input-search"
          placeholder="请输入页面名称"
          prefix-icon="el-icon-search"
          clearable
          @clear="reSearch"
          @keyup.enter.native="reSearch"
        />
        <el-select
          v-model="typeParams"
          class="bs-el-select"
          placeholder="请选择页面类型"
          popper-class="bs-el-select"
          @change="reSearch"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button
          type="primary"
          @click="reSearch"
        >
          搜索
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
          class="big-screen-card-wrap"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
          @click="addPage"
        >
          <div class="big-screen-card-inner big-screen-card-inner-add">
            <div class="add-big-screen-card">
              <div class="add-big-screen-card-inner">
                <div class="add-big-screen-card-text">
                  新增页面
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
                    @click="visit(screen)"
                  >
                    <span>访问</span>
                  </div>
                  <div
                    class="circle"
                    @click="design(screen)"
                  >
                    <span>设计</span>
                  </div>
                  <div
                    class="circle"
                    @click="edit(screen)"
                  >
                    <span>编辑</span>
                  </div>
                  <div
                    class="circle"
                    @click="copy(screen)"
                  >
                    <span>复制</span>
                  </div>
                  <div
                    class="circle"
                    @click="del(screen)"
                  >
                    <span>删除</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="big-screen-card-img">
              <div class="big-screen-type">
                {{ typeDesc[screen.type] }}
              </div>
              <el-image
                :src="getCoverPicture(screen.coverPicture)"
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

    <!-- 新增或编辑弹窗 -->
    <EditForm
      ref="EditForm"
      @refreshData="reSearch"
    />
  </div>
</template>
<script>
import { pageMixins } from '@gcpaas/data-room-ui/packages/js/mixins/page'
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'
import EditForm from './EditForm.vue'
import { copyPage, delPage, getPageList } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
export default {
  name: 'PageList',
  mixins: [pageMixins],
  props: {
    catalogInfo: {
      type: Object,
      default: () => { }
    }
  },
  components: { EditForm },
  data () {
    return {
      options: [
        {
          label: '全部', value: 'bigScreen,dashboard,appDashboard'
        },
        {
          label: '大屏', value: 'bigScreen'
        },
        {
          label: 'PC仪表盘', value: 'dashboard'
        },
        {
          label: '移动仪表盘', value: 'appDashboard'
        }
      ],
      typeParams: 'bigScreen,dashboard,appDashboard',
      typeDesc: {
        bigScreen: '大屏',
        dashboard: 'PC仪表盘',
        appDashboard: '移动仪表盘'
      },
      templateLoading: false,
      searchKey: '',
      list: [],
      loading: false
    }
  },
  computed: {
    catalogCode () {
      return this.catalogInfo?.page?.code
    },
    gridComputed () {
      return this.list.length > 2
    }
  },
  watch: {
    catalogCode () {
      this.getDataList()
    }
  },
  mounted () {
    this.getDataList()
  },
  methods: {
    getDataList () {
      this.loading = true
      getPageList({
        parentCode: this.catalogCode || null,
        current: this.current,
        size: this.size,
        searchKey: this.searchKey,
        type: this.typeParams// 查数据时将需要的页面类型拼接
      })
        .then((data) => {
          this.list = data.list
          this.totalCount = data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
    },
    visit (screen) {
      let path = ''
      switch (screen.type) {
        case 'bigScreen':
          path = window.SITE_CONFIG.dataRoom?.routers?.bigScreenPreviewUrl || '/big-screen/preview'
          break
        case 'dashboard':
          path = window.SITE_CONFIG.dataRoom?.routers?.dashBoardPreviewUrl || '/dash-bord/preview'
          break
        case 'appDashboard':
          path = window.SITE_CONFIG.dataRoom?.routers?.dashBoardPreviewUrl || '/dash-bord/preview'
          break
        default:
          path = window.SITE_CONFIG.dataRoom?.routers?.bigScreenPreviewUrl || '/big-screen/preview'
      }
      const { href } = this.$router.resolve({
        path,
        query: {
          code: screen.code,
          isVisit: true
        }
      })
      window.open(href, '_blank')
    },
    design (screen) {
      let path = ''
      switch (screen.type) {
        case 'bigScreen':
          path = window.SITE_CONFIG.dataRoom?.routers?.bigScreenDesignUrl || '/big-screen/design'
          break
        case 'dashboard':
          path = window.SITE_CONFIG.dataRoom?.routers?.dashBoardDesignUrl || '/dash-bord/design'
          break
        case 'appDashboard':
          path = window.SITE_CONFIG.dataRoom?.routers?.dashBoardDesignUrl || '/dash-bord/design'
          break
        default:
          path = window.SITE_CONFIG.dataRoom?.routers?.bigScreenDesignUrl || '/big-screen/design'
      }
      this.$router.push({
        path,
        query: {
          code: screen.code
        }
      })
    },
    addPage () {
      const page = {
        code: '',
        type: 'bigScreen'
      }
      this.$refs.EditForm.init(page, this.catalogInfo.page)
    },
    edit (screen) {
      this.$refs.EditForm.init(screen, this.catalogInfo.page)
    },
    del (screen) {
      this.$confirm('确定删除该页？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          delPage(screen.code)
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
      this.$confirm('确定复制该页面？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          copyPage(screen.code)
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
      if (url.startsWith('data:image/')) {
        // 如果是Base64格式，则直接返回URL
        return url
      } else {
        // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
        return getFileUrl(url)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/pageList.scss';
</style>
