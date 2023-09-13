<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
    <dv-border-box-1
      :id="'dataV' + config.code"
    >
    <div class="element"  :style="`font-size:${config.border.fontSize}px;line-height:${config.border.titleHeight}px;color:${config.border.color[0]};height:${config.border.titleHeight};margin:0 0 0 20px`">{{config.title}}</div>
    </dv-border-box-1>
  </div>
</template>
<script>
import DvBorderBox1 from '@jiaminghi/data-view/lib/components/borderBox1/src/main.vue'
import '@jiaminghi/data-view/lib/components/borderBox1/src/main.css'
export default {
  name: 'Border1',
  components: {
    DvBorderBox1
  },
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  position: absolute;
  width: 100%;
  height: 100%;
  // padding: 0 16px;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  .element{
    display: flex;
    align-items: center;
  }
}

.title-box {
  height: 40px;
  padding: 10px 10px 0 0;
  box-sizing: border-box;

  .title {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    border-left: 3px solid #007aff;
    padding-left: 16px;
  }

  .target-value {
    overflow-y: auto;
    height: 60px;
    font-weight: bold;
    width: 100%;
    font-size: 20px;
    color: #333;
    padding: 16px 0 0 22px;
    box-sizing: border-box;
  }
}

.el-icon-warning {
  color: #ffd600;
}

.title-hover {
  &:hover {
    cursor: move;
  }
}

/*滚动条样式*/
::v-deep ::-webkit-scrollbar {
  width: 4px;
  border-radius: 4px;
  height: 4px;
}

::v-deep ::-webkit-scrollbar-thumb {
  background: #dddddd !important;
  border-radius: 10px;
}
</style>
