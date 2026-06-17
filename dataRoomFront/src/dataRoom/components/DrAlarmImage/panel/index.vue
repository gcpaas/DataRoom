<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAlarmImageControlPanel',
})
</script>
<script setup lang="ts">
import { computed } from 'vue'
import type { DrAlarmImageConfig } from '../install.ts'
import { getResourceUrl } from '@/dataRoom/_common/_utils.ts'

const { chart } = defineProps<{
  chart: DrAlarmImageConfig
}>()
const chartConfig = computed(() => chart)

const valueFormatOptions = [
  { label: '原始值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '更粗', value: 'bolder' },
]

const repeatModeOptions = [
  { label: '不重复，拉伸满', value: 'no-repeat-stretch' },
  { label: '不重复，等比适应', value: 'no-repeat-contain' },
  { label: '不重复，居中', value: 'no-repeat-center' },
  { label: '平铺', value: 'repeat' },
  { label: '水平平铺', value: 'repeat-x' },
  { label: '垂直平铺', value: 'repeat-y' },
]

const directionOptions = [
  { label: '纵向', value: 'vertical' },
  { label: '横向', value: 'horizontal' },
]

const imageSizeOptions = [
  { label: '自动', value: 'auto' },
  { label: '填充剩余空间', value: 'contain' },
]

const horizontalAlignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const verticalAlignOptions = [
  { label: '顶部', value: 'top' },
  { label: '居中', value: 'center' },
  { label: '底部', value: 'bottom' },
]

const createItemId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `alarm-image-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

const addImageItem = () => {
  const id = createItemId()
  chartConfig.value.props.image.items.push({
    id,
    name: `图片${chartConfig.value.props.image.items.length + 1}`,
    url: '/dataRoom/resource/image/placeholder.png',
    condition: '100 > x > 90',
    enabled: true,
  })
  if (!chartConfig.value.props.image.defaultItemId) {
    chartConfig.value.props.image.defaultItemId = id
  }
}

const removeImageItem = (index: number) => {
  const [removed] = chartConfig.value.props.image.items.splice(index, 1)
  if (removed?.id === chartConfig.value.props.image.defaultItemId) {
    chartConfig.value.props.image.defaultItemId = chartConfig.value.props.image.items[0]?.id ?? ''
  }
}

const setDefaultItem = (id: string) => {
  chartConfig.value.props.image.defaultItemId = id
}
</script>

<template>
  <div class="dr-config-panel dr-alarm-image-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="数值" name="value">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.value.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认值</span>
                  <el-input-number v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">格式</span>
                  <el-select v-model="chartConfig.props.value.format" class="dr-config-panel__control">
                    <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">小数位</span>
                  <el-input-number v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">千分位</span>
                  <el-switch v-model="chartConfig.props.value.thousandSeparator" size="small" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">前缀</span>
                  <el-input v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">后缀</span>
                  <el-input v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">空文本</span>
                  <el-input v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文字样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-input v-model="chartConfig.props.value.color" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">行高</span>
                  <el-input-number v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="2" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="图片规则" name="imageRules">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>显示方式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">填充</span>
                  <el-select v-model="chartConfig.props.image.repeatMode" class="dr-config-panel__control">
                    <el-option v-for="item in repeatModeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.image.borderRadius" class="dr-config-panel__control" :min="0" :max="500" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>图片项</span>
              <el-button size="small" type="primary" @click="addImageItem">新增图片</el-button>
            </div>
            <div class="dr-config-panel__stack">
              <div v-for="(item, index) in chartConfig.props.image.items" :key="item.id" class="dr-alarm-image-config-panel__rule">
                <div class="dr-alarm-image-config-panel__rule-header">
                  <span class="dr-alarm-image-config-panel__rule-title">{{ item.name || `图片${index + 1}` }}</span>
                  <el-switch v-model="item.enabled" size="small" />
                </div>
                <el-form class="dr-config-panel__sub-form" :model="item" label-width="72px" size="small" label-position="left">
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">名称</span>
                      <el-input v-model="item.name" class="dr-config-panel__control" />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">地址</span>
                      <el-input v-model="item.url" class="dr-config-panel__control" placeholder="请输入图片地址" />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">条件</span>
                      <el-input v-model="item.condition" class="dr-config-panel__control" placeholder="100 > x > 90" />
                    </div>
                  </el-form-item>
                  <el-form-item v-if="item.url" class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                      <span class="dr-config-panel__sub-label">预览</span>
                      <div class="dr-alarm-image-config-panel__preview">
                        <el-image :src="getResourceUrl(item.url)" fit="contain" class="dr-alarm-image-config-panel__preview-image">
                          <template #error>
                            <div class="dr-alarm-image-config-panel__preview-error">图片加载失败</div>
                          </template>
                        </el-image>
                      </div>
                    </div>
                  </el-form-item>
                  <div class="dr-alarm-image-config-panel__rule-actions">
                    <el-button size="small" :type="chartConfig.props.image.defaultItemId === item.id ? 'primary' : 'default'" @click="setDefaultItem(item.id)">
                      默认
                    </el-button>
                    <el-button size="small" @click="removeImageItem(index)">删除</el-button>
                  </div>
                </el-form>
              </div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <el-form-item label="方向">
            <el-select v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
              <el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="图片">
            <el-select v-model="chartConfig.props.layout.imageSize" class="dr-config-panel__control">
              <el-option v-for="item in imageSizeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="间距">
            <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="水平">
            <el-select v-model="chartConfig.props.layout.horizontalAlign" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="垂直">
            <el-select v-model="chartConfig.props.layout.verticalAlign" class="dr-config-panel__control">
              <el-option v-for="item in verticalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.animation.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长</span>
                  <el-input-number v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

.dr-alarm-image-config-panel {
  padding: 0;
}

.dr-alarm-image-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-alarm-image-config-panel__rule {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.dr-alarm-image-config-panel__rule + .dr-alarm-image-config-panel__rule {
  padding-top: 8px;
}

.dr-alarm-image-config-panel__rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.dr-alarm-image-config-panel__rule-title {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-alarm-image-config-panel__rule-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.dr-alarm-image-config-panel__preview {
  display: flex;
  width: 100%;
  height: 96px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.dr-alarm-image-config-panel__preview-image {
  width: 100%;
  height: 100%;
}

.dr-alarm-image-config-panel__preview-error {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  letter-spacing: 0;
}
</style>
