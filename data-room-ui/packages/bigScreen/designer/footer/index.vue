<!--
 * @Descripttion:
 * @Author: liu.shiyi
 * @Date: 2024-01-30 16:28:19
 * @LastEditors: liu.shiyi
 * @LastEditTime: 2024-02-27 17:58:48
-->
<template>
  <div class="dataroom-bigscreen-footer-wrap">
    <div class="zoom-slider">
      <i
        class="icon el-icon-minus"
        @click="minusHandler"
      />
      <el-slider
        v-model="zoom"
        class="slider-box"
        :min="10"
        :max="300"
        @change="sliderHandler"
      />
      <i
        class="icon el-icon-plus"
        @click="plusHandler"
      />
      <!--      <el-select-->
      <!--        v-model="zoomPercent"-->
      <!--        class="select-box"-->
      <!--        @change="selectHandler"-->
      <!--      >-->
      <!--        <el-option-->
      <!--          v-for="item in zoomList"-->
      <!--          :key="item"-->
      <!--          :label="item"-->
      <!--          :value="item"-->
      <!--        />-->
      <!--      </el-select>-->
      <el-dropdown @command="selectHandler">
        <span class="el-dropdown-link">
          {{ zoomPercent }}<i class="el-icon-arrow-down el-icon--right" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in zoomList"
            :key="item"
            :command="item"
          >
            {{ item }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  components: {},
  props: {},
  data () {
    return {
      zoomList: ['50%', '100%', '150%', '200%', '250%', '300%']
    }
  },
  inject: ['canvasInst'],
  computed: {
    scale () {
      return this.zoom() / 100
    },
    fitZoom () {
      return this.canvasInst.fitZoom
    },
    zoom: {
      get () {
        return this.canvasInst.zoom
      },
      set (value) {
        this.canvasInst.changeZoom(value)
      }
    },
    zoomPercent: {
      get () {
        return this.zoom + '%'
      },
      set (value) {

      }

    }

  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    // 切换右侧面板显隐
    toggleRightPanel () {
      this.$emit('toggleRightPanel')
    },
    // 滑动滑块来对画布进行缩放
    sliderHandler (scale) {
      this.canvasInst.changeZoom(scale)
    },
    // 修改下拉选项来对画布进行缩放
    selectHandler (val) {
      this.canvasInst.changeZoom(parseInt(val))
    },
    // 点击减号缩放画布
    minusHandler () {
      const scale = this.zoom
      if (scale > 15) {
        this.canvasInst.changeZoom(scale - 5)
      }
    },
    // 点击加号缩放画布
    plusHandler () {
      const scale = this.zoom
      if (scale < 295) {
        this.canvasInst.changeZoom(scale + 5)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.dataroom-bigscreen-footer-wrap{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background-color: #ffffff;
  border-top: 1px solid #ededed;
  box-sizing: border-box;
  z-index: 1000;
    .zoom-slider{
      width: 330px;
      padding: 0 8px;
      box-sizing: border-box;
      display:flex;
      justify-content: space-between;
      align-items: center;
      .slider-box{
        width: 180px;
      }
      .select-box{
        ::v-deep .el-input__inner{
          width:80px
        }
      }
      .icon{
        font-size: 8px;
      }
      .el-icon-plus:hover{
        cursor: zoom-in;
      }
      .el-icon-minus:hover{
        cursor: zoom-out;
      }
    }
}

</style>
