<script lang="ts">
import { defineComponent } from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrImageConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrImageConfig
}>()
const chartConfig = computed(() => chart)
</script>
<template>
  <div>
    <el-form :model="chartConfig" label-width="100px" label-position="left" size="small">
      <el-form-item label="URL">
        <el-input v-model="chartConfig.props.url" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped></style>
