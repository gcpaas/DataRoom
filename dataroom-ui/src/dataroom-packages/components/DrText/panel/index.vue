<script lang="ts">
import { defineComponent } from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrTextConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrTextConfig
}>()
const chartConfig = computed(() => chart)
</script>
<template>
  <div>
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">
      <el-form-item label="文本内容">
        <el-input v-model="chartConfig.props.text" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>

</style>
