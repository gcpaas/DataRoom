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
      <el-collapse-item
        title="轴线"
      >
        <el-form-item
          class="form-item-box radio"
          label="线型样式"
        >
          <el-row>
            <el-col :span="18">
              <el-input-number
                v-model="config.option[axis].line.style.lineWidth"
                controls-position="right"
                :min="0"
                @change="changeStyle"
              />
              <div class="set-desc">
                粗细
              </div>
            </el-col>
            <el-col
              :span="6"
              class="form-item-col"
            >
              <el-color-picker
                v-model="config.option[axis].line.style.stroke"
                show-alpha
                @change="changeStyle"
              />
              <div class="set-desc color-desc">
                颜色
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        title="轴标题"
      >
        <el-form-item
          class="radio form-item-box"
          label="标题内容"
        >
          <el-row>
            <el-col :span="24">
              <el-input
                v-model="config.option[axis].title.text"
                placeholder="请输入标签内容"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='Y'"
          class="radio form-item-box"
          label="标题过长时旋转"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].title.autoRotate"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='X'"
          class="radio form-item-box"
          label="标题位置"
        >
          <el-select
            v-model="config.option[axis].title.position"
            placeholder="请选择标题位置"
            @change="changeStyle"
          >
            <el-option
              v-for="item in axisXTitlePositionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="axisType==='Y'"
          class="radio form-item-box"
          label="标题位置"
        >
          <el-select
            v-model="config.option[axis].title.position"
            placeholder="请选择标题位置"
            @change="changeStyle"
          >
            <el-option
              v-for="item in axisYTitlePositionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="偏移"
          class="form-item-box"
        >
          <el-row>
            <el-col :span="24">
              <el-input-number
                v-model="config.option[axis].title.offset"
                controls-position="right"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
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
                v-model="config.option[axis].title.style.fontFamily"
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
                v-model="config.option[axis].title.style.fontWeight"
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
            <el-col
              :span="18"
            >
              <el-input-number
                v-model="config.option[axis].title.style.fontSize"
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
                v-model="config.option[axis].title.style.fill"
                @change="changeStyle"
              />
              <div class="set-desc color-desc">
                颜色
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        title="轴标签"
      >
        <el-form-item
          class="form-item-box radio"
          label="偏移"
        >
          <el-row>
            <el-col :span="24">
              <el-input-number
                v-model="config.option[axis].label.offset"
                controls-position="right"
                placeholder="请输入内容"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='X'"
          class="form-item-box radio"
          label="标签过多时隐藏"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].label.autoHideEnable"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='X'"
          class="form-item-box radio"
          label="标签过多时旋转"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].label.autoRotate"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='X'"
          class="form-item-box radio"
          label="标签过多时省略"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].label.autoEllipsis"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item
          v-if="axisType==='Y'"
          class="form-item-box radio"
          label="标签过多时隐藏"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].label.autoHideEnable"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='Y'"
          class="form-item-box radio"
          label="标签过多时旋转"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].label.autoRotate"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          v-if="axisType==='Y'"
          class="form-item-box radio"
          label="标签过多时省略"
        >
          <el-row>
            <el-col :span="24">
              <el-switch
                v-model="config.option[axis].label.autoEllipsis"
                @change="changeStyle"
              />
            </el-col>
          </el-row>
        </el-form-item>
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
      </el-collapse-item>
      <el-collapse-item
        title="刻度线"
      >
        <el-form-item
          label="线型样式"
          class="form-item-box"
        >
          <el-row>
            <el-col
              :span="24"
            >
              <el-input-number
                v-model="config.option[axis].tickLine.length"
                :max="100"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                长度
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="18">
              <el-input-number
                v-model="config.option[axis].tickLine.style.lineWidth"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                粗细
              </div>
            </el-col>
            <el-col
              :span="6"
              class="form-item-col"
            >
              <el-color-picker
                v-model="config.option[axis].tickLine.style.stroke"
                class="wenbenyangshiyanse"
                show-alpha
                @change="changeStyle"
              />
              <div class="set-desc color-desc">
                颜色
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        title="网格线"
      >
        <el-form-item
          label="线型样式"
          class="form-item-box"
        >
          <el-row>
            <el-col
              :span="24"
              style="margin-bottom: 10px"
            >
              <el-select
                v-model="config.option[axis].grid.line.style.lineDash[1]"
                @change="changeStyle"
              >
                <el-option
                  label="实线"
                  :value="0"
                />
                <el-option
                  label="虚线"
                  :value="5"
                />
              </el-select>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="18">
              <el-input-number
                v-model="config.option[axis].grid.line.style.lineWidth"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                粗细
              </div>
            </el-col>
            <el-col
              :span="6"
              class="form-item-col"
            >
              <el-color-picker
                v-model="config.option[axis].grid.line.style.stroke"
                class="wenbenyangshiyanse"
                show-alpha
                @change="changeStyle"
              />
              <div
                class="set-desc color-desc"
              >
                颜色
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import { fontWeightOptions, fonFamilyList, axisXTitlePositionOptions, axisYTitlePositionOptions } from '@gcpaas/data-room-ui/packages/js/utils/options'
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
      axisXTitlePositionOptions,
      axisYTitlePositionOptions,
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
