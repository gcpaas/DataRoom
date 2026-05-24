<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrMapControlPanel',
})
</script>
<script setup lang="ts">
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="数据源" name="source">
          <el-form-item label="渲染模式">
            <el-select v-model="chartConfig.props.source.mode">
              <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="区域编码">
            <el-input v-model="chartConfig.props.source.regionCode" placeholder="china 或行政区编码" />
          </el-form-item>
          <el-form-item label="南海附图">
            <el-switch v-model="chartConfig.props.source.showSouthChinaSea" />
          </el-form-item>
          <el-form-item label="区域下钻">
            <el-switch v-model="chartConfig.props.source.enableDrillDown" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>在线底图</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">密钥</span>
                  <el-input v-model="chartConfig.props.source.onlineProvider.apiKey" class="dr-config-panel__control" placeholder="API Key" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">样式</span>
                  <el-input v-model="chartConfig.props.source.onlineProvider.style" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">自定义样式</span>
                  <el-input v-model="chartConfig.props.source.onlineProvider.customStyleId" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">语言</span>
                  <el-input v-model="chartConfig.props.source.onlineProvider.language" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="视图" name="view">
          <el-form-item label="缩放">
            <el-input-number v-model="chartConfig.props.view.zoom" :min="0" :max="18" :step="0.1" controls-position="right" />
          </el-form-item>
          <el-form-item label="可缩放">
            <el-switch v-model="chartConfig.props.view.roam" />
          </el-form-item>
          <el-form-item label="视图模式">
            <el-radio-group v-model="chartConfig.props.view.viewMode">
              <el-radio-button value="2D">2D</el-radio-button>
              <el-radio-button value="3D">3D</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="中心经度">
            <el-input-number v-model="chartConfig.props.view.center[0]" :min="-180" :max="180" :step="0.000001" controls-position="right" />
          </el-form-item>
          <el-form-item label="中心纬度">
            <el-input-number v-model="chartConfig.props.view.center[1]" :min="-90" :max="90" :step="0.000001" controls-position="right" />
          </el-form-item>
          <el-form-item label="俯仰角">
            <el-input-number v-model="chartConfig.props.view.pitch" :min="0" :max="83" controls-position="right" />
          </el-form-item>
          <el-form-item label="天空色">
            <el-color-picker v-model="chartConfig.props.view.skyColor" show-alpha />
          </el-form-item>
          <el-form-item label="底图标注">
            <el-switch v-model="chartConfig.props.view.showOnlineLabel" />
          </el-form-item>
          <el-form-item label="底图要素">
            <el-checkbox-group v-model="chartConfig.props.view.onlineFeatures">
              <el-checkbox v-for="item in featureOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="行政区" name="regionStyle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>区域样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">中心色</span>
                  <el-color-picker v-model="chartConfig.props.regionStyle.areaGradient[0]" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边缘色</span>
                  <el-color-picker v-model="chartConfig.props.regionStyle.areaGradient[1]" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.regionStyle.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框宽度</span>
                  <el-input-number v-model="chartConfig.props.regionStyle.borderWidth" class="dr-config-panel__control" :min="0" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">阴影色</span>
                  <el-color-picker v-model="chartConfig.props.regionStyle.shadowColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">阴影模糊</span>
                  <el-input-number v-model="chartConfig.props.regionStyle.shadowBlur" class="dr-config-panel__control" :min="0" :max="100" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>区域名称</span>
              <el-switch v-model="chartConfig.props.regionLabel.show" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.regionLabel.fontSize" class="dr-config-panel__control" :min="8" :max="40" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.regionLabel.color" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="高亮" name="emphasis">
          <el-form-item label="禁用高亮">
            <el-switch v-model="chartConfig.props.emphasis.disabled" />
          </el-form-item>
          <el-form-item label="区域色">
            <el-color-picker v-model="chartConfig.props.emphasis.areaColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框宽度">
            <el-input-number v-model="chartConfig.props.emphasis.borderWidth" :min="0" :max="20" controls-position="right" />
          </el-form-item>
          <el-form-item label="阴影色">
            <el-color-picker v-model="chartConfig.props.emphasis.shadowColor" show-alpha />
          </el-form-item>
          <el-form-item label="标签字号">
            <el-input-number v-model="chartConfig.props.emphasis.label.fontSize" :min="8" :max="40" controls-position="right" />
          </el-form-item>
          <el-form-item label="标签颜色">
            <el-color-picker v-model="chartConfig.props.emphasis.label.color" show-alpha />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="数值分段" name="visualMap">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.visualMap.show" />
          </el-form-item>
          <el-form-item label="方向">
            <el-select v-model="chartConfig.props.visualMap.orient">
              <el-option v-for="item in orientOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="文字色">
            <el-color-picker v-model="chartConfig.props.visualMap.textStyle.color" show-alpha />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>分段规则</span>
              <el-button size="small" @click="addPiece">新增</el-button>
            </div>
            <div v-for="(piece, index) in chartConfig.props.visualMap.pieces" :key="index" class="dr-map-config-panel__list-item">
              <el-input v-model="piece.label" placeholder="标签" />
              <el-input-number v-model="piece.gte" placeholder="大于等于" controls-position="right" />
              <el-input-number v-model="piece.lte" placeholder="小于等于" controls-position="right" />
              <el-button size="small" @click="removePiece(index)">删除</el-button>
            </div>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>分段颜色</span>
              <el-button size="small" @click="addVisualColor">新增</el-button>
            </div>
            <div v-for="(color, index) in chartConfig.props.visualMap.colors" :key="index" class="dr-map-config-panel__color-row">
              <el-color-picker v-model="chartConfig.props.visualMap.colors[index]" show-alpha />
              <el-button size="small" @click="removeVisualColor(index)">删除</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="标记点" name="marker">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.marker.show" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="chartConfig.props.marker.type">
              <el-option v-for="item in markerTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="大小">
            <el-input-number v-model="chartConfig.props.marker.symbolSize" :min="0" :max="100" controls-position="right" />
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.marker.color" show-alpha />
          </el-form-item>
          <el-form-item label="边框色">
            <el-color-picker v-model="chartConfig.props.marker.borderColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框宽度">
            <el-input-number v-model="chartConfig.props.marker.borderWidth" :min="0" :max="20" controls-position="right" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>涟漪</span>
              <el-switch v-model="chartConfig.props.marker.ripple.show" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">倍数</span>
                  <el-input-number v-model="chartConfig.props.marker.ripple.scale" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.marker.ripple.color" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>标签</span>
              <el-switch v-model="chartConfig.props.marker.label.show" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">位置</span>
                  <el-select v-model="chartConfig.props.marker.label.position" class="dr-config-panel__control">
                    <el-option v-for="item in labelPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.marker.label.fontSize" class="dr-config-panel__control" :min="8" :max="40" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.marker.label.color" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="飞线" name="flowLine">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.flowLine.show" />
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.flowLine.color" show-alpha />
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number v-model="chartConfig.props.flowLine.width" :min="1" :max="20" controls-position="right" />
          </el-form-item>
          <el-form-item label="透明度">
            <el-slider v-model="chartConfig.props.flowLine.opacity" :min="0" :max="1" :step="0.01" />
          </el-form-item>
          <el-form-item label="弯曲">
            <el-slider v-model="chartConfig.props.flowLine.curveness" :min="0" :max="1" :step="0.01" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>动画</span>
              <el-switch v-model="chartConfig.props.flowLine.effect.show" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">周期</span>
                  <el-input-number v-model="chartConfig.props.flowLine.effect.period" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">尾迹</span>
                  <el-slider v-model="chartConfig.props.flowLine.effect.trailLength" class="dr-config-panel__control" :min="0" :max="1" :step="0.01" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">图形</span>
                  <el-input v-model="chartConfig.props.flowLine.effect.symbol" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">图形大小</span>
                  <el-input-number v-model="chartConfig.props.flowLine.effect.symbolSize" class="dr-config-panel__control" :min="1" :max="40" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="提示与返回" name="feedback">
          <el-form-item label="提示框">
            <el-switch v-model="chartConfig.props.tooltip.show" />
          </el-form-item>
          <el-form-item label="背景色">
            <el-color-picker v-model="chartConfig.props.tooltip.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框色">
            <el-color-picker v-model="chartConfig.props.tooltip.borderColor" show-alpha />
          </el-form-item>
          <el-form-item label="文字字号">
            <el-input-number v-model="chartConfig.props.tooltip.textStyle.fontSize" :min="8" :max="40" controls-position="right" />
          </el-form-item>
          <el-form-item label="文字颜色">
            <el-color-picker v-model="chartConfig.props.tooltip.textStyle.color" show-alpha />
          </el-form-item>
          <el-form-item label="返回文案">
            <el-input v-model="chartConfig.props.backControl.text" />
          </el-form-item>
          <el-form-item label="返回字号">
            <el-input-number v-model="chartConfig.props.backControl.fontSize" :min="10" :max="40" controls-position="right" />
          </el-form-item>
          <el-form-item label="返回颜色">
            <el-color-picker v-model="chartConfig.props.backControl.color" show-alpha />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="在线图层" name="onlineLayers">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>卫星图层</span>
              <el-switch v-model="chartConfig.props.onlineLayers.satellite.show" />
            </div>
            <el-form-item label="透明度">
              <el-slider v-model="chartConfig.props.onlineLayers.satellite.opacity" :min="0" :max="1" :step="0.01" />
            </el-form-item>
          </div>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>路网图层</span>
              <el-switch v-model="chartConfig.props.onlineLayers.roadNet.show" />
            </div>
            <el-form-item label="透明度">
              <el-slider v-model="chartConfig.props.onlineLayers.roadNet.opacity" :min="0" :max="1" :step="0.01" />
            </el-form-item>
          </div>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>交通图层</span>
              <el-switch v-model="chartConfig.props.onlineLayers.traffic.show" />
            </div>
            <el-form-item label="透明度">
              <el-slider v-model="chartConfig.props.onlineLayers.traffic.opacity" :min="0" :max="1" :step="0.01" />
            </el-form-item>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped>
.dr-map-config-panel {
  width: 100%;
  letter-spacing: 0;
}

.dr-config-panel__form,
.dr-config-panel__section {
  width: 100%;
}

.dr-config-panel__sub-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.dr-config-panel__sub-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  letter-spacing: 0;
}

.dr-config-panel__sub-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dr-config-panel__sub-row,
.dr-map-config-panel__color-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.dr-config-panel__sub-label {
  width: 72px;
  flex: 0 0 72px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-regular);
  letter-spacing: 0;
}

.dr-config-panel__control {
  flex: 1;
}

.dr-map-config-panel__list-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
