<template>
  <el-dialog
    v-if="formVisible"
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="formVisible"
    :append-to-body="true"
    class="dataroom-page-list-edit-from-wrap dataroom-el-dialog"
    @close="closeAddDialog"
  >
    <el-form
      ref="dataForm"
      :model="dataForm"
      :rules="dataFormRules"
      label-position="right"
      label-width="100px"
      class="bs-el-form"
    >
      <el-form-item
        label=""
      >
        <div class="type-box">
          <div
            v-for="(item,index) in TypeList"
            :key="index"
            class="type-item-box"
            :class="{'active-item':dataForm.type===item.value}"
            @click="changeType(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="dataForm.name"
          autocomplete="off"
          placeholder="请输入名称"
          clearable
          maxlength="30"
          class="bs-el-input"
        />
      </el-form-item>
      <el-form-item
        v-if="isEdit"
        label="页面编码"
      >
        <el-input
          v-model="dataForm.code"
          style="width: 200px"
          readonly
          class="bs-el-input"
        />
        <el-button
          style="margin-left: 10px;"
          type="text"
          class="bs-el-button"
          @click="copyCode"
        >
          <i class="el-icon-document-copy" />
        </el-button>
      </el-form-item>
      <el-form-item
        v-if="dataForm.type ==='bigScreen'"
        label="推荐分辨率"
      >
        <el-select
          v-model="resolutionRatioValue"
          class="bs-el-select"
          popper-class="bs-el-select"
          placeholder="请选择分辨率"
          clearable
          @change="changeResolutionRatioValue"
        >
          <el-option
            v-for="resolutionRatioItem in resolutionRatioOptions"
            :key="resolutionRatioItem.value"
            :label="resolutionRatioItem.label"
            :value="resolutionRatioItem.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="dataForm.type ==='bigScreen'"
        label="页面宽度"
      >
        <el-input-number
          v-model="dataForm.pageConfig.w"
          :min="100"
          :max="8000"
          class="bs-el-input-number"
        />
      </el-form-item>
      <el-form-item
        v-if="dataForm.type ==='bigScreen'"
        label="页面高度"
      >
        <el-input-number
          v-model="dataForm.pageConfig.h"
          :min="100"
          :max="8000"
          class="bs-el-input-number"
        />
      </el-form-item>
      <el-form-item label="分组">
        <el-select
          v-model="dataForm.parentCode"
          class="bs-el-select"
          popper-class="bs-el-select"
          clearable
          filterable
        >
          <el-option
            v-for="catalogItem in catalogList"
            :key="catalogItem.id"
            :label="catalogItem.name"
            :value="catalogItem.code"
          />
        </el-select>
      </el-form-item>
      <!--      <el-form-item label="排序">-->
      <!--        <el-input-number-->
      <!--          v-model="dataForm.orderNum"-->
      <!--          :min="0"-->
      <!--          :max="30000"-->
      <!--          controls-position="right"-->
      <!--          class="bs-el-input-number"-->
      <!--        />-->
      <!--      </el-form-item>-->
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="closeAddDialog"
      >
        取消
      </el-button>
      <el-button
        v-if="isEdit"
        type="primary"
        :loading="toDesignLoading"
        :disabled="toDesignDisabled"
        @click="addOrUpdate(true)"
      >
        设计
      </el-button>
      <el-button
        type="primary"
        :loading="sureLoading"
        :disabled="sureDisabled"
        @click="addOrUpdate(!title)"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Icon from '@gcpaas/data-room-ui/packages/assets/images/dataSourceIcon/export'
import { addPage, checkPageName, getPageEditInfo, updatePage } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
import { getCatalogList } from '@gcpaas/data-room-ui/packages/js/api/sideMenuApi'

export default {
  name: 'EditForm',
  components: {},
  props: {},
  data () {
    return {
      className: {
        bigScreen: 'com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO',
        dashboard: 'com.gccloud.dataroom.core.module.manage.dto.DashboardPageDTO',
        appDashboard: 'com.gccloud.dataroom.core.module.manage.dto.AppDashboardPageDTO'
      },
      isEdit: false,
      resolutionRatioValue: '',
      catalogList: [],
      TypeList: [
        { // 页面类型
          label: '大屏',
          value: 'bigScreen'
        },
        {
          label: 'PC仪表盘',
          value: 'dashboard'
        }
        // {
        //   label: '移动仪表盘',
        //   value: 'appDashboard'
        // }
      ],
      resolutionRatioOptions: [
        {
          value: '1024*768',
          label: '1024*768'
        },
        {
          value: '1280*720',
          label: '1280*720'
        },
        {
          value: '1920*1080',
          label: '1920*1080'
        },
        {
          value: '2560*1440',
          label: '2560*1440'
        },
        {
          value: '3840*2160',
          label: '3840*2160'
        },
        {
          value: '5120*2880',
          label: '5120*2880'
        },
        {
          value: '7680*4320',
          label: '7680*4320'
        }
      ],
      formVisible: false,
      dataForm: {
        id: '',
        className: 'com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO',
        code: '',
        name: '',
        parentCode: '',
        chartList: [],
        icon: Icon.getNameList()[0],
        remark: '',
        iconColor: '#007aff',
        components: '',
        style: '',
        pageTemplateId: '',
        isPublish: 0,
        pageConfig: {
          w: 1920,
          h: 1080,
          bgColor: '#fff',
          lightBgColor: '#f5f7fa',
          opacity: 100,
          customTheme: 'dark',
          bg: null,
          lightBg: null,
          fitMode: 'cover'
        },
        type: 'bigScreen'
      },
      dataFormRules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          // 名称重复自定义校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                checkPageName({
                  name: value,
                  type: this.dataForm.type,
                  id: this.dataForm.id
                }).then((resp) => {
                  if (resp) {
                    callback(new Error('名称已存在'))
                  } else {
                    callback()
                  }
                })
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ]
      },
      sureLoading: false,
      toDesignLoading: false,
      sureDisabled: false,
      toDesignDisabled: false
    }
  },
  computed: {
    title () {
      return this.isEdit ? '编辑页面' : '新增页面'
    }
  },
  watch: {},
  mounted () {
  },
  methods: {
    // 清空表单配置
    resetForm () {
      this.$refs.dataForm.resetFields()
    },
    // 选择页面类型
    changeType (type) {
      this.dataForm.type = type
      this.dataForm.className = this.className[type]
      this.resolutionRatioValue = '1920*1080'
      this.changeResolutionRatioValue(this.resolutionRatioValue)
      this.resetForm()
      if (type === 'bigScreen') {
        this.dataForm.pageConfig.bgColor = 'rgba(21, 26, 38, 1)'
      } else if (type === 'dashboard') {
        this.dataForm.pageConfig.bgColor = '#F5F7FA'
      }
    },
    // 选择分辨率的w,h来得到推荐分辨率的值
    getResolutionRatioValue () {
      this.resolutionRatioValue = this.dataForm.pageConfig.w + '*' + this.dataForm.pageConfig.h
    },
    // 改变推荐分辨率
    changeResolutionRatioValue (val) {
      this.dataForm.pageConfig.w = val.split('*')[0]
      this.dataForm.pageConfig.h = val.split('*')[1]
    },
    // 关闭弹窗时
    closeAddDialog () {
      this.$refs.dataForm.resetFields()
      // 关闭弹窗去除页面缓存
      this.dataForm = {
        id: '',
        className: 'com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO',
        code: '',
        name: '',
        parentCode: '',
        chartList: [],
        icon: Icon.getNameList()[0],
        remark: '',
        iconColor: '#007aff',
        components: '',
        style: '',
        pageTemplateId: '',
        isPublish: 0,
        pageConfig: {
          w: 1920,
          h: 1080,
          bgColor: '#fff',
          lightBgColor: '#f5f7fa',
          opacity: 100,
          customTheme: 'dark',
          bg: null,
          lightBg: null,
          fitMode: 'auto'
        },
        type: 'bigScreen'
      }
      this.formVisible = false
    },
    // 发布或者下线
    publishOrOffline (isPublish) {
      const url = isPublish === 1 ? '/dataroom/design/offline' : '/dataroom/design/publish'
      this.$dataRoomAxios.get(`${url}/${this.dataForm.code}`).then((resp) => {
        this.$message({
          message: isPublish === 1 ? '下线成功' : '发布成功',
          type: 'success'
        })
        this.dataForm.isPublish = isPublish === 1 ? 0 : 1
      })
    },
    // 初始化
    init (nodeData, parentNode) {
      if (this.dataForm.type === 'bigScreen') {
        this.dataForm.pageConfig.bgColor = 'rgba(21, 26, 38, 1)'
      } else if (this.dataForm.type === 'dashboard') {
        this.dataForm.pageConfig.bgColor = '#F5F7FA'
      }
      this.isEdit = false
      // this.title = ''
      const code = nodeData ? nodeData.code : ''
      this.formVisible = true
      this.$nextTick(() => {
        getCatalogList('page').then((resp) => {
          this.catalogList = resp
        })
        if (code) {
          this.isEdit = true
          getPageEditInfo(code).then((resp) => {
            this.dataForm = {
              ...this.dataForm,
              ...resp
            }
            // const { w, h } = resp.pageConfig
            // this.resolutionRatioValue = `${w}*${h}`
            this.getResolutionRatioValue()
          })
        } else {
          this.dataForm.parentCode = parentNode.code
          this.getResolutionRatioValue()
        }
      })
    },
    // 点击确定时
    addOrUpdate (isToDesign = false) {
      this.addOrUpdatePage(isToDesign)
    },
    // 页面 新增/编辑
    async addOrUpdatePage (isToDesign) {
      this.$refs.dataForm.validate(async (valid) => {
        if (!valid) {
          return
        }
        const addOrUpdateHandel = this.isEdit
          ? (form) => updatePage(form)
          : (form) => addPage(form)
        if (isToDesign) {
          this.toDesignLoading = true
          this.sureDisabled = true
        } else {
          this.sureLoading = true
          this.toDesignDisabled = true
        }
        addOrUpdateHandel(this.dataForm)
          .then(() => {
            const message = this.isEdit ? '更新成功' : '新增成功'
            this.$message.success(message)
            this.$emit('refreshData')
            if (isToDesign) {
              this.toDesignLoading = false
              this.sureDisabled = false
              this.toDesign()
            } else {
              this.sureLoading = false
              this.toDesignDisabled = false
            }
          })
          .catch(() => {
            this.sureLoading = false
            this.toDesignLoading = false
            this.sureDisabled = false
            this.toDesignDisabled = false
          }).finally(() => {
            this.closeAddDialog()
          })
      })
    },
    // 跳转设计态
    toDesign () {
      this.$router.push({
        path: this.dataForm.type === 'bigScreen' ? window.SITE_CONFIG.dataRoom?.routers?.bigScreenDesignUrl || '/big-screen/design' : window.SITE_CONFIG.dataRoom?.routers?.dashBoardDesignUrl || '/dash-bord/design',
        query: {
          code: this.dataForm.code
        }
      })
    },
    /**
     * 复制页面编码
     */
    copyCode () {
      const code = this.dataForm.code
      navigator.clipboard
        .writeText(code)
        .then(() => {
          this.$message.success('复制成功')
        })
        .catch(err => {
          this.$message.error('复制失败，请手动复制')
          console.error(err)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';

.dataroom-page-list-edit-from-wrap {
  .type-box {
    display: flex;

    .type-item-box {
      width: 100px;
      height: 50px;
      background-color: #F7F7F7;
      margin-right: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;

      &:hover {
        cursor: pointer;
      }
    }

    .active-item {
      color: #007aff;
    }
  }

  /*滚动条样式*/
  ::v-deep ::-webkit-scrollbar {
    width: 6px;
    border-radius: 4px;
    height: 4px;
  }

  ::v-deep ::-webkit-scrollbar-thumb {
    background: #dddddd !important;
    border-radius: 10px;
  }
}

</style>
