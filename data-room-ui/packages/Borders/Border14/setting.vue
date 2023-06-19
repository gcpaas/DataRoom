<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body"
    >
      <div class="lc-field-body">
        <slot name="top" />
        <el-form
          :model="config.customize"
          label-position="left"
          class="setting-body"
          label-width="90px"
        >
          <el-form-item label="边框名称">
            <el-input
              v-model="config.title"
              clearable
            />
          </el-form-item>
          <PosWhSetting :config="config" />
          <el-form-item label="边框线颜色">
            <ColorPicker
              v-model="config.customize.borderColor"
              placeholder="请选择边框线颜色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="边框线宽度">
            <el-input-number
              v-model="config.customize.borderWidth"
              class="bs-el-input-number"
            />
          </el-form-item>
          <el-form-item label="背景色一">
            <ColorPicker
              v-model="config.customize.gradientColor0"
              placeholder="请选择背景色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="背景色二">
            <ColorPicker
              v-model="config.customize.gradientColor1"
              placeholder="请选择背景色"
              :predefine-colors="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="渐变色方向">
            <el-select
              v-model="config.customize.gradientDirection"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="item in gradientDirection"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="不透明度"
            label-width="100px"
          >
            <el-slider
              v-model="config.customize.opacity"
              class="bs-slider bs-el-input-number"
              :min="0"
              :max="100"
              show-input
            />
          </el-form-item>
          <el-form-item label="左上圆角值">
            <el-input-number
              v-model="config.customize.radiusLeftTop"
              class="bs-el-input-number"
            />
          </el-form-item>
          <el-form-item label="左下圆角值">
            <el-input-number
              v-model="config.customize.radiusLeftBottom"
              class="bs-el-input-number"
            />
          </el-form-item>
          <el-form-item label="右上圆角值">
            <el-input-number
              v-model="config.customize.radiusRightTop"
              class="bs-el-input-number"
            />
          </el-form-item>
          <el-form-item label="右下圆角值">
            <el-input-number
              v-model="config.customize.radiusRightBottom"
              class="bs-el-input-number"
            />
          </el-form-item>
          <slot name="bottom" />
        </el-form>
      </div>
    </el-form>
  </div>
</template>
<script>
import ColorPicker from 'packages/ColorPicker/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'Border14Setting',
  components: {
    ColorPicker,
    PosWhSetting
  },
  props: {
    config: {
      type: Object,
      required: true
    },
    predefineThemeColors: {
      type: Array,
      default: () => {
        return [
          '#007aff',
          '#1aa97b',
          '#ff4d53',
          '#1890FF',
          '#DF0E1B',
          '#0086CC',
          '#2B74CF',
          '#00BC9D',
          '#ED7D32'
        ]
      }
    }
  },
  data () {
    return {
      gradientDirection: [
        {
          label: '从左到右',
          value: 'to right'
        },
        {
          label: '从右到左',
          value: 'to left'
        },
        {
          label: '从上到下',
          value: 'to bottom'
        },
        {
          label: '从下到上',
          value: 'to top'
        },
        {
          label: '从左上到右下',
          value: 'to bottom right'
        },
        {
          label: '从右上到左下',
          value: 'to bottom left'
        },
        {
          label: '从左下到右上',
          value: 'to top right'
        },
        {
          label: '从右下到左上',
          value: 'to top left'
        }
      ]
    }
  },
  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.lc-field-body {
  padding: 16px;
}
</style>
