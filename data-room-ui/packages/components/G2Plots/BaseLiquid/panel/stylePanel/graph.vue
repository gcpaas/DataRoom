<template>
  <div class="dataroom-graph-wrapper">
    <el-form-item
      label="形状"
      class="form-item-box"
    >
      <el-select
        v-model="config.option.shape"
        placeholder="请选择"
        @change="changeStyle"
      >
        <el-option
          v-for="item in liquidShapeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="边框颜色"
      class="form-item-box"
    >
      <el-color-picker
        v-model="config.option.outline.color"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="边框宽度"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.outline.border"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="水波个数"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.wave.count"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="水波波长度"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.wave.length"
        controls-position="right"
        @change="changeStyle"
      />
    </el-form-item>
    <el-form-item
      label="波框距离"
      class="form-item-box"
    >
      <el-input-number
        v-model="config.option.outline.distance"
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
          label="文本样式"
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
                v-model="config.option.statistic.content.style.fill"
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
        title="贴图"
      >
        <el-form-item
          label="显示"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.pattern.cfg.fillOpacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.pattern.cfg.fillOpacity">
          <el-form-item
            class="radio form-item-box"
            label="贴图类型"
          >
            <el-select
              v-model="config.option.pattern.type"
              placeholder="请选择文本样式"
              @change="changeStyle"
            >
              <el-option
                v-for="item in patternTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="贴图大小"
          >
            <el-input-number
              v-model="config.option.pattern.cfg.size"
              class="number-input-box number-input-half "
              type="number"
              controls-position="right"
              @change="changeStyle"
            />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="贴图颜色"
          >
            <el-color-picker
              v-model="config.option.pattern.cfg.fill"
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
  liquidShapeOptions, patternTypeOptions
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
      liquidShapeOptions,
      patternTypeOptions
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
