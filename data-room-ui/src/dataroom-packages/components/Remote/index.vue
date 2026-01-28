<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RemoteComponent',
})
</script>
<script setup lang="ts">
import { defineAsyncComponent, reactive } from 'vue'
import type { RemoteComponentConfig } from './install.ts'

import * as Vue from 'vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { loadModule } from 'vue3-sfc-loader'
// 完整导入 ECharts

const { chart } = defineProps<{
  chart: RemoteComponentConfig
}>()
// 避免直接修改props数据，编译报错
const drChart = reactive(chart)

const options = {
  moduleCache: {
    vue: Vue
  },
  async getFile(url: string) {
    const res = await fetch(url)
    const code = await res.text()
    return code
  },
  addStyle(textContent: string) {
    const style = Object.assign(document.createElement('style'), {
      textContent,
    })
    const ref = document.head.getElementsByTagName('style')[0] || null
    document.head.insertBefore(style, ref)
  },
}

const RemoteHelloComponent = defineAsyncComponent(async () => {
  const res = await loadModule('http://127.0.0.1:8081/Hello.vue', options)
  console.log('res', res)
  return res
})
</script>

<template>
  <div class="dr-text">
    {{ drChart.props.text }}-字体大小: {{ drChart.props.fontSize }}
    <component :is="RemoteHelloComponent"></component>
  </div>
</template>

<style scoped>
.dr-text {
  color: red;
}
</style>
