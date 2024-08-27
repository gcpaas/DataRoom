<template>
  <div class="dataroom-graph-wrapper">
<!--    <el-form-item
      label="百分比"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.percent"
        controls-position="right"
        :min="0"
        :max="1"
        :step="0.05"
        @change="changeStyle"
      />
    </el-form-item>-->
    <el-form-item
      label="颜色"
      class="form-item-box"
    >
      <ColorMultipleSelect
        v-model="config"
        :config="config"
      />
    </el-form-item>
    <el-form-item
      label="宽度占比"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.barWidthRatio"
        class="number-input-box number-input-half "
        type="number"
        :min="0"
        :max="1"
        :step="0.1"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="不透明度"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.progressStyle.fillOpacity"
        class="number-input-box number-input-half "
        type="number"
        :min="0"
        :max="1"
        :step="0.1"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-collapse>
      <el-collapse-item
        title="内边距"
      >
        <el-form-item
          label=""
          label-width="0"
          class="form-item-box"
        >
          <el-row>
            <el-col
              :span="12"
              style="padding-right: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[0]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                上边距
              </div>
            </el-col>
            <el-col
              :span="12"
              style="padding-left: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[1]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                右边距
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col
              :span="12"
              style="padding-right: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[2]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                下边距
              </div>
            </el-col>
            <el-col
              :span="12"
              style="padding-left: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[3]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                左边距
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        v-if="currentPageType === 'bigScreen'"
        title="旋转"
      >
        <TransformSet :config="config" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import TransformSet from '@gcpaas/data-room-ui/packages/components/common/panel/TransformSet/index.vue'
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import {
  fontWeightOptions,
  fonFamilyList,
  positionOptions,
  gaugeTypeOptions
} from '@gcpaas/data-room-ui/packages/js/utils/options'
import ColorMultipleSelect from '@gcpaas/data-room-ui/packages/components/common/panel/ColorMultipleSelect/index.vue'
export default {
  name: '',
  components: {
    ColorMultipleSelect,
    TransformSet
  },
  mixins: [commonMixins],
  inject: ['canvasInst'],
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      fontWeightOptions,
      fonFamilyList,
      positionOptions,
      gaugeTypeOptions
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType
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
