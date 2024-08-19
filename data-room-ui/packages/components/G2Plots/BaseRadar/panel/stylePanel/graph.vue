<template>
  <div class="dataroom-graph-wrapper">
    <el-form-item
      label="面积填充"
      class="form-item-box"
    >
      <el-switch
        v-model="config.option.area.style.fillOpacity"
        :active-value="0.25"
        :inactive-value="0"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="是否平滑"
      class="form-item-box"
    >
      <el-switch
        v-model="config.option.smooth"
        :active-value="true"
        :inactive-value="false"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="颜色"
      class="form-item-box"
    >
      <GradualSetting
        v-model="config.option.color"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="数据点颜色"
    >
      <el-color-picker
        v-model="config.option.point.style.fill"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="数据点符号"
    >
      <el-row>
        <el-col
          :span="12"
          style="padding-right: 5px"
        >
          <el-select
            v-model="config.option.point.shape"
            placeholder="请选择"
            @change="changeStyle"
          >
            <el-option
              v-for="item in pointShapeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="set-desc">
            形状
          </div>
        </el-col>
        <el-col
          :span="12"
          style="padding-left: 5px"
        >
          <el-input-number
            v-model="config.option.point.size"
            class="number-input-box number-input-half "
            type="number"
            controls-position="right"
            @change="changeStyle"
          />
        </el-col>
        <div class="set-desc">
          大小
        </div>
      </el-row>
    </el-form-item>
    <el-collapse>
      <el-collapse-item
        title="数据标签"
      >
        <el-form-item
          label="显示"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.label.style.opacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.label.style.opacity">
          <el-form-item
            class="radio form-item-box"
            label="文本样式"
          >
            <el-row>
              <el-col
                :span="12"
                style="padding-right: 5px"
              >
                <el-select
                  v-model="config.option.label.style.fontFamily"
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
                  v-model="config.option.label.style.fontWeight"
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
                  v-model="config.option.label.style.fontSize"
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
                  v-model="config.option.label.style.fill"
                  @change="changeStyle"
                />
                <div class="set-desc color-desc">
                  颜色
                </div>
              </el-col>
            </el-row>
          </el-form-item>
        </template>
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
import GradualSetting from '@gcpaas/data-room-ui/packages/components/common/panel/GradualSetting/index.vue'
import {
  fontWeightOptions,
  fonFamilyList,
  positionOptions,
  lineTypeOptions,
  lineStyleOptions,
  pointShapeOptions
} from '@gcpaas/data-room-ui/packages/js/utils/options'
export default {
  name: '',
  components: {
    GradualSetting,
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
      lineTypeOptions,
      lineStyleOptions,
      pointShapeOptions
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType
    }
  },
  watch: {
  },
  created () {},
  mounted () {},
  methods: {
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/common.scss';
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
