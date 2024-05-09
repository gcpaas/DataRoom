<template>
  <div
    v-if="rightVisiable"
    class="dataroom-bigscreen-right-wrap"
  >
    <div :class="!rightVisiable ? 'bs-page-right bs-page-right-fold' : 'bs-page-right'">
      <RightSetting
        :config="config"
      />
    </div>
  </div>
</template>
<script>
const RightSetting = () => import('../right/RightSetting.vue')
export default {
  name: '',
  components: {
    RightSetting
  },
  props: {
    rightVisiable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      right: 0,
      count: 0
    }
  },
  inject: ['canvasInst'],
  watch: {
  },
  computed: {
    config () {
      return this.canvasInst.activeChart
    }
  },
  mounted () { },
  methods: {
    close () {
      this.$emit('update:rightVisiable', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-bigscreen-right-wrap {
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background-color: #FCFCFC;
  border-left: 1px solid #ededed;

  .bs-page-right {
    //height: calc(100vh - 80px);
    height: 100%;
    width: 332px;
    //margin-top: 30px;
    box-sizing: border-box;
    background-color: #ffffff;

    .config-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 10px;
      color: #fff;
      font-size: 14px;
      /* border-bottom: 1px solid #ebeef5; */

      .config-title-text {
        display: inline-block;
        max-width: 200px;
        //overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    >* {
      color: #fff;
    }

    // 左侧居中伸缩图标
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -10px;
      width: 10px;
      height: 100%;
      background: #fff;
      cursor: pointer;
      z-index: 1;
    }
  }

  .bs-page-right-fold {
    width: 0;
    //overflow: hidden;
  }

}
</style>
