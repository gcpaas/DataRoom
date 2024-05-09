<template>
  <div class="dataroom-transform-set-wrapper">
    <el-form-item
      label="透视距离"
    >
      <el-input-number
        v-model="config.perspective"
        class="bs-el-input-number"
        :min="0"
        :step="1"
        controls-position="right"
        @change="changePerspective"
      />
    </el-form-item>
    <el-form-item
      label="绕x轴旋转角度"
    >
      <el-input-number
        v-model="config.rotateX"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
        controls-position="right"
        @change="changeRotateX"
      />
    </el-form-item>
    <el-form-item
      label="绕y轴旋转角度"
    >
      <el-input-number
        v-model="config.rotateY"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
        controls-position="right"
        @change="changeRotateY"
      />
    </el-form-item>
    <el-form-item
      label="绕z轴旋转角度"
    >
      <el-input-number
        v-model="config.rotateZ"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
        controls-position="right"
        @change="changeRotateZ"
      />
    </el-form-item>
    <el-form-item
      label="沿x轴扭曲角度"
    >
      <el-input-number
        v-model="config.skewX"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
        controls-position="right"
        @change="changeSkew"
      />
    </el-form-item>
    <el-form-item
      label="绕y轴扭曲角度"
    >
      <el-input-number
        v-model="config.skewY"
        class="bs-el-input-number"
        :min="-180"
        :max="180"
        :step="1"
        controls-position="right"
        @change="changeSkew"
      />
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
    changePerspective () {
      const perspective = `perspective(${this.config.perspective}px)`
      const regex = /perspective\(-?\d*\.?\d+px\)/
      this.changeTransform('perspective', perspective, regex)
    },
    changeRotateX () {
      const rotateX = `rotateX(${this.config.rotateX}deg)`
      const regex = /rotateX\(-?\d*\.?\d+deg\)/
      this.changeTransform('rotateX', rotateX, regex)
    },
    changeRotateY () {
      const rotateY = `rotateY(${this.config.rotateY}deg)`
      const regex = /rotateY\(-?\d*\.?\d+deg\)/
      this.changeTransform('rotateY', rotateY, regex)
    },
    changeRotateZ () {
      const rotateZ = `rotateZ(${this.config.rotateZ}deg)`
      const regex = /rotateZ\(-?\d*\.?\d+deg\)/
      this.changeTransform('rotateZ', rotateZ, regex)
    },
    changeSkew () {
      const skew = `skew(${this.config.skewX}deg, ${this.config.skewY}deg)`
      const regex = /skew\(-?\d*\.?\d+deg, -?\d*\.?\d+deg\)/
      this.changeTransform('skew', skew, regex)
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
  padding-left:32px;
  padding-right:24px;
  .col-box{
    margin-top: 12px;
  }
}
</style>
