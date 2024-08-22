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
<!--      <el-form-item-->
<!--        label="标记大小"-->
<!--        class="form-item-box"-->
<!--      >-->
<!--        <el-input-number-->
<!--          v-model="config.option.legend.items.marker.style.r"-->
<!--          placeholder="请输入内容"-->
<!--          controls-position="right"-->
<!--          @change="changeStyle"-->
<!--        />-->
<!--      </el-form-item>-->
    </template>
  </div>
</template>

<script>
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
