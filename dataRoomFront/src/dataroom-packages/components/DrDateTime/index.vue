<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'DrDateTime',
})
</script>
<script setup lang="ts">
import type {CSSProperties} from 'vue'
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import type {DrDateTimeConfig} from './install.ts'
import {formatDateTime} from './time-format.ts'

const {chart} = defineProps<{
  chart: DrDateTimeConfig
}>()

const now = ref(new Date())
let timer: number | undefined

const displayText = computed(() => formatDateTime(now.value, chart.props.format))

const dateTimeStyle = computed<CSSProperties>(() => {
  const horizontalAlignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  } as const
  const verticalAlignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  } as const
  const textStyle = chart.props.textStyle

  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    fontFeatureSettings: '"tnum"',
    justifyContent: horizontalAlignMap[chart.props.align],
    alignItems: verticalAlignMap[chart.props.verticalAlign],
    fontSize: `${textStyle.fontSize}px`,
    fontFamily: textStyle.fontFamily,
    fontWeight: textStyle.fontWeight,
    letterSpacing: `${textStyle.letterSpacing}px`,
    color: textStyle.color,
  }
})

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer !== undefined) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <div class="dr-date-time" :id="chart.id" :style="dateTimeStyle">{{ displayText }}</div>
</template>
