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
      label="表盘类型"
      class="form-item-box"
    >
      <el-select
        v-model="config.option.type"
        placeholder="请选择"
        @change="changeStyle"
      >
        <el-option
          v-for="item in gaugeTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="表盘颜色"
      class="form-item-box"
    >
      <GradualSetting
        v-model="config.option.range.color"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="外环半径"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.radius"
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
      label="内环半径"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.innerRadius"
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
      label="圆弧宽度"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.range.width"
        class="number-input-box number-input-half "
        type="number"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      v-if="config.option.type === 'meter'"
      label="总步数"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.meter.steps"
        class="number-input-box number-input-half "
        type="number"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      v-if="config.option.type === 'meter'"
      label="每步占比"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.meter.stepRatio"
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
        title="标签"
      >
        <el-form-item
          class="radio form-item-box"
          label="主标题"
        >
          <el-row>
            <el-col :span="24">
              <el-input
                v-model="config.option.statistic.title.content"
                placeholder="请输入标签内容"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="主标题颜色"
          class="form-item-box"
        >
          <el-color-picker
            v-model="config.option.statistic.title.style.fill"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="主标题大小"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.statistic.title.style.fontSize"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          class="radio form-item-box"
          label="指标样式"
        >
          <el-row>
            <el-col
              :span="12"
              style="padding-right: 5px"
            >
              <el-select
                v-model="config.option.statistic.content.style.fontFamily"
                placeholder="请选择文本样式"
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
                v-model="config.option.statistic.content.style.fontWeight"
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
                v-model="config.option.statistic.content.style.fontSize"
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
                v-model="config.option.statistic.content.style.color"
                @change="changeStyle"
              />
              <div class="set-desc color-desc">
                颜色
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="标签间距大小"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.statistic.title.offsetY"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        title="指示器"
      >
        <el-form-item
          label="指针开启"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.indicator.pointer.style.opacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.indicator.pointer.style.opacity">
          <el-form-item
            class="radio form-item-box"
            label="指针粗细"
          >
            <el-input-number
              v-model="config.option.indicator.pointer.style.lineWidth"
              controls-position="right"
              @change="changeStyle"
            />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="指针颜色"
          >
            <el-color-picker
              v-model="config.option.indicator.pointer.style.stroke"
              @change="changeStyle"
            />
          </el-form-item>
        </template>
        <el-form-item
          label="圆盘开启"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.indicator.pin.style.opacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.indicator.pin.style.opacity">
          <el-form-item
            class="radio form-item-box"
            label="圆盘粗细"
          >
            <el-input-number
              v-model="config.option.indicator.pin.style.lineWidth"
              controls-position="right"
              @change="changeStyle"
            />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="圆盘颜色"
          >
            <el-color-picker
              v-model="config.option.indicator.pin.style.stroke"
              @change="changeStyle"
            />
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
  gaugeTypeOptions
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
