<template>
  <div class="bs-custom-components">
    <div class="bs-custom-component-header">
      <div class="left-title">
        <div class="logo-wrap item-wrap">
          <img
            class="menu-img"
            src="../BigScreenDesign/images/app.png"
            alt="返回"
            @click="backManagement"
          >
          <span class="logo-text name-span">{{ form.name }}</span>
        </div>
      </div>
      <div class="right-btn-wrap">
        <CusBtn
          :loading="loading"
          @click="save"
        >
          保存
        </CusBtn>
      </div>
    </div>
    <div class="bs-custom-component-content">
      <div class="bs-custom-component-content-code">
        <div class="left-vue-code component-code">
          <div class="code-tab-header">
            <div class="code-tab-left">
              <div class="code-tab">
                组件模板
              </div>
              <div
                class="code-tab-btn"
                @click="change('echart')"
              >
                echarts组件
              </div>
              <div
                class="code-tab-btn"
                @click="change('g2plot')"
              >
                G2Plot组件
              </div>
              <div
                class="code-tab-btn"
                @click="change('native')"
              >
                原生组件
              </div>
              <div
                class="code-tab-btn"
                @click="change('3DEchart')"
              >
                3D组件
              </div>
            </div>
            <!-- <div class="upload-btn">
              <CusBtn @click="upload('vueContent')">
                上传
              </CusBtn>
            </div> -->
          </div>
          <div class="code-tab-content">
            <!-- <MonacoEditor
              ref="vueContent"
              v-model="form.vueContent"
              class="editor"
              language="html"
            /> -->
            <codemirror
              v-model="form.vueContent"
              :options="vueOptions"
            />
          </div>
        </div>
        <div class="right-setting-code component-code">
          <div class="code-tab-header">
            <div class="code-tab">
              组件配置
            </div>
            <!-- <div class="upload-btn">
              <CusBtn @click="upload('settingContent')">
                上传
              </CusBtn>
            </div> -->
          </div>
          <div class="code-tab-content">
            <!-- <MonacoEditor
              ref="settingContent"
              v-model="form.settingContent"
              class="editor"
              language="javascript"
            /> -->
            <codemirror
              v-model="form.settingContent"
              :options="settingOptions"
            />
          </div>
        </div>
      </div>
      <div class="bs-custom-component-content-preview">
        <div class="bs-preview-inner">
          <div class="code-tab-header">
            <div class="code-tab">
              效果预览
            </div>
            <div class="upload-btn">
              <CusBtn
                :loading="loading"
                @click.native="createdImg()"
              >
                生成图片
              </CusBtn>
            </div>
          </div>
          <BizComponentPreview
            :vue-content="form.vueContent"
            :setting-content="form.settingContent"
          />
        </div>
      </div>
      <!-- 通过计算属性发现accept有问题 -->
      <input
        ref="vueContentFile"
        style="display: none"
        type="file"
        name="file"
        accept=".vue"
        @change="handleBatchUpload"
      >
      <input
        ref="settingContentFile"
        style="display: none"
        type="file"
        name="file"
        accept=".js"
        @change="handleBatchUpload"
      >
    </div>
  </div>
</template>
<script>
import { toJpeg } from 'html-to-image'
import CusBtn from 'data-room-ui/BigScreenDesign/BtnLoading'
// import MonacoEditor from 'data-room-ui/MonacoEditor'
import BizComponentPreview from './Preview'
import { getBizComponentInfo, updateBizComponent } from 'data-room-ui/js/api/bigScreenApi'
import { defaultSettingContent, defaultVueContent } from './config/defaultBizConfig'
import { defaultEchartsSettingContent, defaultEchartsVueContent } from './config/defaultEchartsConfig'
import { defaultG2SettingContent, defaultG2VueContent } from './config/defaultG2Config'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-darker.css'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/mode/vue/vue.js'

import {
  showSize,
  compressImage
  // dataURLtoBlob,
  // translateBlobToBase64
} from 'data-room-ui/js/utils/compressImg'
// import * as imageConversion from 'image-conversion'

export default {
  name: 'BizComponentDesign',
  components: {
    CusBtn,
    // MonacoEditor,
    codemirror,
    BizComponentPreview
  },
  props: {},
  data () {
    return {
      initialCoverPicture: '',
      form: {
        name: '',
        coverPicture: '',
        settingContent: '',
        vueContent: ''
      },
      currentContentType: 'vueContent',
      loading: false,
      vueOptions: {
        foldGutter: true,
        lineWrapping: true,
        gutters: [
          'CodeMirror-linenumbers',
          'CodeMirror-foldgutter',
          'CodeMirror-lint-markers'
        ],
        theme: 'material-darker',
        tabSize: 4,
        lineNumbers: true,
        line: true,
        indentWithTabs: true,
        smartIndent: true,
        autofocus: false,
        matchBrackets: true,
        mode: 'text/x-vue',
        hintOptions: {
          completeSingle: false
        },
        lint: true
      },
      settingOptions: {
        foldGutter: true,
        lineWrapping: true,
        gutters: [
          'CodeMirror-linenumbers',
          'CodeMirror-foldgutter',
          'CodeMirror-lint-markers'
        ],
        theme: 'material-darker',
        tabSize: 4,
        lineNumbers: true,
        line: true,
        indentWithTabs: true,
        smartIndent: true,
        autofocus: false,
        matchBrackets: true,
        mode: 'text/javascript',
        hintOptions: {
          completeSingle: false
        },
        lint: true
      }
    }
  },
  computed: {
  },
  mounted () {
    this.getBizComponentInfo()
  },
  methods: {
    getBizComponentInfo () {
      const code = this.$route.query.code
      const type = this.$route.query.type
      if (code) {
        getBizComponentInfo(code).then(data => {
          this.initialCoverPicture = data.coverPicture || ''
          if (type && type === 'g2plot') {
            this.form = {
              ...data,
              name: data.name,
              coverPicture: data.coverPicture,
              settingContent: data.settingContent || defaultG2SettingContent,
              vueContent: data.vueContent || defaultG2VueContent
            }
          } else if (type && type === 'echart') {
            this.form = {
              ...data,
              name: data.name,
              coverPicture: data.coverPicture,
              settingContent: data.settingContent || defaultEchartsSettingContent,
              vueContent: data.vueContent || defaultEchartsVueContent
            }
          } else {
            this.form = {
              ...data,
              name: data.name,
              coverPicture: data.coverPicture,
              settingContent: data.settingContent || defaultSettingContent,
              vueContent: data.vueContent || defaultVueContent
            }
          }

          // this.$refs.vueContent.editor.setValue(this.form.vueContent)
          // this.$refs.settingContent.editor.setValue(this.form.settingContent)
        })
      }
    },
    changeTemp (val) {
      if (val === 'g2plot') {
        this.form.settingContent = defaultG2SettingContent
        this.form.vueContent = defaultG2VueContent
      } else if (val === 'native') {
        this.form.settingContent = defaultSettingContent
        this.form.vueContent = defaultVueContent
      } else if (val === 'echart') {
        this.form.settingContent = defaultEchartsSettingContent
        this.form.vueContent = defaultEchartsVueContent
      }
    },
    change (val) {
      if (val === '3DEchart') {
        return this.$confirm('开发中。。。。', '提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          cancelButtonClass: 'cancel-btn',
          type: 'warning',
          customClass: 'bs-el-message-box'
        }).then(() => {
        }).catch((action) => {
        })
      }
      this.$confirm('确定替换为选中模板吗？未保存的代码将被覆盖！', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        showCancelButton: false,
        cancelButtonClass: 'cancel-btn',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        this.changeTemp(val)
      }).catch((action) => {

      })
    },
    // upload (type) {
    //   this.currentContentType = type
    //   this.$refs[`${this.currentContentType}File`].click()
    // },
    handleBatchUpload (source) {
      const file = source.target.files
      const reader = new FileReader() // 新建一个FileReader
      reader.readAsText(file[0], 'UTF-8') // 读取文件

      reader.onload = (event) => {
        const sileString = event.target.result // 读取文件内容
        this.form[this.currentContentType] = sileString
        // input通过onchange事件来触发js代码的，由于两次文件是重复的，所以这个时候onchange事件是没有触发到的，所以需要手动清空input的值
        source.target.value = ''
      }
    },
    backManagement () {
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
          this.pageJump()
        }
      })
    },
    async save (pageJump = false) {
      this.loading = true
      let dataUrl = ''
      const node = document.querySelector('.remote-preview-inner-wrap')
      // 获取node下的第一个子节点
      const childrenNode = node.children[0]
      try {
        dataUrl = await toJpeg(childrenNode, { quality: 0.2 })
      } catch (error) {
        console.info(error)
      }
      if (dataUrl) {
        if (showSize(dataUrl) > 200) {
          // const url = dataURLtoBlob(dataUrl)
          // 压缩到500KB,这里的500就是要压缩的大小,可自定义
          // imageConversion.compressAccurately(
          //   url,
          //   {
          //     size: 200, // 图片大小压缩到100kb
          //     width: 1280, // 宽度压缩到1280
          //     height: 720 // 高度压缩到720
          //   }
          // ).then((res) => {
          //   translateBlobToBase64(res, (e) => {
          //     this.form.coverPicture = e.result
          //   })
          // })
          this.$message.info('由于封面图片过大，进行压缩中')
          this.form.coverPicture = await compressImage(dataUrl, { width: 1280, height: 720, size: 400, quality: 1 })
        } else {
          this.form.coverPicture = dataUrl
        }
      } else {
        this.$message.warning('保存封面失败，将使用上次保存的封面')
        this.form.coverPicture = this.initialCoverPicture
      }
      updateBizComponent(this.form).then(() => {
        this.$message({
          message: '保存成功',
          type: 'success',
          duration: 800,
          onClose: () => {
            // 此处写提示关闭后需要执行的函数
            if (pageJump) {
              this.pageJump()
            }
          }
        })
        this.loading = false
      }).catch((error) => {
        console.info(error)
        this.loading = false
      })
    },
    createdImg () {
      this.loading = true
      const node = document.querySelector('.remote-preview-inner-wrap')
      // 获取node下的第一个子节点
      const childrenNode = node.children[0]
      // 为childrenNode添加一个背景颜色
      childrenNode.style.backgroundColor = 'var(--bs-background-1)'
      toJpeg(childrenNode)
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = `${this.form.name}.png`
          link.href = dataUrl
          link.click()
          link.addEventListener('click', () => {
            link.remove()
          })
          this.loading = false
        })
        .catch((error) => {
          console.info(error)
          this.loading = false
          // 判断的error.currentTarget是img标签，如果是的，就弹出消息说是图片跨域
          // 确认框
          this.$confirm('图片、视频资源跨域导致使用toDataURL API生成图片失败，请将资源上传到资源库，然后在组件中使用资源库中的图片资源，确保没有跨域问题。', '提示', {
            confirmButtonText: '确定',
            showCancelButton: false,
            type: 'warning',
            customClass: 'bs-el-message-box'
          }).then(() => { }).catch(() => { })
        })
    },
    pageJump () {
      const data = { componentsManagementType: 'bizComponent' }
      this.$router.app.$options.globalData = data // 将数据存储在全局变量中
      this.$router.push({ path: window.BS_CONFIG?.routers?.componentUrl || '/big-screen-components' })
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-custom-components {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  color: var(--bs-el-text);
  background: var(--bs-background-2);
  overflow: hidden;

  >* {
    box-sizing: border-box;
  }

  .bs-custom-component-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 16px;
    border-bottom: 4px solid var(--bs-background-1);
    background: var(--bs-background-2);

    .left-title {
      font-size: 16px;
      color: var(--bs-el-title);

      .logo-wrap {
        display: flex;
        align-items: center;
      }

      .menu-img {
        width: 18px;
        height: 18px;
        margin-right: 15px;
        margin-left: 9px;
        cursor: pointer;
      }
    }

    .right-btn-wrap {
      display: flex;
      align-items: center;
      height: 100%;
    }
  }

  .bs-custom-component-content {
    flex: 1;
    background: var(--bs-background-2);
    display: flex;
    flex-direction: column;

    .bs-custom-component-content-code {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 354px;
      padding: 5px 16px;

      .left-vue-code {
        width: 60%;
        height: 100%;
        /* background: var(--bs-background-1); */
      }

      .right-setting-code {
        width: calc(40% - 16px);
        height: 100%;
        /* background: var(--bs-background-1); */
      }

      .component-code {
        .code-tab-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;

          .code-tab-left {
            height: 100%;
            width: 450px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;

            .code-tab-btn {
              // width: 90px;
              cursor: pointer;
              text-align: center;
            }

            .code-tab {
              font-size: 14px;
              align-items: center;
              justify-content: center;
              width: 120px;
              height: 100%;
              color: var(--bs-el-title);
              background: var(--bs-background-1);
            }
          }

          .code-tab {
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 120px;
            height: 100%;
            color: var(--bs-el-title);
            background: var(--bs-background-1);
          }
        }

        .code-tab-content {
          height: calc(100% - 88px);
          background: var(--bs-background-1);
        }
      }
    }

    .bs-custom-component-content-preview {
      flex: 1;
      width: 100%;
      height: 50%;
      padding: 0 16px 16px;

      .bs-preview-inner {
        width: 100%;
        height: 100%;
        background: var(--bs-background-1);
        position: relative;

        .code-tab-header {
          height: 40px;
          display: flex;
          flex-direction: row;
          align-items: center;
          background-color: var(--bs-background-2);

          .code-tab {
            font-size: 14px;
            align-items: center;
            justify-content: center;
            display: flex;
            width: 120px;
            margin-right: 20px;
            height: 100%;
            color: var(--bs-el-title);
            background: var(--bs-background-1);
          }
        }
      }
    }
  }
}
</style>
<style>
.cm-s-material-darker.CodeMirror,
.cm-s-material-darker .CodeMirror-gutters {
  background: var(--bs-background-1) !important;
}

.CodeMirror-scroll {
  background-color: var(--bs-background-1) !important;
}

.CodeMirror-gutters {
  border-right: 1px solid var(--bs-background-1) !important;
  background-color: var(--bs-background-1) !important;
}

.CodeMirror-vscrollbar {
  right: 0;
  top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  margin-right: 4px;
}

/* Webkit浏览器滚动条样式 */
.CodeMirror-vscrollbar::-webkit-scrollbar {
  width: 6px;
  /* 滚动条宽度 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb {
  background-color: #444851;
  /* 滚动条滑块颜色 */
  border-radius: 4px;
  /* 滚动条滑块圆角 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #444851;
  /* 滚动条滑块悬停时颜色 */
}

/* Firefox和新版Chrome浏览器滚动条样式 */
.CodeMirror-vscrollbar {
  scrollbar-width: thin;
  /* 滚动条宽度 */
  scrollbar-color: #444851 #444851;
  /* 滚动条颜色 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb {
  background-color: #444851;
  /* 滚动条滑块颜色 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #444851;
  /* 滚动条滑块悬停时颜色 */
}
</style>
