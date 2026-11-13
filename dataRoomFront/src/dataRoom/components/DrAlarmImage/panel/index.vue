<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAlarmImageControlPanel',
})
</script>
<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import { computed } from 'vue'
import type { DrAlarmImageConfig } from '../install.ts'
import { getResourceUrl } from '@/dataRoom/utils/index.ts'

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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="数值" name="value">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.value.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">默认值</span>
                  <DrNumberField v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式</span>
                  <DrSelectField v-model="chartConfig.props.value.format" class="dr-config-panel__control">
                    <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">小数位</span>
                  <DrNumberField v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">千分位</span>
                  <el-switch v-model="chartConfig.props.value.thousandSeparator" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">前缀</span>
                  <DrInputField v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">后缀</span>
                  <DrInputField v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">空文本</span>
                  <DrInputField v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文字样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="120" :step="1" controls-position="right" aria-label="数值字号">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrInputField v-model="chartConfig.props.value.color" class="dr-config-panel__control" aria-label="数值文字颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">行高</span>
                  <DrNumberField v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="2" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="图片规则" name="imageRules">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>显示方式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">填充</span>
                  <DrSelectField v-model="chartConfig.props.image.repeatMode" class="dr-config-panel__control">
                    <el-option v-for="item in repeatModeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.image.borderRadius" class="dr-config-panel__control" :min="0" :max="500" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>图片项</span>
              <el-button class="config-panel-text" type="primary" @click="addImageItem">新增图片</el-button>
            </div>
            <div class="dr-config-panel__stack">
              <div v-for="(item, index) in chartConfig.props.image.items" :key="item.id" class="dr-alarm-image-config-panel__rule">
                <div class="dr-alarm-image-config-panel__rule-header">
                  <span class="dr-alarm-image-config-panel__rule-title dr-config-panel__group-title">{{ item.name || `图片${index + 1}` }}</span>
                </div>
                <el-form class="dr-config-panel__sub-form" :model="item" label-width="72px" label-position="left">
                  <el-form-item label="启用" label-width="72px" label-position="left">
                    <el-switch v-model="item.enabled" />
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">名称</span>
                      <DrInputField v-model="item.name" class="dr-config-panel__control" />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">地址</span>
                      <DrInputField v-model="item.url" class="dr-config-panel__control" placeholder="请输入图片地址" />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">条件</span>
                      <DrInputField v-model="item.condition" class="dr-config-panel__control" placeholder="100 > x > 90" />
                    </div>
                  </el-form-item>
                  <el-form-item v-if="item.url" class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">预览</span>
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
                    <el-button class="config-panel-text" :type="chartConfig.props.image.defaultItemId === item.id ? 'primary' : 'default'" @click="setDefaultItem(item.id)">
                      默认
                    </el-button>
                    <el-button class="config-panel-text" @click="removeImageItem(index)">删除</el-button>
                  </div>
                </el-form>
              </div>
            </div>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="布局" name="layout">
          <el-form-item label="方向">
            <DrSelectField v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
              <el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="图片">
            <DrSelectField v-model="chartConfig.props.layout.imageSize" class="dr-config-panel__control">
              <el-option v-for="item in imageSizeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="间距">
            <DrNumberField v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <DrFieldRow label="对齐" paired variant="equal">
            <template #first>
              <DrSelectField v-model="chartConfig.props.layout.horizontalAlign" class="dr-config-panel__control" aria-label="水平对齐">
                <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
              </DrSelectField>
            </template>
            <template #second>
              <DrSelectField v-model="chartConfig.props.layout.verticalAlign" class="dr-config-panel__control" aria-label="垂直对齐">
                <el-option v-for="item in verticalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
              </DrSelectField>
            </template>
          </DrFieldRow>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="动画" name="animation">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.animation.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">时长</span>
                  <DrNumberField v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-alarm-image-config-panel {
  padding: 0;
}

.dr-alarm-image-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-alarm-image-config-panel__rule {
  padding-bottom: 8px;
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
