<template>
  <div class="dataroom-base-set-wrapper">
    <el-form-item
      label="图层名称"
    >
      <el-input
        v-model="config.title.text"
        placeholder="请输入标题"
        @blur="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label=""
      label-width="0"
      class="form-item-box"
    >
      <el-row>
        <el-col
          :span="12"
          style=" padding-right: 5px"
        >
          <el-input-number
            v-model="config.x"
            placeholder="请输入x"
            controls-position="right"
            @change="changeTranslate"
          />
          <div class="set-desc">
            X坐标
          </div>
        </el-col>
        <el-col
          :span="12"
          style="padding-left: 5px"
        >
          <el-input-number
            v-model="config.y"
            placeholder="请输入y"
            controls-position="right"
            @change="changeTranslate"
          />
          <div class="set-desc">
            Y坐标
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col
          :span="12"
          style="padding-right: 5px"
        >
          <el-input-number
            v-model="config.w"
            placeholder="请输入w"
            controls-position="right"
            @change="changeStyle"
          />
          <div class="set-desc">
            宽度
          </div>
        </el-col>
        <el-col
          :span="12"
          style="padding-left: 5px"
        >
          <el-input-number
            v-model="config.h"
            placeholder="请输入h"
            controls-position="right"
            @change="changeStyle"
          />
          <div class="set-desc">
            高度
          </div>
        </el-col>
      </el-row>
    </el-form-item>
  </div>
</template>

<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: '',
  mixins: [commonMixins],
  components: {},
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {}
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    // 改变组件的坐标
    changeTranslate () {
      const translate = `translate(${this.config.x}px, ${this.config.y}px)`
      const regex = /translate\(-?\d*\.?\d+px, -?\d*\.?\d+px\)/
      this.changeTransform('translate', translate, regex)
    },
    // 组件进行3d旋转
    changeTransform (type, newValue, regex) {
      const newTransform = this.config.transform.replace(regex, newValue)
      const config = cloneDeep(this.config)
      config.transform = newTransform
      // 更新图表的配置和样式处理器
      this.canvasInst.updateChartConfig(config)
      this.canvasInst.updateStyleHandler(config)
    }

  }
}
</script>

<style scoped lang="scss">
.dataroom-base-set-wrapper{
  font-size: 12px!important;
  padding-top: 12px;
  padding-left:32px;
  padding-right:24px;
  .col-box{
    margin-top: 12px;
  }
}
.test-input-box{
  //在样式表中定义一个 ::placeholder 伪类选择器，指定需要修改的属性和值，例如修改占位符文本颜色为灰色（#888888）。
  ::v-deep .el-input__inner::placeholder {
    color: #000;
    font-size:30px;
  }

}
</style>
