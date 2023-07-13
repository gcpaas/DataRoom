<template>
  <el-dialog
    title="设计分工"
    :visible.sync="dialogVisible"
    width="65%"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
  >
    <div class="content">
      <div class="top">
        <div class="top-item">
          <span class="title">总体设计原则:</span> 先总体后细节
        </div>
        <div class="top-item">
          <span class="title">布局设计原则:</span>
          上下布局择上、左右布局择左、三栏布局择中
        </div>
      </div>
      <div class="bottomContent">
        <div class="bottom">
          <div class="bottom-item">
            <img
              class="imgItem"
              src="./image/card1.png"
              alt=""
            >
            <div class="bottom-item_title">
              项目经理
            </div>
            <div class="bottom-item_content">
              与客户沟通大屏需求、确定设备分辨率、确定大屏展示内容
            </div>
          </div>
          <div class="bottom-item">
            <img
              class="imgItem"
              src="./image/card2.png"
              alt=""
            >
            <div class="bottom-item_title">
              设计师
            </div>
            <div class="bottom-item_content">
              设计视觉元素、图片、排版布局、配色方案、确保整个屏幕外观美观、易读和引人注目
            </div>
          </div>
          <div class="bottom-item">
            <img
              class="imgItem"
              src="./image/card3.png"
              alt=""
            >
            <div class="bottom-item_title">
              开发者
            </div>
            <div class="bottom-item_content">
              收集数据，格式化数据、开发数据集、联调大屏测试
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
export default {
  name: 'ComponentDialog',
  mixins: [pageMixins],
  props: {},
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {},
  mounted () {},
  methods: {
    init () {
      this.dialogVisible = true
    },
    // 点击确定
    confirm () {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
.content {
  display: flex;
  flex-direction: column;
  .top {
    padding: 18px 24px;
    color: #707076;
    height: 200px;
    font-size: 15px;
    &-item {
      padding: 8px 30px;
      .title {
        font-weight: bolder;
      }
    }
  }
  .bottom {
    // position: absolute;
    padding: 18px 24px;
    margin-top: -90px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    &-item {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      &_title {
        font-weight: bolder;
        color: #d9d9d9;
        font-size: 16px;
        margin: 24px 0 16px 0;
      }
      &_content {
        color: #a6a6a6;
        width: 70%;
        text-align: center;
      }
      .imgItem {
        width: 100%;
      }
    }
  }
}
.bottomContent {
  min-height: 250px;
  background-color: #3f3f3f;
}

::v-deep .el-dialog__body {
  padding: 0 !important;
  max-height: 100vh !important;
}
</style>
