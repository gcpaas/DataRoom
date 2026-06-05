# DataV 边框与装饰组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 DataV 边框和装饰素材迁入 DataRoom 前端，并新增 `DrBorder`、`DrDecoration` 两个按需加载的组件。

**Architecture:** `dataRoomFront/src/dataroom-packages/datav` 保存从 `packages/datav-vue3` 复制来的素材源码；`DrBorder` 和 `DrDecoration` 是 DataRoom 对外注册的包装组件。包装组件通过类型配置选择 DataV 子组件，并只传递该子组件支持的属性。

**Tech Stack:** Vue 3、TypeScript、Vite、Element Plus、DataRoom 组件自动注册、DataV Vue3 源码、Vue JSX、Less。

---

### Task 1: 准备前端构建依赖

**文件：**
- 修改：`dataRoomFront/package.json`
- 修改：`dataRoomFront/package-lock.json`
- 修改：`dataRoomFront/vite.config.ts`
- 修改：`dataRoomFront/eslint.config.ts`

- [ ] **步骤 1: 安装 DataV 迁移需要的依赖**

运行：

```bash
cd dataRoomFront
npm install @vueuse/core@^10.11.1 @jiaminghi/color@^1.1.3 @jiaminghi/charts@^0.2.18 @jiaminghi/c-render@^0.4.3
npm install -D @vitejs/plugin-vue-jsx less
```

预期：命令退出码为 `0`，`package.json` 和 `package-lock.json` 更新。`@vueuse/core`、`@jiaminghi/color`、`@jiaminghi/charts`、`@jiaminghi/c-render` 出现在 `dependencies`，`@vitejs/plugin-vue-jsx`、`less` 出现在 `devDependencies`。

- [ ] **步骤 2: 接入 Vue JSX 插件**

修改 `dataRoomFront/vite.config.ts`，让导入部分包含以下内容：

```ts
import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import {ReplaceThisPluginType} from './ReplaceThisPluginType'
```

在 `plugins` 数组中，把 `vueJsx()` 放在 `vue()` 后面：

```ts
plugins: [
  vue(),
  vueJsx(),
  vueDevTools(),
  AutoImport({
    resolvers: [ElementPlusResolver({importStyle: 'sass'})],
  }),
  Components({
    resolvers: [ElementPlusResolver({importStyle: 'sass'})]
  }),
  ElementPlus({useSource: true}),
  ReplaceThisPluginType(),
],
```

- [ ] **步骤 3: 将迁入的第三方素材源码排除出 lint 自动修复**

修改 `dataRoomFront/eslint.config.ts`，让 `globalIgnores` 调用变为：

```ts
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'src/dataroom-packages/datav/**']),
```

这样可以让 `npm run lint` 聚焦 DataRoom 代码，避免自动改写复制进来的 DataV 第三方源码。

- [ ] **步骤 4: 验证构建配置仍可加载**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：现有项目类型检查通过，或只暴露当前仓库已有错误。此任务不应引入 `@vitejs/plugin-vue-jsx` 解析失败、`less` 找不到、`@vueuse/core` 找不到、`@jiaminghi/color` 找不到、`@jiaminghi/charts` 找不到、`@jiaminghi/c-render` 找不到这几类错误。

- [ ] **步骤 5: 提交依赖、Vite 配置和 lint 忽略规则**

运行：

```bash
git add dataRoomFront/package.json dataRoomFront/package-lock.json dataRoomFront/vite.config.ts dataRoomFront/eslint.config.ts
git commit -m "build: add datav rendering dependencies"
```

预期：创建一个只包含依赖和 Vite 配置的提交。

---

### Task 2: 复制并本地化 DataV 源码

**文件：**
- 新增：`dataRoomFront/src/dataroom-packages/datav/**`

- [ ] **步骤 1: 复制 DataV Vue3 包源码**

运行：

```bash
mkdir -p dataRoomFront/src/dataroom-packages/datav
cp -R /Users/liuchengbiao/Downloads/datav-vue3-master/packages/datav-vue3/. dataRoomFront/src/dataroom-packages/datav/
```

预期：`dataRoomFront/src/dataroom-packages/datav/components/BorderBox1`、`dataRoomFront/src/dataroom-packages/datav/components/BorderBox13`、`dataRoomFront/src/dataroom-packages/datav/components/Decoration1`、`dataRoomFront/src/dataroom-packages/datav/components/Decoration12` 存在。

- [ ] **步骤 2: 替换 DataV 内部导入路径**

运行：

```bash
find dataRoomFront/src/dataroom-packages/datav -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.vue' \) -exec perl -pi -e 's#packages/datav-vue3#@/dataroom-packages/datav#g' {} +
```

预期：DataV 内部导入改为 DataRoom 别名路径。

- [ ] **步骤 3: 验证没有遗留旧导入路径**

运行：

```bash
rg "packages/datav-vue3" dataRoomFront/src/dataroom-packages/datav
```

预期：无输出，命令退出码为 `1`。

- [ ] **步骤 4: 验证目标素材数量**

运行：

```bash
find dataRoomFront/src/dataroom-packages/datav/components -maxdepth 1 -type d -name 'BorderBox*' | wc -l
find dataRoomFront/src/dataroom-packages/datav/components -maxdepth 1 -type d -name 'Decoration*' | wc -l
```

预期：第一条输出 `13`，第二条输出 `12`。

- [ ] **步骤 5: 提交 DataV 源码迁移**

运行：

```bash
git add dataRoomFront/src/dataroom-packages/datav
git commit -m "feat: import datav visual assets"
```

预期：创建一个只包含 `datav` 目录迁移和路径替换的提交。

---

### Task 2.5: 隔离 DataV 第三方源码类型检查

**文件：**
- 修改：`dataRoomFront/tsconfig.app.json`

- [ ] **步骤 1: 将 DataV 第三方素材目录排除出 vue-tsc 全量扫描**

修改 `dataRoomFront/tsconfig.app.json`，让 `exclude` 包含 `src/dataroom-packages/datav/**`：

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*", "src/dataroom-packages/datav/**"],
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

预期：`datav` 目录作为第三方素材源码保留，不参与 DataRoom 的全量类型检查。后续 `DrBorder` 和 `DrDecoration` 必须通过 `import.meta.glob` 按需加载 DataV 组件，避免显式静态导入把整个第三方源码重新纳入类型检查。

- [ ] **步骤 2: 执行类型检查**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：命令退出码为 `0`。

- [ ] **步骤 3: 提交类型检查隔离配置**

运行：

```bash
git add dataRoomFront/tsconfig.app.json
git commit -m "build: exclude datav assets from type checking"
```

预期：创建一个只包含 `tsconfig.app.json` 的提交。

---

### Task 3: 创建边框配置元数据

**文件：**
- 新增：`dataRoomFront/src/dataroom-packages/components/DrBorder/options.ts`

- [ ] **步骤 1: 新增边框类型、选项、支持属性和属性构建函数**

新增 `dataRoomFront/src/dataroom-packages/components/DrBorder/options.ts`，内容如下：

```ts
export type DrBorderType =
  | 'BorderBox1'
  | 'BorderBox2'
  | 'BorderBox3'
  | 'BorderBox4'
  | 'BorderBox5'
  | 'BorderBox6'
  | 'BorderBox7'
  | 'BorderBox8'
  | 'BorderBox9'
  | 'BorderBox10'
  | 'BorderBox11'
  | 'BorderBox12'
  | 'BorderBox13'

export type DrBorderDatavProp = 'color' | 'backgroundColor' | 'reverse' | 'dur' | 'title' | 'titleWidth' | 'animate'

export interface DrBorderDatavPropsSource {
  borderType: string
  colors: string[]
  backgroundColor: string
  reverse: boolean
  dur: number | null
  title: string
  titleWidth: number
  animate: boolean
}

export const defaultBorderType: DrBorderType = 'BorderBox1'

export const borderTypeOptions: Array<{ label: string; value: DrBorderType }> = [
  { label: '边框 1', value: 'BorderBox1' },
  { label: '边框 2', value: 'BorderBox2' },
  { label: '边框 3', value: 'BorderBox3' },
  { label: '边框 4', value: 'BorderBox4' },
  { label: '边框 5', value: 'BorderBox5' },
  { label: '边框 6', value: 'BorderBox6' },
  { label: '边框 7', value: 'BorderBox7' },
  { label: '边框 8', value: 'BorderBox8' },
  { label: '边框 9', value: 'BorderBox9' },
  { label: '边框 10', value: 'BorderBox10' },
  { label: '边框 11', value: 'BorderBox11' },
  { label: '边框 12', value: 'BorderBox12' },
  { label: '边框 13', value: 'BorderBox13' },
]

export const borderSupportedProps: Record<DrBorderType, DrBorderDatavProp[]> = {
  BorderBox1: ['color', 'backgroundColor'],
  BorderBox2: ['color', 'backgroundColor'],
  BorderBox3: ['color', 'backgroundColor'],
  BorderBox4: ['color', 'backgroundColor', 'reverse'],
  BorderBox5: ['color', 'backgroundColor', 'reverse'],
  BorderBox6: ['color', 'backgroundColor'],
  BorderBox7: ['color', 'backgroundColor'],
  BorderBox8: ['color', 'backgroundColor', 'reverse', 'dur'],
  BorderBox9: ['color', 'backgroundColor'],
  BorderBox10: ['color', 'backgroundColor'],
  BorderBox11: ['color', 'backgroundColor', 'title', 'titleWidth', 'animate'],
  BorderBox12: ['color', 'backgroundColor'],
  BorderBox13: ['color', 'backgroundColor'],
}

export const normalizeBorderType = (type: string | undefined): DrBorderType => {
  return borderTypeOptions.some((item) => item.value === type) ? type as DrBorderType : defaultBorderType
}

export const isBorderPropSupported = (type: DrBorderType, prop: DrBorderDatavProp) => {
  return borderSupportedProps[type].includes(prop)
}

export const buildBorderDatavProps = (props: DrBorderDatavPropsSource): Record<string, unknown> => {
  const borderType = normalizeBorderType(props.borderType)
  const datavProps: Record<string, unknown> = {
    color: props.colors,
    backgroundColor: props.backgroundColor,
  }

  if (isBorderPropSupported(borderType, 'reverse')) {
    datavProps.reverse = props.reverse
  }
  if (isBorderPropSupported(borderType, 'dur') && props.dur !== null) {
    datavProps.dur = props.dur
  }
  if (isBorderPropSupported(borderType, 'title')) {
    datavProps.title = props.title
  }
  if (isBorderPropSupported(borderType, 'titleWidth')) {
    datavProps.titleWidth = props.titleWidth
  }
  if (isBorderPropSupported(borderType, 'animate')) {
    datavProps.animate = props.animate
  }

  return datavProps
}
```

- [ ] **步骤 2: 提交边框元数据**

运行：

```bash
git add dataRoomFront/src/dataroom-packages/components/DrBorder/options.ts
git commit -m "feat: add border component metadata"
```

预期：创建一个只包含 `DrBorder/options.ts` 的提交。

---

### Task 4: 实现 DrBorder 组件

**文件：**
- 新增：`dataRoomFront/src/dataroom-packages/components/DrBorder/install.ts`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrBorder/index.vue`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrBorder/panel/index.vue`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrBorder/plugin.ts`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrBorder/images/border.svg`

- [ ] **步骤 1: 新增边框组件安装定义**

新增 `dataRoomFront/src/dataroom-packages/components/DrBorder/install.ts`，内容如下：

```ts
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'
import type { DrBorderType } from './options.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrBorderPropsInterface {
  borderType: DrBorderType
  colors: string[]
  backgroundColor: string
  reverse: boolean
  dur: number | null
  title: string
  titleWidth: number
  animate: boolean
}

export type DrBorderConfig = ChartConfig<DrBorderPropsInterface>

const getInstance = (): DrBorderConfig => {
  return createChartConfig<DrBorderPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      borderType: 'BorderBox1',
      colors: [],
      backgroundColor: 'transparent',
      reverse: false,
      dur: null,
      title: '',
      titleWidth: 250,
      animate: true,
    },
    {
      title: '边框',
      w: 400,
      h: 240,
    },
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export { component, controlPanel, getInstance, behaviors, datasetFields }
```

- [ ] **步骤 2: 新增边框渲染组件**

新增 `dataRoomFront/src/dataroom-packages/components/DrBorder/index.vue`，内容如下：

```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { AsyncComponentLoader, Component } from 'vue'
import type { DrBorderConfig } from './install.ts'
import { buildBorderDatavProps, defaultBorderType, normalizeBorderType, type DrBorderType } from './options.ts'

const { chart } = defineProps<{
  chart: DrBorderConfig
}>()

const borderModules = import.meta.glob<Component>('../../datav/components/BorderBox*/src/BorderBox*.tsx', {
  import: 'default',
})

const getBorderLoader = (borderType: DrBorderType): AsyncComponentLoader<Component> => {
  const path = `../../datav/components/${borderType}/src/${borderType}.tsx`
  const defaultPath = `../../datav/components/${defaultBorderType}/src/${defaultBorderType}.tsx`
  return (borderModules[path] || borderModules[defaultPath]) as AsyncComponentLoader<Component>
}

const currentBorderType = computed(() => normalizeBorderType(chart.props.borderType))
const currentComponent = computed(() => defineAsyncComponent(getBorderLoader(currentBorderType.value)))
const currentDatavProps = computed(() => buildBorderDatavProps(chart.props))
</script>

<template>
  <div class="dr-border" :id="chart.id">
    <component :is="currentComponent" v-bind="currentDatavProps" />
  </div>
</template>

<style scoped>
.dr-border {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
```

- [ ] **步骤 3: 新增边框配置面板**

新增 `dataRoomFront/src/dataroom-packages/components/DrBorder/panel/index.vue`，内容如下：

```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import { computed } from 'vue'
import type { DrBorderConfig } from '../install.ts'
import { borderTypeOptions, isBorderPropSupported, normalizeBorderType } from '../options.ts'

const { chart } = defineProps<{
  chart: DrBorderConfig
}>()
const chartConfig = computed(() => chart)
const currentBorderType = computed(() => normalizeBorderType(chartConfig.value.props.borderType))

const addColor = () => {
  chartConfig.value.props.colors.push('#4fd2dd')
}

const removeColor = (index: number) => {
  chartConfig.value.props.colors.splice(index, 1)
}

const clearColors = () => {
  chartConfig.value.props.colors.splice(0, chartConfig.value.props.colors.length)
}
</script>

<template>
  <div class="dr-config-panel dr-border-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="边框类型" name="type">
          <el-form-item label="类型">
            <el-select v-model="chartConfig.props.borderType" class="dr-config-panel__control">
              <el-option v-for="item in borderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="颜色配置" name="colors">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色列表</span>
              <el-button size="small" @click="addColor">添加</el-button>
            </div>
            <div class="dr-border-config-panel__colors">
              <div v-for="(color, index) in chartConfig.props.colors" :key="index" class="dr-border-config-panel__color-row">
                <el-color-picker v-model="chartConfig.props.colors[index]" show-alpha />
                <el-button size="small" @click="removeColor(index)">删除</el-button>
              </div>
              <el-empty v-if="chartConfig.props.colors.length === 0" description="使用默认颜色" :image-size="48" />
              <el-button v-else size="small" @click="clearColors">清空颜色</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="背景配置" name="background">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>背景</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.backgroundColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="专属配置" name="specific">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>当前类型</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'reverse')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">反向</span>
                  <el-switch v-model="chartConfig.props.reverse" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'dur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长</span>
                  <el-input-number v-model="chartConfig.props.dur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'title')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">标题</span>
                  <el-input v-model="chartConfig.props.title" class="dr-config-panel__control" placeholder="请输入标题" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'titleWidth')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">标题宽度</span>
                  <el-input-number v-model="chartConfig.props.titleWidth" class="dr-config-panel__control" :min="80" :max="800" :step="10" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'animate')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">动画</span>
                  <el-switch v-model="chartConfig.props.animate" />
                </div>
              </el-form-item>
              <el-empty
                v-if="
                  !isBorderPropSupported(currentBorderType, 'reverse')
                    && !isBorderPropSupported(currentBorderType, 'dur')
                    && !isBorderPropSupported(currentBorderType, 'title')
                    && !isBorderPropSupported(currentBorderType, 'titleWidth')
                    && !isBorderPropSupported(currentBorderType, 'animate')
                "
                description="当前类型无专属配置"
                :image-size="48"
              />
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-border-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-border-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-border-config-panel__colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dr-border-config-panel__color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

- [ ] **步骤 4: 新增边框缩略图**

新增 `dataRoomFront/src/dataroom-packages/components/DrBorder/images/border.svg`，内容如下：

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96" viewBox="0 0 160 96" fill="none">
  <rect x="18" y="14" width="124" height="68" rx="2" fill="#0B1220"/>
  <path d="M28 24H58L66 16H94L102 24H132V72H102L94 80H66L58 72H28V24Z" stroke="#4FD2DD" stroke-width="3"/>
  <path d="M36 32H56M104 32H124M36 64H56M104 64H124" stroke="#8AAAFB" stroke-width="3" stroke-linecap="round"/>
</svg>
```

- [ ] **步骤 5: 新增边框组件库插件**

新增 `dataRoomFront/src/dataroom-packages/components/DrBorder/plugin.ts`，内容如下：

```ts
import thumbnail from './images/border.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export class DrBorderPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '边框', '边框、装饰边框、DataV边框', thumbnail, tags)
  }
}
```

- [ ] **步骤 6: 执行类型检查**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：不出现 `DrBorder` 相关类型错误，不出现 `BorderBox*` 模块找不到错误。

- [ ] **步骤 7: 提交 DrBorder**

运行：

```bash
git add dataRoomFront/src/dataroom-packages/components/DrBorder
git commit -m "feat: add datav border component"
```

预期：创建一个只包含 `DrBorder` 组件的提交。

---

### Task 5: 创建装饰配置元数据

**文件：**
- 新增：`dataRoomFront/src/dataroom-packages/components/DrDecoration/options.ts`

- [ ] **步骤 1: 新增装饰类型、选项、支持属性和属性构建函数**

新增 `dataRoomFront/src/dataroom-packages/components/DrDecoration/options.ts`，内容如下：

```ts
export type DrDecorationType =
  | 'Decoration1'
  | 'Decoration2'
  | 'Decoration3'
  | 'Decoration4'
  | 'Decoration5'
  | 'Decoration6'
  | 'Decoration7'
  | 'Decoration8'
  | 'Decoration9'
  | 'Decoration10'
  | 'Decoration11'
  | 'Decoration12'

export type DrDecorationDatavProp = 'color' | 'reverse' | 'dur' | 'scanDur' | 'haloDur'

export interface DrDecorationDatavPropsSource {
  decorationType: string
  colors: string[]
  reverse: boolean
  dur: number | null
  scanDur: number | null
  haloDur: number | null
}

export const defaultDecorationType: DrDecorationType = 'Decoration1'

export const decorationTypeOptions: Array<{ label: string; value: DrDecorationType }> = [
  { label: '装饰 1', value: 'Decoration1' },
  { label: '装饰 2', value: 'Decoration2' },
  { label: '装饰 3', value: 'Decoration3' },
  { label: '装饰 4', value: 'Decoration4' },
  { label: '装饰 5', value: 'Decoration5' },
  { label: '装饰 6', value: 'Decoration6' },
  { label: '装饰 7', value: 'Decoration7' },
  { label: '装饰 8', value: 'Decoration8' },
  { label: '装饰 9', value: 'Decoration9' },
  { label: '装饰 10', value: 'Decoration10' },
  { label: '装饰 11', value: 'Decoration11' },
  { label: '装饰 12', value: 'Decoration12' },
]

export const decorationSupportedProps: Record<DrDecorationType, DrDecorationDatavProp[]> = {
  Decoration1: ['color'],
  Decoration2: ['color', 'reverse', 'dur'],
  Decoration3: ['color'],
  Decoration4: ['color', 'reverse', 'dur'],
  Decoration5: ['color', 'dur'],
  Decoration6: ['color'],
  Decoration7: ['color'],
  Decoration8: ['color', 'reverse'],
  Decoration9: ['color', 'dur'],
  Decoration10: ['color'],
  Decoration11: ['color'],
  Decoration12: ['color', 'scanDur', 'haloDur'],
}

export const normalizeDecorationType = (type: string | undefined): DrDecorationType => {
  return decorationTypeOptions.some((item) => item.value === type) ? type as DrDecorationType : defaultDecorationType
}

export const isDecorationPropSupported = (type: DrDecorationType, prop: DrDecorationDatavProp) => {
  return decorationSupportedProps[type].includes(prop)
}

export const buildDecorationDatavProps = (props: DrDecorationDatavPropsSource): Record<string, unknown> => {
  const decorationType = normalizeDecorationType(props.decorationType)
  const datavProps: Record<string, unknown> = {
    color: props.colors,
  }

  if (isDecorationPropSupported(decorationType, 'reverse')) {
    datavProps.reverse = props.reverse
  }
  if (isDecorationPropSupported(decorationType, 'dur') && props.dur !== null) {
    datavProps.dur = props.dur
  }
  if (isDecorationPropSupported(decorationType, 'scanDur') && props.scanDur !== null) {
    datavProps.scanDur = props.scanDur
  }
  if (isDecorationPropSupported(decorationType, 'haloDur') && props.haloDur !== null) {
    datavProps.haloDur = props.haloDur
  }

  return datavProps
}
```

- [ ] **步骤 2: 提交装饰元数据**

运行：

```bash
git add dataRoomFront/src/dataroom-packages/components/DrDecoration/options.ts
git commit -m "feat: add decoration component metadata"
```

预期：创建一个只包含 `DrDecoration/options.ts` 的提交。

---

### Task 6: 实现 DrDecoration 组件

**文件：**
- 新增：`dataRoomFront/src/dataroom-packages/components/DrDecoration/install.ts`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrDecoration/index.vue`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrDecoration/panel/index.vue`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrDecoration/plugin.ts`
- 新增：`dataRoomFront/src/dataroom-packages/components/DrDecoration/images/decoration.svg`

- [ ] **步骤 1: 新增装饰组件安装定义**

新增 `dataRoomFront/src/dataroom-packages/components/DrDecoration/install.ts`，内容如下：

```ts
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'
import type { DrDecorationType } from './options.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrDecorationPropsInterface {
  decorationType: DrDecorationType
  colors: string[]
  reverse: boolean
  dur: number | null
  scanDur: number | null
  haloDur: number | null
}

export type DrDecorationConfig = ChartConfig<DrDecorationPropsInterface>

const getInstance = (): DrDecorationConfig => {
  return createChartConfig<DrDecorationPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      decorationType: 'Decoration1',
      colors: [],
      reverse: false,
      dur: null,
      scanDur: null,
      haloDur: null,
    },
    {
      title: '装饰',
      w: 300,
      h: 80,
    },
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export { component, controlPanel, getInstance, behaviors, datasetFields }
```

- [ ] **步骤 2: 新增装饰渲染组件**

新增 `dataRoomFront/src/dataroom-packages/components/DrDecoration/index.vue`，内容如下：

```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { AsyncComponentLoader, Component } from 'vue'
import type { DrDecorationConfig } from './install.ts'
import { buildDecorationDatavProps, defaultDecorationType, normalizeDecorationType, type DrDecorationType } from './options.ts'

const { chart } = defineProps<{
  chart: DrDecorationConfig
}>()

const decorationModules = import.meta.glob<Component>('../../datav/components/Decoration*/src/index.vue', {
  import: 'default',
})

const getDecorationLoader = (decorationType: DrDecorationType): AsyncComponentLoader<Component> => {
  const path = `../../datav/components/${decorationType}/src/index.vue`
  const defaultPath = `../../datav/components/${defaultDecorationType}/src/index.vue`
  return (decorationModules[path] || decorationModules[defaultPath]) as AsyncComponentLoader<Component>
}

const currentDecorationType = computed(() => normalizeDecorationType(chart.props.decorationType))
const currentComponent = computed(() => defineAsyncComponent(getDecorationLoader(currentDecorationType.value)))
const currentDatavProps = computed(() => buildDecorationDatavProps(chart.props))
</script>

<template>
  <div class="dr-decoration" :id="chart.id">
    <component :is="currentComponent" v-bind="currentDatavProps" />
  </div>
</template>

<style scoped>
.dr-decoration {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
```

- [ ] **步骤 3: 新增装饰配置面板**

新增 `dataRoomFront/src/dataroom-packages/components/DrDecoration/panel/index.vue`，内容如下：

```vue
<script lang="ts">
import { defineComponent } from 'vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import { computed } from 'vue'
import type { DrDecorationConfig } from '../install.ts'
import { decorationTypeOptions, isDecorationPropSupported, normalizeDecorationType } from '../options.ts'

const { chart } = defineProps<{
  chart: DrDecorationConfig
}>()
const chartConfig = computed(() => chart)
const currentDecorationType = computed(() => normalizeDecorationType(chartConfig.value.props.decorationType))

const addColor = () => {
  chartConfig.value.props.colors.push('#2cf7fe')
}

const removeColor = (index: number) => {
  chartConfig.value.props.colors.splice(index, 1)
}

const clearColors = () => {
  chartConfig.value.props.colors.splice(0, chartConfig.value.props.colors.length)
}
</script>

<template>
  <div class="dr-config-panel dr-decoration-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="装饰类型" name="type">
          <el-form-item label="类型">
            <el-select v-model="chartConfig.props.decorationType" class="dr-config-panel__control">
              <el-option v-for="item in decorationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="颜色配置" name="colors">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色列表</span>
              <el-button size="small" @click="addColor">添加</el-button>
            </div>
            <div class="dr-decoration-config-panel__colors">
              <div v-for="(color, index) in chartConfig.props.colors" :key="index" class="dr-decoration-config-panel__color-row">
                <el-color-picker v-model="chartConfig.props.colors[index]" show-alpha />
                <el-button size="small" @click="removeColor(index)">删除</el-button>
              </div>
              <el-empty v-if="chartConfig.props.colors.length === 0" description="使用默认颜色" :image-size="48" />
              <el-button v-else size="small" @click="clearColors">清空颜色</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="专属配置" name="specific">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>当前类型</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'reverse')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">反向</span>
                  <el-switch v-model="chartConfig.props.reverse" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'dur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长</span>
                  <el-input-number v-model="chartConfig.props.dur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'scanDur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">扫描时长</span>
                  <el-input-number v-model="chartConfig.props.scanDur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'haloDur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">光晕时长</span>
                  <el-input-number v-model="chartConfig.props.haloDur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-empty
                v-if="
                  !isDecorationPropSupported(currentDecorationType, 'reverse')
                    && !isDecorationPropSupported(currentDecorationType, 'dur')
                    && !isDecorationPropSupported(currentDecorationType, 'scanDur')
                    && !isDecorationPropSupported(currentDecorationType, 'haloDur')
                "
                description="当前类型无专属配置"
                :image-size="48"
              />
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-decoration-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-decoration-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-decoration-config-panel__colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dr-decoration-config-panel__color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
```

- [ ] **步骤 4: 新增装饰缩略图**

新增 `dataRoomFront/src/dataroom-packages/components/DrDecoration/images/decoration.svg`，内容如下：

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96" viewBox="0 0 160 96" fill="none">
  <rect x="18" y="20" width="124" height="56" rx="2" fill="#0B1220"/>
  <path d="M32 48H128" stroke="#00C2FF" stroke-width="4" stroke-linecap="round"/>
  <circle cx="48" cy="48" r="7" fill="#2CF7FE"/>
  <circle cx="80" cy="48" r="10" stroke="#8AAAFB" stroke-width="4"/>
  <circle cx="112" cy="48" r="7" fill="#2CF7FE"/>
</svg>
```

- [ ] **步骤 5: 新增装饰组件库插件**

新增 `dataRoomFront/src/dataroom-packages/components/DrDecoration/plugin.ts`，内容如下：

```ts
import thumbnail from './images/decoration.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export class DrDecorationPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '装饰', '装饰、分割线、DataV装饰', thumbnail, tags)
  }
}
```

- [ ] **步骤 6: 执行类型检查**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：不出现 `DrDecoration` 相关类型错误，不出现 `Decoration*` 模块找不到错误。

- [ ] **步骤 7: 提交 DrDecoration**

运行：

```bash
git add dataRoomFront/src/dataroom-packages/components/DrDecoration
git commit -m "feat: add datav decoration component"
```

预期：创建一个只包含 `DrDecoration` 组件的提交。

---

### Task 7: 注册组件库分类与插件

**文件：**
- 修改：`dataRoomFront/src/dataroom-packages/constant/ComponentLibTagTypeConst.ts`
- 修改：`dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`

- [ ] **步骤 1: 新增装饰素材分类枚举**

修改 `dataRoomFront/src/dataroom-packages/constant/ComponentLibTagTypeConst.ts`，让枚举结尾变为：

```ts
  /**
   * 表单
   */
  FORM = 'form',
  /**
   * 装饰素材、边框
   */
  DECORATION = 'decoration',
}
```

- [ ] **步骤 2: 导入两个新插件**

在 `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts` 中，与其他组件导入放在一起新增：

```ts
import {DrBorderPlugin} from '@/dataroom-packages/components/DrBorder/plugin.ts'
import {DrDecorationPlugin} from '@/dataroom-packages/components/DrDecoration/plugin.ts'
```

- [ ] **步骤 3: 添加组件库分类**

在 `componentLibTagList` 中，把以下项添加到“多媒体”之后、“表单”之前：

```ts
  {
    name: '装饰素材',
    tag: ComponentLibTagTypeConst.DECORATION
  },
```

- [ ] **步骤 4: 添加组件插件实例**

在 `pluginList` 中，把以下项添加到 `new DrFullScreenPlugin(...)` 之前：

```ts
  new DrBorderPlugin([ComponentLibTagTypeConst.DECORATION]),
  new DrDecorationPlugin([ComponentLibTagTypeConst.DECORATION]),
```

- [ ] **步骤 5: 执行类型检查**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：不出现 `ComponentLibTagTypeConst.DECORATION` 未定义、插件导入失败或组件自动注册失败相关错误。

- [ ] **步骤 6: 提交组件库注册**

运行：

```bash
git add dataRoomFront/src/dataroom-packages/constant/ComponentLibTagTypeConst.ts dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts
git commit -m "feat: register datav visual components"
```

预期：创建一个只包含组件库注册变更的提交。

---

### Task 8: 全量验证与手动检查

**文件：**
- 不计划修改文件

- [ ] **步骤 1: 执行类型检查**

运行：

```bash
cd dataRoomFront
npm run type-check
```

预期：命令退出码为 `0`。

- [ ] **步骤 2: 执行代码规范检查**

运行：

```bash
cd dataRoomFront
npm run lint
```

预期：命令退出码为 `0`。如果自动修复产生文件变更，检查变更只包含格式或可自动修复的规范调整。

- [ ] **步骤 3: 启动前端开发服务**

运行：

```bash
cd dataRoomFront
npm run dev
```

预期：Vite 开发服务启动，终端输出本地访问地址，例如 `http://localhost:5173/`。

- [ ] **步骤 4: 手动验证组件库和画布渲染**

使用正在运行的开发服务验证：

```text
1. 进入设计器页面。
2. 左侧组件库出现“装饰素材”分类。
3. “装饰素材”分类中出现“边框”和“装饰”两个卡片。
4. 拖入“边框”，默认渲染 BorderBox1。
5. 在配置面板切换 BorderBox1 到 BorderBox13，每种类型画布中都有可见边框。
6. 选择 BorderBox4、BorderBox5、BorderBox8 时，“反向”配置可见并生效。
7. 选择 BorderBox8 时，“时长”配置可见并生效。
8. 选择 BorderBox11 时，“标题”“标题宽度”“动画”配置可见并生效。
9. 拖入“装饰”，默认渲染 Decoration1。
10. 在配置面板切换 Decoration1 到 Decoration12，每种类型画布中都有可见装饰。
11. 选择 Decoration2、Decoration4、Decoration8 时，“反向”配置按支持关系出现。
12. 选择 Decoration2、Decoration4、Decoration5、Decoration9 时，“时长”配置按支持关系出现。
13. 选择 Decoration12 时，“扫描时长”“光晕时长”配置可见并生效。
```

- [ ] **步骤 5: 检查样式规范红线**

运行：

```bash
rg --glob '!*datav*' --glob '*.vue' --glob '*.scss' --glob '*.css' --glob '*.ts' ":deep\\(|::v-deep|/deep/|>>>|!important|--dr-[a-zA-Z0-9-]*\\s*:" dataRoomFront/src/dataroom-packages/components/DrBorder dataRoomFront/src/dataroom-packages/components/DrDecoration dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts dataRoomFront/src/dataroom-packages/constant/ComponentLibTagTypeConst.ts
```

预期：无输出，命令退出码为 `1`。此检查排除 `datav` 目录，因为迁移素材保留原视觉实现。

- [ ] **步骤 6: 提交验证修正**

如果 `npm run lint` 修改了文件，运行：

```bash
git add dataRoomFront
git commit -m "chore: format datav visual components"
```

预期：只有格式化或自动修复变更被提交。如果没有文件变更，跳过这个提交。

- [ ] **步骤 7: 记录最终状态**

运行：

```bash
git status --short
```

预期：只允许出现任务开始前已存在且无关的未跟踪 `.superpowers/`。不应出现本次任务遗留的未暂存代码文件。
