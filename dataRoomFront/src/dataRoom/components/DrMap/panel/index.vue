<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrMapControlPanel',
})
</script>
<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import { computed } from 'vue'
import type { DrMapConfig } from '../install.ts'

const { chart } = defineProps<{
  chart: DrMapConfig
}>()

const chartConfig = computed(() => chart)

const modeOptions = [
  { label: 'GeoJSON', value: 'geoJson' },
  { label: '在线底图', value: 'online' },
]

const orientOptions = [
  { label: '纵向', value: 'vertical' },
  { label: '横向', value: 'horizontal' },
]

const markerTypeOptions = [
  { label: '涟漪点', value: 'effectScatter' },
  { label: '圆点', value: 'circle' },
  { label: '气泡针', value: 'pin' },
  { label: '不显示', value: 'none' },
]

const labelPositionOptions = [
  { label: '上', value: 'top' },
  { label: '下', value: 'bottom' },
  { label: '左', value: 'left' },
  { label: '右', value: 'right' },
  { label: '内部', value: 'inside' },
]

const featureOptions = [
  { label: '背景', value: 'bg' },
  { label: '兴趣点', value: 'point' },
  { label: '道路', value: 'road' },
  { label: '建筑', value: 'building' },
]

const addPiece = () => {
  chartConfig.value.props.visualMap.pieces.push({ gte: 0, lte: 100, label: '0-100' })
}

const removePiece = (index: number) => {
  if (chartConfig.value.props.visualMap.pieces.length > 1) {
    chartConfig.value.props.visualMap.pieces.splice(index, 1)
  }
}

const addVisualColor = () => {
  chartConfig.value.props.visualMap.colors.push(chartConfig.value.props.visualMap.colors[0] || '')
}

const removeVisualColor = (index: number) => {
  if (chartConfig.value.props.visualMap.colors.length > 1) {
    chartConfig.value.props.visualMap.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-map-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="数据源" name="source">
          <el-form-item label="渲染模式">
            <DrSelectField v-model="chartConfig.props.source.mode">
              <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="区域编码">
            <DrInputField v-model="chartConfig.props.source.regionCode" placeholder="china 或行政区编码" />
          </el-form-item>
          <el-form-item label="南海附图">
            <el-switch v-model="chartConfig.props.source.showSouthChinaSea" />
          </el-form-item>
          <el-form-item label="区域下钻">
            <el-switch v-model="chartConfig.props.source.enableDrillDown" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>在线底图</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">密钥</span>
                  <DrInputField v-model="chartConfig.props.source.onlineProvider.apiKey" class="dr-config-panel__control" placeholder="API Key" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">样式</span>
                  <DrInputField v-model="chartConfig.props.source.onlineProvider.style" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">自定义样式</span>
                  <DrInputField v-model="chartConfig.props.source.onlineProvider.customStyleId" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">语言</span>
                  <DrInputField v-model="chartConfig.props.source.onlineProvider.language" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="视图" name="view">
          <el-form-item label="缩放">
            <DrNumberField v-model="chartConfig.props.view.zoom" :min="0" :max="18" :step="0.1" controls-position="right" />
          </el-form-item>
          <el-form-item label="可缩放">
            <el-switch v-model="chartConfig.props.view.roam" />
          </el-form-item>
          <el-form-item label="视图模式">
            <el-radio-group v-model="chartConfig.props.view.viewMode">
              <el-radio-button class="config-panel-text" value="2D">2D</el-radio-button>
              <el-radio-button class="config-panel-text" value="3D">3D</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <DrFieldRow label="中心" paired variant="wide-equal">
            <template #first>
              <DrNumberField v-model="chartConfig.props.view.center[0]" :min="-180" :max="180" :step="0.000001" controls-position="right" label="经" aria-label="中心经度">
                <template #suffix>°</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrNumberField v-model="chartConfig.props.view.center[1]" :min="-90" :max="90" :step="0.000001" controls-position="right" label="纬" aria-label="中心纬度">
                <template #suffix>°</template>
              </DrNumberField>
            </template>
          </DrFieldRow>
          <el-form-item label="俯仰角">
            <DrNumberField v-model="chartConfig.props.view.pitch" :min="0" :max="83" controls-position="right" />
          </el-form-item>
          <el-form-item label="天空色">
            <DrColorField v-model="chartConfig.props.view.skyColor" show-alpha />
          </el-form-item>
          <el-form-item label="底图标注">
            <el-switch v-model="chartConfig.props.view.showOnlineLabel" />
          </el-form-item>
          <el-form-item label="底图要素">
            <el-checkbox-group v-model="chartConfig.props.view.onlineFeatures">
              <el-checkbox class="config-panel-text" v-for="item in featureOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="行政区" name="regionStyle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>区域样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">中心色</span>
                  <DrColorField v-model="chartConfig.props.regionStyle.areaGradient[0]" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">边缘色</span>
                  <DrColorField v-model="chartConfig.props.regionStyle.areaGradient[1]" show-alpha />
                </div>
              </el-form-item>
              <DrFieldRow label="边框" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.regionStyle.borderWidth" class="dr-config-panel__control" :min="0" :max="20" controls-position="right" aria-label="区域边框宽度">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.regionStyle.borderColor" show-alpha aria-label="区域边框颜色" />
                </template>
              </DrFieldRow>
              <DrFieldRow label="阴影" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.regionStyle.shadowBlur" class="dr-config-panel__control" :min="0" :max="100" controls-position="right" aria-label="区域阴影模糊">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.regionStyle.shadowColor" show-alpha aria-label="区域阴影颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="区域名称" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">区域名称</span></template>
              <el-switch v-model="chartConfig.props.regionLabel.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.regionLabel.fontSize" class="dr-config-panel__control" :min="8" :max="40" controls-position="right" aria-label="区域名称字号">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.regionLabel.color" show-alpha aria-label="区域名称颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="高亮" name="emphasis">
          <el-form-item label="禁用高亮">
            <el-switch v-model="chartConfig.props.emphasis.disabled" />
          </el-form-item>
          <el-form-item label="区域色">
            <DrColorField v-model="chartConfig.props.emphasis.areaColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框宽度">
            <DrNumberField v-model="chartConfig.props.emphasis.borderWidth" :min="0" :max="20" controls-position="right" />
          </el-form-item>
          <el-form-item label="阴影色">
            <DrColorField v-model="chartConfig.props.emphasis.shadowColor" show-alpha />
          </el-form-item>
          <DrFieldRow label="标签字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.emphasis.label.fontSize" :min="8" :max="40" controls-position="right" aria-label="高亮标签字号">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.emphasis.label.color" show-alpha aria-label="高亮标签颜色" />
            </template>
          </DrFieldRow>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="数值分段" name="visualMap">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.visualMap.show" />
          </el-form-item>
          <el-form-item label="方向">
            <DrSelectField v-model="chartConfig.props.visualMap.orient">
              <el-option v-for="item in orientOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="文字色">
            <DrColorField v-model="chartConfig.props.visualMap.textStyle.color" show-alpha />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>分段规则</span>
              <el-button class="config-panel-text" @click="addPiece">新增</el-button>
            </div>
            <div v-for="(piece, index) in chartConfig.props.visualMap.pieces" :key="index" class="dr-map-config-panel__list-item">
              <DrInputField v-model="piece.label" placeholder="标签" />
              <DrFieldRow label="范围" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="piece.gte" placeholder="大于等于" controls-position="right" label="≥" aria-label="分段下限（含）" />
                </template>
                <template #second>
                  <DrNumberField v-model="piece.lte" placeholder="小于等于" controls-position="right" label="≤" aria-label="分段上限（含）" />
                </template>
              </DrFieldRow>
              <el-button class="config-panel-text" @click="removePiece(index)">删除</el-button>
            </div>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>分段颜色</span>
              <el-button class="config-panel-text" @click="addVisualColor">新增</el-button>
            </div>
            <div v-for="(color, index) in chartConfig.props.visualMap.colors" :key="index" class="dr-map-config-panel__color-row">
              <DrColorField v-model="chartConfig.props.visualMap.colors[index]" show-alpha />
              <el-button class="config-panel-text" @click="removeVisualColor(index)">删除</el-button>
            </div>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标记点" name="marker">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.marker.show" />
          </el-form-item>
          <el-form-item label="类型">
            <DrSelectField v-model="chartConfig.props.marker.type">
              <el-option v-for="item in markerTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <DrFieldRow label="标记" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.marker.symbolSize" :min="0" :max="100" controls-position="right" aria-label="标记点大小">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.marker.color" show-alpha aria-label="标记点颜色" />
            </template>
          </DrFieldRow>
          <DrFieldRow label="边框" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.marker.borderWidth" :min="0" :max="20" controls-position="right" aria-label="标记点边框宽度">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.marker.borderColor" show-alpha aria-label="标记点边框颜色" />
            </template>
          </DrFieldRow>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="涟漪" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">涟漪</span></template>
              <el-switch v-model="chartConfig.props.marker.ripple.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="扩散" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.marker.ripple.scale" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" aria-label="涟漪扩散倍数">
                    <template #suffix>倍</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.marker.ripple.color" show-alpha aria-label="涟漪颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="标签" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">标签</span></template>
              <el-switch v-model="chartConfig.props.marker.label.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.marker.label.position" class="dr-config-panel__control">
                    <el-option v-for="item in labelPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.marker.label.fontSize" class="dr-config-panel__control" :min="8" :max="40" controls-position="right" aria-label="标记标签字号">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.marker.label.color" show-alpha aria-label="标记标签颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="飞线" name="flowLine">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.flowLine.show" />
          </el-form-item>
          <DrFieldRow label="线条" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.flowLine.width" :min="1" :max="20" controls-position="right" aria-label="飞线宽度">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.flowLine.color" show-alpha aria-label="飞线颜色" />
            </template>
          </DrFieldRow>
          <el-form-item label="透明度">
            <el-slider v-model="chartConfig.props.flowLine.opacity" :min="0" :max="1" :step="0.01" />
          </el-form-item>
          <el-form-item label="弯曲">
            <el-slider v-model="chartConfig.props.flowLine.curveness" :min="0" :max="1" :step="0.01" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="动画" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">动画</span></template>
              <el-switch v-model="chartConfig.props.flowLine.effect.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">周期</span>
                  <DrNumberField v-model="chartConfig.props.flowLine.effect.period" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">尾迹</span>
                  <el-slider v-model="chartConfig.props.flowLine.effect.trailLength" class="dr-config-panel__control" :min="0" :max="1" :step="0.01" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">图形</span>
                  <DrInputField v-model="chartConfig.props.flowLine.effect.symbol" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">图形大小</span>
                  <DrNumberField v-model="chartConfig.props.flowLine.effect.symbolSize" class="dr-config-panel__control" :min="1" :max="40" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="提示与返回" name="feedback">
          <el-form-item label="提示框">
            <el-switch v-model="chartConfig.props.tooltip.show" />
          </el-form-item>
          <el-form-item label="背景色">
            <DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框色">
            <DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha />
          </el-form-item>
          <DrFieldRow label="提示字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.tooltip.textStyle.fontSize" :min="8" :max="40" controls-position="right" aria-label="提示文字字号">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示文字颜色" />
            </template>
          </DrFieldRow>
          <el-form-item label="返回文案">
            <DrInputField v-model="chartConfig.props.backControl.text" />
          </el-form-item>
          <DrFieldRow label="返回字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.backControl.fontSize" :min="10" :max="40" controls-position="right" aria-label="返回文字字号">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.backControl.color" show-alpha aria-label="返回文字颜色" />
            </template>
          </DrFieldRow>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="在线图层" name="onlineLayers">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="卫星图层" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">卫星图层</span></template>
              <el-switch v-model="chartConfig.props.onlineLayers.satellite.show" />
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="chartConfig.props.onlineLayers.satellite.opacity" :min="0" :max="1" :step="0.01" />
            </el-form-item>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item label="路网图层" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">路网图层</span></template>
              <el-switch v-model="chartConfig.props.onlineLayers.roadNet.show" />
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="chartConfig.props.onlineLayers.roadNet.opacity" :min="0" :max="1" :step="0.01" />
            </el-form-item>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item label="交通图层" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">交通图层</span></template>
              <el-switch v-model="chartConfig.props.onlineLayers.traffic.show" />
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="chartConfig.props.onlineLayers.traffic.opacity" :min="0" :max="1" :step="0.01" />
            </el-form-item>
          </div>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-map-config-panel {
  width: 100%;
  letter-spacing: 0;
}

.dr-map-config-panel__color-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.dr-config-panel__control {
  flex: 1;
  min-width: 0;
}

.dr-map-config-panel__list-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  margin-top: 8px;
}
</style>
