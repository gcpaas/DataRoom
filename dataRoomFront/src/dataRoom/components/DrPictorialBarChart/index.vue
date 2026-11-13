<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import { getResourceUrl } from '@/dataRoom/utils'
import { getChartDatasetFieldNames, shouldUseDefaultChartData } from '../_shared/chart-data-defaults'
import { mockDataset, type DrPictorialBarChartConfig } from './install'
import { imageAddress, toPictorialData } from './data'
import { buildPictorialOption, type LoadedPicture } from './option'
import type { ComponentExpose } from '../type/ComponentExpose'

defineOptions({ name: 'DrPictorialBarChart' })
const { chart } = defineProps<{ chart: DrPictorialBarChartConfig }>()
const chartRef = ref<HTMLElement>()
const source = ref<unknown[]>([])
const rows = computed(() =>
  toPictorialData(
    shouldUseDefaultChartData(chart) ? mockDataset.dataset : source.value,
    getChartDatasetFieldNames(chart, 'nameField', ['name'])[0],
    getChartDatasetFieldNames(chart, 'valueField', ['value'])[0],
    getChartDatasetFieldNames(chart, 'imageField', ['url'])[0],
  ),
)
let instance: echarts.ECharts | null = null
let observer: ResizeObserver | undefined
let revision = 0
let pictures: (LoadedPicture | null)[] = []
const pending = new Set<() => void>()
const { canvasInst, expose } = useDrComponent({
  chart,
  changeData: (value: unknown) => {
    source.value = Array.isArray(value) ? value : value && typeof value === 'object' && 'data' in value && Array.isArray(value.data) ? value.data : []
  },
})
function render() {
  instance?.setOption(buildPictorialOption(chart.props, rows.value, pictures, chartRef.value?.clientWidth ?? 0), true)
}
function loadPicture(address: string): Promise<LoadedPicture | null> {
  if (!address) return Promise.resolve(null)
  return new Promise((resolve) => {
    const image = new Image()
    const url = getResourceUrl(address)
    const finish = (picture: LoadedPicture | null) => {
      clearTimeout(timeout)
      image.onload = image.onerror = null
      pending.delete(cancel)
      resolve(picture)
    }
    const cancel = () => {
      finish(null)
      image.src = ''
    }
    const timeout = window.setTimeout(cancel, 10000)
    pending.add(cancel)
    image.onload = () => finish(image.naturalWidth && image.naturalHeight ? { url, width: image.naturalWidth, height: image.naturalHeight } : null)
    image.onerror = () => finish(null)
    image.src = url
  })
}
async function refreshPictures() {
  const version = ++revision
  for (const cancel of pending) cancel()
  pictures = []
  render()
  if (!chart.props.image.show) return
  const cache = new Map<string, Promise<LoadedPicture | null>>()
  const load = (url: string) => {
    if (!cache.has(url)) cache.set(url, loadPicture(url))
    return cache.get(url)!
  }
  const fallback = imageAddress(chart.props.image.url)
  const result = await Promise.all(
    rows.value.map(async (row) => {
      if (row.value === null) return null
      const picture = await load(row.image)
      if (version !== revision) return null
      return picture || (await load(fallback))
    }),
  )
  if (version !== revision || !instance) return
  pictures = result
  render()
}
watch([rows, () => chart.props.image.url, () => chart.props.image.show], refreshPictures, { deep: true })
watch(() => chart.props, render, { deep: true })
onMounted(() => {
  if (!chartRef.value) return
  instance = echarts.init(chartRef.value)
  instance.on('click', (params) => {
    const row = rows.value[params.dataIndex]
    if (row && row.value !== null) canvasInst.triggerChartBehavior(chart.id, 'click', { name: row.name, value: row.value, image: row.image })
  })
  observer = new ResizeObserver(() => {
    instance?.resize()
    render()
  })
  observer.observe(chartRef.value)
  void refreshPictures()
})
onBeforeUnmount(() => {
  revision++
  for (const cancel of pending) cancel()
  observer?.disconnect()
  instance?.dispose()
  instance = null
})
defineExpose<ComponentExpose>({ ...expose })
</script>
<template><div :id="chart.id" ref="chartRef" class="dr-pictorial-bar-chart" /></template>
<style scoped>
.dr-pictorial-bar-chart {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
