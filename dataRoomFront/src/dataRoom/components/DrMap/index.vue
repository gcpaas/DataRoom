<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrMap',
})
</script>
<script setup lang="ts">
import type { DrMapConfig } from './install.ts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { mapApi } from '@/dataRoom/map/api.ts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'
import anhuiGeoJson from './mock/anhui.json'

interface RegionDatum {
  name: string
  value: number
  regionCode?: string
}

interface MarkerDatum {
  name: string
  lng: number
  lat: number
  value: number
}

interface LineDatum {
  fromName?: string
  toName?: string
  coords: [[number, number], [number, number]]
  value?: number
}

interface MapDatasetValue {
  regions?: RegionDatum[]
  markers?: MarkerDatum[]
  lines?: LineDatum[]
  visualPieces?: DrMapConfig['props']['visualMap']['pieces']
  data?: unknown[]
}

interface GeoJsonFeature {
  type: 'Feature'
  properties: {
    name?: string
    code?: string
    adcode?: string | number
    center?: [number, number]
    centroid?: [number, number]
    cp?: [number, number]
    [key: string]: unknown
  }
  geometry: unknown
}

interface GeoJsonData {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

interface ChartEventParam {
  seriesName?: string
  name?: string
  value?: unknown
  data?: {
    regionCode?: string
  }
}

interface MapDetailLike {
  data?: {
    geoJson?: string
  }
}

const { chart } = defineProps<{
  chart: DrMapConfig
}>()

const chartRef = ref<HTMLElement>()
const currentRegionCode = ref(chart.props.source.regionCode)
const regionStack = ref<string[]>([])
const geoJsonLoaded = ref(false)
const loadMessage = ref('')
const mapDataset = ref<MapDatasetValue>({})
let chartInstance: echarts.ECharts | null = null
let registeredMapName = ''

const defaultDataset: Required<Pick<MapDatasetValue, 'regions' | 'markers' | 'lines'>> = {
  regions: [
    { name: '合肥市', value: 920, regionCode: '340100' },
    { name: '芜湖市', value: 680, regionCode: '340200' },
    { name: '蚌埠市', value: 420, regionCode: '340300' },
    { name: '淮南市', value: 360, regionCode: '340400' },
    { name: '马鞍山市', value: 390, regionCode: '340500' },
    { name: '淮北市', value: 280, regionCode: '340600' },
    { name: '铜陵市', value: 260, regionCode: '340700' },
    { name: '安庆市', value: 510, regionCode: '340800' },
    { name: '黄山市', value: 330, regionCode: '341000' },
    { name: '滁州市', value: 470, regionCode: '341100' },
    { name: '阜阳市', value: 760, regionCode: '341200' },
    { name: '宿州市', value: 430, regionCode: '341300' },
    { name: '六安市', value: 520, regionCode: '341500' },
    { name: '亳州市', value: 410, regionCode: '341600' },
    { name: '池州市', value: 240, regionCode: '341700' },
    { name: '宣城市', value: 350, regionCode: '341800' },
  ],
  markers: [
    { name: '合肥', lng: 117.283042, lat: 31.86119, value: 920 },
    { name: '芜湖', lng: 118.376451, lat: 31.326319, value: 680 },
    { name: '阜阳', lng: 115.819729, lat: 32.896969, value: 760 },
    { name: '黄山', lng: 118.317325, lat: 29.709239, value: 330 },
  ],
  lines: [
    {
      fromName: '合肥',
      toName: '芜湖',
      coords: [
        [117.283042, 31.86119],
        [118.376451, 31.326319],
      ],
      value: 680,
    },
    {
      fromName: '合肥',
      toName: '阜阳',
      coords: [
        [117.283042, 31.86119],
        [115.819729, 32.896969],
      ],
      value: 760,
    },
    {
      fromName: '合肥',
      toName: '黄山',
      coords: [
        [117.283042, 31.86119],
        [118.317325, 29.709239],
      ],
      value: 330,
    },
  ],
}

const onlineMode = computed(() => chart.props.source.mode === 'online')
const canDrillUp = computed(() => regionStack.value.length > 0)

const getFirstField = (name: string, fallback: string) => chart.dataset?.fields?.[name]?.[0] || fallback

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeDataset = (datasetValue: unknown): MapDatasetValue => {
  if (!datasetValue) {
    return {}
  }

  const objectValue = datasetValue as MapDatasetValue
  if (Array.isArray(objectValue.regions) || Array.isArray(objectValue.markers) || Array.isArray(objectValue.lines)) {
    return {
      regions: objectValue.regions || [],
      markers: objectValue.markers || [],
      lines: objectValue.lines || [],
      visualPieces: objectValue.visualPieces,
    }
  }

  const rows = Array.isArray(datasetValue)
    ? datasetValue
    : Array.isArray(objectValue.data)
      ? objectValue.data
      : []

  const regionNameField = getFirstField('regionNameField', 'regionName')
  const regionValueField = getFirstField('regionValueField', 'regionValue')
  const markerNameField = getFirstField('markerNameField', 'markerName')
  const longitudeField = getFirstField('longitudeField', 'lng')
  const latitudeField = getFirstField('latitudeField', 'lat')
  const markerValueField = getFirstField('markerValueField', 'markerValue')
  const lineFromLngField = getFirstField('lineFromLngField', 'fromLng')
  const lineFromLatField = getFirstField('lineFromLatField', 'fromLat')
  const lineToLngField = getFirstField('lineToLngField', 'toLng')
  const lineToLatField = getFirstField('lineToLatField', 'toLat')

  const regionMap = new Map<string, RegionDatum>()
  const markers: MarkerDatum[] = []
  const lines: LineDatum[] = []

  rows.forEach((row) => {
    const item = row as Record<string, unknown>
    const regionName = item[regionNameField] || item.name
    if (regionName) {
      const name = String(regionName)
      regionMap.set(name, {
        name,
        value: toNumber(item[regionValueField] ?? item.value),
        regionCode: String(item.regionCode || item.code || ''),
      })
    }

    const lng = toNumber(item[longitudeField], Number.NaN)
    const lat = toNumber(item[latitudeField], Number.NaN)
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      markers.push({
        name: String(item[markerNameField] || item.name || ''),
        lng,
        lat,
        value: toNumber(item[markerValueField] ?? item.value),
      })
    }

    const fromLng = toNumber(item[lineFromLngField], Number.NaN)
    const fromLat = toNumber(item[lineFromLatField], Number.NaN)
    const toLng = toNumber(item[lineToLngField], Number.NaN)
    const toLat = toNumber(item[lineToLatField], Number.NaN)
    if ([fromLng, fromLat, toLng, toLat].every(Number.isFinite)) {
      lines.push({
        fromName: String(item.fromName || ''),
        toName: String(item.toName || ''),
        coords: [
          [fromLng, fromLat],
          [toLng, toLat],
        ],
        value: toNumber(item.value),
      })
    }
  })

  return {
    regions: Array.from(regionMap.values()),
    markers,
    lines,
  }
}

const changeData = (datasetValue: unknown) => {
  mapDataset.value = normalizeDataset(datasetValue)
  updateChart()
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const getActiveDataset = () => ({
  regions: mapDataset.value.regions?.length ? mapDataset.value.regions : defaultDataset.regions,
  markers: mapDataset.value.markers?.length ? mapDataset.value.markers : defaultDataset.markers,
  lines: mapDataset.value.lines?.length ? mapDataset.value.lines : defaultDataset.lines,
  visualPieces: mapDataset.value.visualPieces?.length ? mapDataset.value.visualPieces : chart.props.visualMap.pieces,
})

const defaultRegionCode = '340000'
const getDefaultGeoJson = () => anhuiGeoJson as unknown as GeoJsonData

const registerGeoJson = (regionCode: string, geoJson: GeoJsonData, suffix = '') => {
  registeredMapName = `dr_map_${regionCode}_${chart.id}${suffix}`
  echarts.registerMap(registeredMapName, geoJson as never)
  geoJsonLoaded.value = true
}

const extractGeoJson = (detail: unknown): GeoJsonData | null => {
  const mapDetail = detail as MapDetailLike
  return mapDetail.data?.geoJson ? (JSON.parse(mapDetail.data.geoJson) as GeoJsonData) : null
}

const loadGeoJson = async (regionCode: string) => {
  if (onlineMode.value) {
    geoJsonLoaded.value = false
    return
  }

  if (!regionCode || regionCode === defaultRegionCode) {
    registerGeoJson(defaultRegionCode, getDefaultGeoJson())
    loadMessage.value = ''
    return
  }

  try {
    const detail = { data: await mapApi.detail(regionCode) }
    const geoJson = extractGeoJson(detail) || getDefaultGeoJson()
    registerGeoJson(regionCode, geoJson)
    loadMessage.value = ''
  } catch (error) {
    registerGeoJson(regionCode, getDefaultGeoJson(), '_fallback')
    loadMessage.value = '当前使用内置安徽省地图'
  }
}

const buildRegionCodeMap = () => {
  const activeData = getActiveDataset()
  const codeMap = new Map<string, string>()
  activeData.regions.forEach((item) => {
    if (item.regionCode) {
      codeMap.set(item.name, item.regionCode)
    }
  })
  return codeMap
}

const buildOption = (): echarts.EChartsOption => {
  const props = chart.props
  const activeData = getActiveDataset()

  const mapSeries: Record<string, unknown> = {
    name: '行政区',
    type: 'map',
    map: registeredMapName,
    roam: props.view.roam,
    selectedMode: false,
    data: activeData.regions,
    label: {
      show: props.regionLabel.show,
      fontSize: props.regionLabel.fontSize,
      color: props.regionLabel.color,
    },
    itemStyle: {
      areaColor: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.8,
        colorStops: [
          { offset: 0, color: props.regionStyle.areaGradient[0] },
          { offset: 1, color: props.regionStyle.areaGradient[1] },
        ],
      },
      borderColor: props.regionStyle.borderColor,
      borderWidth: props.regionStyle.borderWidth,
      shadowColor: props.regionStyle.shadowColor,
      shadowBlur: props.regionStyle.shadowBlur,
      shadowOffsetX: props.regionStyle.shadowOffset[0],
      shadowOffsetY: props.regionStyle.shadowOffset[1],
    },
    emphasis: {
      disabled: props.emphasis.disabled,
      label: {
        fontSize: props.emphasis.label.fontSize,
        color: props.emphasis.label.color,
      },
      itemStyle: {
        areaColor: props.emphasis.areaColor,
        borderWidth: props.emphasis.borderWidth,
        shadowColor: props.emphasis.shadowColor,
      },
    },
  }

  const markerSeries = props.marker.show && props.marker.type !== 'none'
    ? [{
        name: '标记点',
        type: props.marker.type === 'effectScatter' ? 'effectScatter' : 'scatter',
        coordinateSystem: 'geo',
        symbol: props.marker.type === 'pin' ? 'pin' : 'circle',
        symbolSize: props.marker.symbolSize,
        data: activeData.markers.map((item) => ({
          name: item.name,
          value: [item.lng, item.lat, item.value],
        })),
        rippleEffect: {
          show: props.marker.ripple.show,
          scale: props.marker.ripple.scale,
          brushType: props.marker.ripple.brushType,
          color: props.marker.ripple.color,
        },
        itemStyle: {
          color: props.marker.color,
          borderColor: props.marker.borderColor,
          borderWidth: props.marker.borderWidth,
        },
        label: {
          show: props.marker.label.show,
          position: props.marker.label.position,
          fontSize: props.marker.label.fontSize,
          color: props.marker.label.color,
          offset: props.marker.label.offset,
          formatter: '{b}',
        },
      }]
    : []

  const lineSeries = props.flowLine.show
    ? [{
        name: '飞线',
        type: 'lines',
        coordinateSystem: 'geo',
        data: activeData.lines,
        lineStyle: {
          color: props.flowLine.color,
          width: props.flowLine.width,
          opacity: props.flowLine.opacity,
          curveness: props.flowLine.curveness,
        },
        effect: {
          show: props.flowLine.effect.show,
          period: props.flowLine.effect.period,
          trailLength: props.flowLine.effect.trailLength,
          symbol: props.flowLine.effect.symbol,
          symbolSize: props.flowLine.effect.symbolSize,
        },
      }]
    : []

  const option: echarts.EChartsOption = {
    tooltip: {
      show: props.tooltip.show,
      trigger: props.tooltip.trigger,
      backgroundColor: props.tooltip.backgroundColor,
      borderColor: props.tooltip.borderColor,
      textStyle: {
        fontSize: props.tooltip.textStyle.fontSize,
        color: props.tooltip.textStyle.color,
      },
      formatter: (params: unknown) => {
        const item = (Array.isArray(params) ? params[0] : params) as ChartEventParam
        if (item.seriesName === '标记点' && Array.isArray(item.value)) {
          return `${item.name}: ${item.value[2]}`
        }
        return item.name || ''
      },
    },
    geo: {
      map: registeredMapName,
      roam: props.view.roam,
      silent: true,
      itemStyle: {
        areaColor: 'transparent',
        borderColor: 'transparent',
      },
    },
    series: [mapSeries, ...markerSeries, ...lineSeries] as never,
  }

  if (props.visualMap.show) {
    option.visualMap = {
      show: true,
      type: 'piecewise',
      orient: props.visualMap.orient,
      left: 12,
      bottom: 12,
      pieces: activeData.visualPieces,
      inRange: {
        color: props.visualMap.colors,
      },
      textStyle: props.visualMap.textStyle,
    }
  }

  return option
}

const updateChart = async () => {
  if (!chartInstance || onlineMode.value) return
  if (!registeredMapName || !geoJsonLoaded.value) {
    await loadGeoJson(currentRegionCode.value)
  }
  if (!registeredMapName) return
  chartInstance.setOption(buildOption(), true)
  chartInstance.resize()
}

const initChart = async () => {
  if (!chartRef.value || onlineMode.value) return
  chartInstance = echarts.init(chartRef.value)

  chartInstance.on('click', (params: unknown) => {
    const item = params as ChartEventParam
    const name = item.name || ''
    const codeMap = buildRegionCodeMap()
    if (item.seriesName === '标记点' && Array.isArray(item.value)) {
      canvasInst.triggerChartBehavior(chart.id, 'markerClick', {
        name,
        lng: item.value[0],
        lat: item.value[1],
        value: item.value[2],
      })
      return
    }

    const regionCode = String(item.data?.regionCode || codeMap.get(name) || '')
    canvasInst.triggerChartBehavior(chart.id, 'regionClick', {
      name,
      regionCode,
      value: toNumber(item.value),
    })

    if (chart.props.source.enableDrillDown && regionCode) {
      drillDown(regionCode, name)
    }
  })

  await loadGeoJson(currentRegionCode.value)
  updateChart()
}

const drillDown = async (regionCode: string, name: string) => {
  regionStack.value.push(currentRegionCode.value)
  currentRegionCode.value = regionCode
  await loadGeoJson(regionCode)
  updateChart()
  canvasInst.triggerChartBehavior(chart.id, 'drillDown', {
    name,
    regionCode,
  })
}

const drillUp = async () => {
  const previousCode = regionStack.value.pop()
  if (!previousCode) return
  currentRegionCode.value = previousCode
  await loadGeoJson(previousCode)
  updateChart()
  canvasInst.triggerChartBehavior(chart.id, 'drillUp', {
    regionCode: previousCode,
  })
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(
  () => chart.props,
  () => {
    nextTick(() => updateChart())
  },
  { deep: true },
)

watch(
  () => chart.props.source.regionCode,
  async (regionCode) => {
    currentRegionCode.value = regionCode
    regionStack.value = []
    await loadGeoJson(regionCode)
    updateChart()
  },
)

watch(
  () => [chart.w, chart.h],
  () => {
    nextTick(() => handleResize())
  },
)

onMounted(() => {
  nextTick(() => initChart())
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-map" :id="chart.id">
    <template v-if="onlineMode">
      <div class="dr-map__placeholder">
        <div class="dr-map__placeholder-title">在线底图暂未接入</div>
        <div class="dr-map__placeholder-desc">已保留在线底图配置，可切换为 GeoJSON 模式渲染行政区地图</div>
      </div>
    </template>
    <template v-else>
      <button v-if="canDrillUp" class="dr-map__back" type="button" :style="{ fontSize: `${chart.props.backControl.fontSize}px`, color: chart.props.backControl.color }" @click="drillUp">
        {{ chart.props.backControl.text }}
      </button>
      <div ref="chartRef" class="dr-map__chart"></div>
      <div v-if="loadMessage" class="dr-map__message">{{ loadMessage }}</div>
    </template>
  </div>
</template>

<style scoped>
.dr-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dr-map__chart {
  width: 100%;
  height: 100%;
}

.dr-map__back {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  letter-spacing: 0;
}

.dr-map__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  background: var(--el-fill-color-extra-light);
  color: var(--el-text-color-regular);
  text-align: center;
  letter-spacing: 0;
}

.dr-map__placeholder-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dr-map__placeholder-desc,
.dr-map__message {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.dr-map__message {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 2;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  letter-spacing: 0;
}
</style>
