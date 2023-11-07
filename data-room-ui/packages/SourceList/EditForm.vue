<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      :title="title ? '编辑' : '新增'"
      :visible.sync="formVisible"
      :append-to-body="true"
      class="bs-dialog-wrap bs-el-dialog"
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
          label="推荐分辨率"
        >
          <el-select
            v-model="resolutionRatioValue"
            class="bs-el-select"
            popper-class="bs-el-select"
            placeholder="请选择分辨率"
            clearable
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
          label="大屏宽度"
        >
          <el-input-number
            v-model="resolutionRatio.w"
            :min="100"
            :max="8000"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item
          label="大屏高度"
        >
          <el-input-number
            v-model="resolutionRatio.h"
            :min="100"
            :max="8000"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="dataForm.orderNum"
            :min="0"
            :max="30000"
            controls-position="right"
            class="bs-el-input-number"
          />
        </el-form-item>
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
          v-if="title"
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
  </div>
</template>

<script>
import Icon from 'data-room-ui/assets/images/dataSourceIcon/export'
export default {
  name: 'EditForm',
  components: {
  },
  props: {
  },
  data () {
    return {
      resolutionRatioValue: '1920*1080',
      resolutionRatio: {
        w: 1920,
        h: 1080
      },
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
      title: '', // 弹框标题(新增/编辑)
      dataForm: {
        id: '',
        type: 'bigScreen',
        name: '',
        icon: '',
        code: '',
        remark: '',
        iconColor: '#007aff',
        components: '',
        style: '',
        formType: '',
        formConfig: '',
        pageTemplateId: ''
      },
      dataFormRules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      sureLoading: false,
      toDesignLoading: false,
      sureDisabled: false,
      toDesignDisabled: false
    }
  },
  computed: {},
  watch: {
    resolutionRatioValue (val) {
      if (val) {
        this.resolutionRatio.w = val.split('*')[0]
        this.resolutionRatio.h = val.split('*')[1]
      } else {
        this.resolutionRatio.w = 1920
        this.resolutionRatio.h = 1080
      }
    }
  },
  mounted () {},
  methods: {
    // 关闭弹窗时
    closeAddDialog () {
      this.formVisible = false
      this.$refs.dataForm.resetFields()
    },
    // 初始化
    init (nodeData, parentNode) {
      this.title = ''
      const code = nodeData ? nodeData.code : ''
      this.formVisible = true
      this.$nextTick(() => {
        if (code) {
          this.$dataRoomAxios.get(`/bigScreen/design/info/code/${code}`).then((resp) => {
            this.$set(this, 'title', resp.name)
            this.$set(this.dataForm, 'name', resp.name)
            this.$set(this.dataForm, 'chartList', resp.chartList)
            this.$set(this.dataForm, 'code', resp.code)
            this.$set(this.dataForm, 'icon', resp.icon)
            this.$set(this.dataForm, 'iconColor', resp.iconColor)
            this.$set(this.dataForm, 'id', resp.id)
            this.$set(this.dataForm, 'parentCode', resp.parentCode === '0' ? '' : resp.parentCode)
            this.$set(this.dataForm, 'remark', resp.remark)
            this.$set(this.dataForm, 'style', resp.style)
            this.$set(this.dataForm, 'type', resp.type)
            this.$set(this.dataForm, 'orderNum', nodeData.orderNum)
            this.$set(this.dataForm, 'pageTemplateId', resp?.pageTemplateId)
            this.$set(this.dataForm, 'pageConfig', resp?.pageConfig)
            if (this.dataForm.type === 'bigScreen') {
              const { w, h } = resp.pageConfig
              this.resolutionRatio.w = w
              this.resolutionRatio.h = h
              this.resolutionRatioValue = `${w}*${h}`
            }
          })
        } else {
          this.$set(this.dataForm, 'name', '')
          this.$set(this.dataForm, 'chartList', [])
          this.$set(this.dataForm, 'code', '')
          this.$set(this.dataForm, 'icon', Icon.getNameList()[0])
          this.$set(this.dataForm, 'iconColor', '#007aff')
          this.$set(this.dataForm, 'id', '')
          this.$set(this.dataForm, 'parentCode', parentNode.code)
          this.$set(this.dataForm, 'remark', '')
          this.$set(this.dataForm, 'style', '')
          this.$set(this.dataForm, 'type', this.dataForm.type)
          this.$set(this.dataForm, 'orderNum', 0)
          this.$set(this.dataForm, 'pageTemplateId', '')
          this.$set(this.dataForm, 'pageConfig', {
            w: '1920',
            h: '1080',
            bgColor: '#151a26',
            opacity: 100,
            customTheme: 'auto',
            bg: null,
            lightBgColor: '#f5f7fa',
            lightBg: null
          })
          if (this.dataForm.type === 'bigScreen') {
            this.resolutionRatio.w = '1920'
            this.resolutionRatio.h = '1080'
          }
        }
      })
    },
    // 点击确定时
    addOrUpdate (isToDesign = false) {
      this.addOrUpdateBigScreen(isToDesign)
    },
    // 大屏 新增/编辑
    async addOrUpdateBigScreen (isToDesign) {
      this.$refs.dataForm.validate(async (valid) => {
        if (!valid) {
          return
        }
        const addOrUpdateHandel = !this.dataForm.code
          ? (form) => this.$dataRoomAxios.post('/bigScreen/design/add', form)
          : (form) => this.$dataRoomAxios.post('/bigScreen/design/update', form)
        const form = {
          className: 'com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO',
          chartList: this.dataForm.chartList,
          code: this.dataForm.code,
          icon: this.dataForm.icon,
          iconColor: this.dataForm.iconColor,
          id: this.dataForm.id,
          name: this.dataForm.name,
          parentCode: this.dataForm.parentCode,
          remark: this.dataForm.remark,
          style: this.dataForm.style,
          type: 'bigScreen',
          orderNum: this.dataForm.orderNum,
          pageConfig: this.dataForm.pageConfig,
          pageTemplateId: this.dataForm.pageTemplateId
        }
        if (isToDesign) {
          this.toDesignLoading = true
          this.sureDisabled = true
        } else {
          this.sureLoading = true
          this.toDesignDisabled = true
        }
        addOrUpdateHandel(form)
          .then((code) => {
            this.formVisible = false
            const message = this.dataForm.code ? '更新成功' : '新建成功'
            this.$message.success(message)
            this.$emit('refreshData', form, this.dataForm.id)
            if (isToDesign) {
              this.toDesignLoading = false
              this.sureDisabled = false
              form.code = code || this.dataForm.code
              this.toDesign({ ...form })
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
          })
      })
    },
    // 跳转设计态
    toDesign (form) {
      // const { href: bigScreenHref } = this.$router.resolve({
      //   path: window.BS_CONFIG?.routers?.designUrl || '/big-screen/design',
      //   query: {
      //     code: form.code
      //   }
      // })
      // window.open(bigScreenHref, '_self')
      this.$router.push({
        path: window.BS_CONFIG?.routers?.designUrl || '/big-screen/design',
        query: {
          code: form.code
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/bsTheme.scss';
.el-scrollbar {
  height: 300px;
  overflow-x: hidden;

  ::v-deep .el-scrollbar__view {
    overflow-x: hidden;
  }
}

.color-picker {
  display: flex;
  align-items: center;
}

.icon-svg {
  width: 25px;
  height: 25px;
}

.color-select {
  width: 350px;
  display: flex;
  margin-top: 5px;
  align-items: center;
  justify-content: space-between;

  div {
    width: 20px;
    height: 20px;
    cursor: pointer;
    position: relative;
  }

  ::v-deep .el-color-picker__trigger {
    top: 0;
    right: 0;
    width: 21px;
    height: 21px;
    padding: 0;
  }

  .el-icon-check {
    font-size: 20px;
    color: #ffffff;
    position: absolute;
  }
}

.icon-list {
  margin-top: 15px;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #e8e8e8;

  .el-button--mini {
    min-width: 37px;
    padding: 5px !important;
    border: 1px solid transparent !important;

    &:hover {
      background-color: rgba(217, 217, 217, 0.3);
    }
  }
}

.icon-uploader {
  width: 60px;
  height: 60px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

}

.icon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
}

.icon {
  width: 60px;
  height: 60px;
  display: block;
}

.default-layout-box {
  display: flex;
  flex-wrap: wrap;

  .default-layout-item {
    cursor: pointer;
    margin: 9px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .component-name {
      font-size: 12px;
    }

    .sampleImg {
      margin: 0 auto;
      width: 102px;
      height: 73px;
      display: block;
    }

    .img_dispaly {
      margin: 0 auto;
      text-align: center;
      width: 100px;
      height: 70px;
      line-height: 70px;
      background-color: #D7D7D7;
      color: #999;
    }

    .demonstration {
      text-align: center;
    }
  }

  .default-layout-item:hover {
    cursor: pointer;
  }

  ::v-deep .el-radio__label {
    display: none;
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

.catalog-cascader {
  width: 100% !important;
}
</style>
