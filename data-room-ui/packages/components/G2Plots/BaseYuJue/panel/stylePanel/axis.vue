<template>
  <div class="dataroom-axis-wrapper">
    <el-form-item
      label="显示"
      class="form-item-box"
    >
      <el-switch
        v-model="config.option[axis].label.style.opacity"
        :active-value="1"
        :inactive-value="0"
        @change="changeStyle"
      />
    </el-form-item>
    <el-collapse v-if="config.option[axis].label.style.opacity">
      <el-form-item
        class="form-item-box radio"
        label="文本样式"
      >
        <el-row>
          <el-col
            :span="12"
            style="padding-right: 5px"
          >
            <el-select
              v-model="config.option[axis].label.style.fontFamily"
              placeholder="请选择字体"
              @change="changeStyle"
            >
              <el-option
                v-for="item in fonFamilyList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="set-desc">
              字体
            </div>
          </el-col>
          <el-col
            :span="12"
            style="padding-left: 5px"
          >
            <el-select
              v-model="config.option[axis].label.style.fontWeight"
              placeholder="请选择文字粗细"
              @change="changeStyle"
            >
              <el-option
                v-for="item in fontWeightOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="set-desc">
              文字粗细
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-input-number
              v-model="config.option[axis].label.style.fontSize"
              controls-position="right"
              @change="changeStyle"
            />
            <div class="set-desc">
              字号
            </div>
          </el-col>
          <el-col
            :span="6"
            class="form-item-col"
          >
            <el-color-picker
              v-model="config.option[axis].label.style.fill"
              @change="changeStyle"
            />
            <div class="set-desc color-desc">
              颜色
            </div>
          </el-col>
        </el-row>
      </el-form-item>
    </el-collapse>
  </div>
</template>

<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import { fontWeightOptions, fonFamilyList } from '@gcpaas/data-room-ui/packages/js/utils/options'
export default {
  name: '',
  mixins: [commonMixins],
  components: {},
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    axisType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      fontWeightOptions,
      fonFamilyList
    }
  },
  computed: {
    axis () {
      return this.axisType === 'X' ? 'xAxis' : 'yAxis'
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {}
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
