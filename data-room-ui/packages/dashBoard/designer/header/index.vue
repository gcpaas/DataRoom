<template>
  <div class="dataroom-dashboard-header-wrap data-room-header-wrap">
    <div class="logo-wrap item-wrap">
      <img
        class="menu-img"
        src="../../../assets/images/logo.png"
        alt="返回"
        @click="goBackManage"
      >
      <span
        class="logo-text name-span"
        @click="editName"
      >{{ pageName }}</span>
    </div>
    <div class="head-btn-group">
      <el-tooltip
        class="item"
        effect="dark"
        content="关闭右侧面板"
        placement="top"
        popper-class="dataroom-el-tooltip"
      >
        <CusBtn
          size="mini"
          @click="toggleRightPanel"
        >
          <i class="el-icon-s-unfold" />
        </CusBtn>
      </el-tooltip>
      <CusBtn @click="empty">
        清空
      </CusBtn>
      <CusBtn
        :loading="saveAndPreviewLoading"
        @click.native="execRun()"
      >
        <i class="el-icon-s-platform" />
        预览
      </CusBtn>
      <CusBtn
        :loading="saveLoading"
        @click="save"
      >
        保存
      </CusBtn>
      <CusBtn
        type="primary"
        :loading="saveAndPreviewLoading"
        @click.native="execRun()"
      >
        <i class="el-icon-s-promotion" />
        发布
      </CusBtn>
    </div>
    <PageNameEditDialog ref="pageNameEditDialog" />
  </div>
</template>
<script>
import { saveScreen } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
import PageNameEditDialog from './EditForm.vue'
import CusBtn from '@gcpaas/data-room-ui/packages/common/customBtn/index.vue'

export default {
  name: 'PageTopSetting',
  components: {
    CusBtn,
    PageNameEditDialog
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    rightFold: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      appInfo: '',
      saveLoading: false,
      createdImgLoading: false,
      saveAndPreviewLoading: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    chartList () {
      return this.canvasInst.chartList
    },
    pageCode () {
      return this.$route.query.code || this.code
    },
    pageInfo () {
      return this.canvasInst.pageInfo
    },
    pageName () {
      return this.pageInfo?.name || ''
    }
  },
  mounted () {
  },
  beforeDestroy () {
  },
  methods: {
    // 更换页面名称
    editName () {
      this.$refs.pageNameEditDialog.init()
    },
    goBackManage () {
      // 给出一个确认框提示，提示如下确定返回主页面吗？未保存的配置将会丢失。3个按钮 ：  留在页面 、离开页面、保存后离开页面
      this.$confirm('确定返回主页面吗？未保存的配置将会丢失。', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '保存后离开页面',
        cancelButtonText: '离开页面',
        cancelButtonClass: 'cancel-btn',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        this.save(true)
      }).catch((action) => {
        if (action === 'cancel') {
          this.$router.push({ path: '/' })
        }
      })
    },
    // 清空
    empty () {
      this.canvasInst.updateActiveChart('')
      this.$emit('empty')
    },
    // 预览
    execRun () {
      // 保存
      this.save({ isBack: false, isPreview: true }).then((res) => {
        this.preview()
      })
    },
    // 预览
    preview (previewCode) {
      const path = window?.SITE_CONFIG.dataRoom?.routers?.dashBoardPreviewUrl || '/dash-bord/preview'

      const { href } = this.$router.resolve({
        path,
        query: {
          code: previewCode || this.pageCode
        }
      })
      window.open(href, '_blank')
    },
    // 保存
    async save (params = { isBack: false, isPreview: false }) {
      return new Promise((resolve, reject) => {
        saveScreen({ ...this.pageInfo, isPreview: params.isPreview }).then(res => {
          this.$message.success('保存成功')
          resolve(res)
        }).catch(err => {
          reject(err)
        }).finally(() => {
          this.saveLoading = false
          if (params.isBack) {
            this.$router.push({ path: '/' })
          }
        })
      })
    },
    // 切换右侧面板显隐
    toggleRightPanel () {
      this.$emit('toggleRightPanel')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/header.scss';

</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
