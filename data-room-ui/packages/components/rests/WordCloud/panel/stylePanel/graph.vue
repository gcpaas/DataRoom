<template>
  <div class="dataroom-graph-wrapper">
    <el-form-item
      label="字体颜色"
      class="form-item-box"
    >
      <ColorMultipleSelect
        v-model="config"
        :config="config"
      />
    </el-form-item>
    <el-form-item
      label="文字粗细"
      class="form-item-box"
    >
      <el-select
        v-model="config.option.wordStyle.fontWeight"
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
    </el-form-item>
    <el-form-item
      label="单词间隔"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.wordStyle.padding"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="最小字体"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.wordStyle.fontSize[0]"
        :min="1"
        :step="5"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="最大字体"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.wordStyle.fontSize[1]"
        :min="1"
        :step="5"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="背景图url"
      class="form-item-box"
    >
      <el-input
        v-model="config.option.imageMask"
        @change="changeStyle"
      />
    </el-form-item>
    <el-collapse>
      <el-collapse-item
        title="文字旋转"
      >
        <el-form-item
          label="最小旋转角度"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.wordStyle.rotation[0]"
            :min="0"
            :step="5"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="最大旋转角度"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.wordStyle.rotation[1]"
            :min="0"
            :step="5"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="旋转步数"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.wordStyle.rotationSteps"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        title="文字动态描边"
      >
        <el-form-item
          label="粗细"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.state.active.style.lineWidth"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="颜色"
          class="form-item-box"
        >
          <el-color-picker
            v-model="config.option.state.active.style.stroke"
            @change="changeStyle"
          />
        </el-form-item>
      </el-collapse-item>
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
  lineCapOptions,
  YuJueGraphOptions
} from '@gcpaas/data-room-ui/packages/js/utils/options'
import ColorMultipleSelect from '@gcpaas/data-room-ui/packages/components/common/panel/ColorMultipleSelect/index.vue'
export default {
  name: '',
  components: {
    TransformSet,
    ColorMultipleSelect
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
      lineCapOptions,
      YuJueGraphOptions
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType
    }
  },
  watch: {},
  created () {
  },
  mounted () {},
  methods: {
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/common.scss';
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
