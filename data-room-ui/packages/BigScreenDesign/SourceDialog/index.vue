<template>
  <el-dialog
    title="资源库"
    :visible.sync="dialogVisible"
    width="80%"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
    @closed="close"
  >
    <div class="content">
      <div class="big-screen-list-wrap">
        <div class="top-search-wrap">
          <el-input
            v-model="searchKey"
            class="bs-el-input"
            placeholder="请输入图片名称"
            prefix-icon="el-icon-search"
            clearable
            @clear="reSearch"
            @keyup.enter.native="reSearch"
          />
          <el-select
            v-model="code"
            class="bs-el-select"
            popper-class="bs-el-select"
            placeholder="请选择分组"
            clearable
            @change="reSearch"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.code"
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
          v-if="list.length !== 0"
          v-loading="loading"
          class="list-wrap bs-scrollbar"
          element-loading-text="加载中"
          :style="{
            display: gridComputed ? 'grid' : 'flex',
            justifyContent: gridComputed ? 'space-around' : 'flex-start',
            height: 'calc(100vh - 400px)',
            marginBottom: '38px'
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
            @click="chooseImg(screen)"
          >
            <div
              :class="focus.id == screen.id ? 'focus' : ''"
              class="big-screen-card-inner"
            >
              <div class="big-screen-card-img">
                <el-image
                  :src="getCoverPicture(screen.url)"
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
                  :title="screen.originalName"
                >
                  {{ screen.originalName }}
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
        资源管理
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
import cloneDeep from 'lodash/cloneDeep'
import { getFileUrl } from 'data-room-ui/js/utils/file'

export default {
  name: 'SourceDialog',
  mixins: [pageMixins],
  props: {
    imgUrl: {
      type: String,
      default: ''
    }
  },
  model: {
    prop: 'imgUrl',
    event: 'change'
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      options: [],
      code: '',
      focus: -1,
      list: [],
      searchKey: '',
      imgExtends: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico']
    }
  },
  computed: {
    gridComputed () {
      return this.list.length > 3
    }
  },
  mounted () { },
  methods: {
    jumpto () {
      const { href } = this.$router.resolve('/dataRoom-redirect?edit=source')
      window.open(href, '_blank')
    },
    chooseImg (img) {
      this.focus = cloneDeep(img)
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
    confirm () {
      this.dialogVisible = false
      if (this.focus !== -1) {
         this.$emit('change', this.focus)
        this.$emit('getImg', this.focus)
      }
    },
    getDataList () {
      this.loading = true
      this.$dataRoomAxios.get('/bigScreen/file', {
        module: this.code,
        current: this.current,
        size: this.size,
        // 资源库中只显示图片类型的文件
        extensionList: this.imgExtends,
        searchKey: this.searchKey
      })
        .then((data) => {
          this.list = data.list
          this.totalCount = data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 获取目录的列表
    getCatalogList () {
      this.$dataRoomAxios.get('/bigScreen/type/list/resourceCatalog')
        .then((data) => {
          this.options = data
        })
        .catch(() => { })
    },
    /**
     * 获取文件访问地址,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture (url) {
      return getFileUrl(url)
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
::v-deep .el-dialog__body{
  position: relative;
  min-height: 500px;
  padding: 0 16px 16px 16px !important;
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
  color: #9ea9b2;
  background-color: var(--bs-background-2) !important;

  .top-search-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: sticky;
    top: 0px;
    z-index: 999;
    padding: 16px 0;
    background-color: var(--bs-background-2);

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
        background: var(--bs-background-1) !important;
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
        border: 1px solid var(--bs-background-2);

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
}

.footer-pagination-wrap {
    bottom: 5px;
    right: 16px;
    width: 100%;
    margin-top: 16px;
    position: absolute;
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
</style>
