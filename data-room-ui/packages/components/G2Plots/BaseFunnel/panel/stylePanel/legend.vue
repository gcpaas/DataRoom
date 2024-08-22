<template>
  <div class="dataroom-legend-wrapper">
    <el-form-item
      label="显示"
      class="form-item-box"
    >
      <el-switch
        v-model="config.option.showLegend"
        @change="changeStyle"
      />
    </el-form-item>
    <template v-if="config.option.showLegend">
      <el-form-item
        label="图例位置"
        class="form-item-box"
      >
        <el-select
          v-model="config.option.legend.position"
          @change="changeStyle"
        >
          <el-option
            v-for="(position,index) in legendPositionList"
            :key="index"
            :label="position.label"
            :value="position.value"
          />
        </el-select>
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
              v-model="config.option.legend.itemName.style.fontFamily"
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
              v-model="config.option.legend.itemName.style.fontWeight"
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
              v-model="config.option.legend.itemName.style.fontSize"
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
              v-model="config.option.legend.itemName.style.fill"
              @change="changeStyle"
            />
            <div class="set-desc">
              颜色
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item
        label="图例间距"
        class="form-item-box"
      >
        <el-row>
          <el-col
            :span="24"
          >
            <el-input-number
              v-model="config.option.legend.offsetX"
              placeholder="请输入内容"
              controls-position="right"
              @change="changeStyle"
            />
            <div class="set-desc">
              水平间距
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-input-number
              v-model="config.option.legend.offsetY"
              placeholder="请输入内容"
              controls-position="right"
              @change="changeStyle"
            />
            <div class="set-desc">
              垂直间距
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-collapse>
        <el-collapse-item
          title="分类图例"
        >
          <el-form-item
            label="图例标记"
            class="form-item-box"
          >
            <el-row>
              <el-col :span="24">
                <el-select
                  v-model="config.option.legend.marker.symbol"
                  placeholder="请选择形状"
                  @change="changeStyle"
                >
                  <el-option
                    v-for="item in markrList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-col>
            <!--            <el-col :span="11">-->
            <!--              <el-input-number-->
            <!--                v-model="num"-->
            <!--                controls-position="right"-->
            <!--                :min="1"-->
            <!--                :max="10"-->
            <!--              />-->
            <!--              <div>尺寸</div>-->
            <!--            </el-col>-->
            </el-row>
          </el-form-item>
          <el-form-item
            label="图例间距"
            class="form-item-box"
          >
            <el-row>
              <el-col :span="24">
                <el-input-number
                  v-model="config.option.legend.itemSpacing"
                  controls-position="right"
                  @change="changeStyle"
                />
              </el-col>
            <!--            <el-col :span="11">-->
            <!--              <el-input-->
            <!--                v-model="input2"-->
            <!--                placeholder="请输入内容"-->
            <!--              >-->
            <!--                <template slot="append">-->
            <!--                  px-->
            <!--                </template>-->
            <!--              </el-input>-->
            <!--              <div>内间距</div>-->
            <!--            </el-col>-->
            </el-row>
          </el-form-item>
          <el-form-item
            label="最大宽度"
            class="form-item-box"
          >
            <el-row>
              <el-col :span="24">
                <el-input-number
                  v-model="config.option.legend.maxWidth"
                  controls-position="right"
                  @change="changeStyle"
                />
              </el-col>
            </el-row>
          </el-form-item>
          <el-collapse>
            <el-collapse-item
              title="翻页"
            >
              <el-form-item
                label="开启"
                class="form-item-box"
              >
                <el-switch
                  v-model="config.option.legend.flipPage"
                  @change="changeStyle"
                />
              </el-form-item>
              <el-form-item
                label="最大行数"
                class="form-item-box"
              >
                <el-row>
                  <el-col :span="24">
                    <el-input-number
                      v-model="config.option.legend.maxRow"
                      controls-position="right"
                      @change="changeStyle"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item
                class="radio form-item-box"
                label="页码样式"
              >
                <el-row>
                  <el-col
                    :span="12"
                    style="padding-right: 5px"
                  >
                    <el-select
                      v-model="config.option.legend.pageNavigator.text.style.fontFamily"
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
                      v-model="config.option.legend.pageNavigator.text.style.fontWeight"
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
                      v-model="config.option.legend.pageNavigator.text.style.fontSize"
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
                      v-model="config.option.legend.pageNavigator.text.style.fill"
                      @change="changeStyle"
                    />
                    <div class="set-desc">
                      颜色
                    </div>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item
                label="箭头尺寸"
                class="form-item-box"
              >
                <el-row>
                  <el-col :span="24">
                    <el-input-number
                      v-model="config.option.legend.pageNavigator.marker.style.size"
                      controls-position="right"
                      @change="changeStyle"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item
                label="箭头默认色"
                class="form-item-box"
              >
                <el-row>
                  <el-col :span="24">
                    <el-color-picker
                      v-model="config.option.legend.pageNavigator.marker.style.fill"
                      class="wenbenyangshiyanse"
                      show-alpha
                      @change="changeStyle"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item
                label="箭头禁用色"
                class="form-item-box"
              >
                <el-row>
                  <el-col :span="24">
                    <el-color-picker
                      v-model="config.option.legend.pageNavigator.marker.style.inactiveFill"
                      class="wenbenyangshiyanse"
                      show-alpha
                      @change="changeStyle"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>

        <el-collapse-item
          title="连续图例"
        >
          <el-form-item
            label="滑轨样式"
            class="form-item-box"
          >
            <el-row>
              <el-col :span="24">
                <el-radio-group
                  v-model="config.option.legend.rail.type"
                  @change="changeStyle"
                >
                  <el-radio-button label="color">
                    color
                  </el-radio-button>
                  <el-radio-button label="size">
                    size
                  </el-radio-button>
                </el-radio-group>
              </el-col>
            </el-row>
            <el-row style="margin-top: 10px">
              <el-col
                :span="24"
              >
                <el-input-number
                  v-model="config.option.legend.rail.defaultLength"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  长度
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-input-number
                  v-model="config.option.legend.rail.size"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  高度
                </div>
              </el-col>
            </el-row>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </template>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { fontWeightOptions, fonFamilyList, markrList, railList, legendPositionList } from '@gcpaas/data-room-ui/packages/js/utils/options'
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
export default {
  name: '',
  components: {},
  mixins: [commonMixins],
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
      markrList,
      railList,
      legendPositionList
    }
  },
  inject: ['canvasInst'],
  computed: {},
  watch: {},
  created () {},
  mounted () {

  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
