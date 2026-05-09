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
import {getResourceUrl} from "@/dataroom-packages/_common/_utils.ts";

const { chart } = defineProps<{
  chart: DrImageConfig
}>()
const chartConfig = computed(() => chart)

const repeatModeOptions = [
  { label: '不重复，拉伸满', value: 'no-repeat-stretch' },
  { label: '不重复，等比适应', value: 'no-repeat-contain' },
  { label: '不重复，居中', value: 'no-repeat-center' },
  { label: '平铺', value: 'repeat' },
  { label: '水平平铺', value: 'repeat-x' },
  { label: '垂直平铺', value: 'repeat-y' },
]
</script>
<template>
  <div class="dr-image-panel">
    <el-form :model="chartConfig" label-width="100px" label-position="left" size="small">

      <!-- 图片类型 -->
      <el-form-item label="图片类型">
        <el-radio-group v-model="chartConfig.props.imageType">
          <el-radio-button value="bitmap">位图</el-radio-button>
          <el-radio-button value="svg">矢量图</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 背景图 URL -->
      <el-form-item label="背景图">
        <el-input v-model="chartConfig.props.url" placeholder="请输入图片地址">
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 图片预览 -->
      <el-form-item v-if="chartConfig.props.url" label=" ">
        <div class="image-preview">
          <el-image :src="getResourceUrl(chartConfig.props.url)" fit="contain">
            <template #error>
              <div class="preview-error">图片加载失败</div>
            </template>
          </el-image>
        </div>
      </el-form-item>

      <!-- 图片重复 -->
      <el-form-item label="图片重复">
        <el-select v-model="chartConfig.props.repeatMode">
          <el-option
            v-for="item in repeatModeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 圆角 -->
      <el-form-item label="圆角">
        <el-input-number
          v-model="chartConfig.props.borderRadius"
          :min="0"
          :max="500"
          :step="1"
          controls-position="right"
        />
      </el-form-item>

      <!-- 超链接配置 -->
      <el-collapse>
        <el-collapse-item title="超链接配置">
          <el-form-item label="超链接">
            <el-input v-model="chartConfig.props.hyperlink.url" placeholder="请输入链接地址" />
          </el-form-item>
          <el-form-item label="是否新开窗口">
            <el-switch v-model="chartConfig.props.hyperlink.openNewWindow" />
          </el-form-item>
          <el-form-item label="手势光标">
            <el-switch v-model="chartConfig.props.hyperlink.cursorPointer" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-image-panel {
  padding: 12px;
}

.dr-image-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-image-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-image-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.image-preview {
  width: 100%;
  height: 120px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview .el-image {
  width: 100%;
  height: 100%;
}

.preview-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}
</style>
