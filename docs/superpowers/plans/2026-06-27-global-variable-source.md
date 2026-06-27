# Global Variable Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将全局变量改为来源驱动的多态配置，新增代码块来源，并让代码块来源使用 CodeMirror JS 编辑器。

**Architecture:** 全局变量继续保存在页面配置 `globalVariableList` 中，前端用 `source + config` 表达不同来源。所有取值和写回仍集中在 `useCanvasInst` 的 `getGlobalVariableValue` 与 `updateGlobalVariableValue`，调用方不直接理解内部结构。配置 UI 只负责创建、切换和编辑对应来源的 `config`。

**Tech Stack:** Vue 3、TypeScript、Element Plus、vue-codemirror、CodeMirror 6、Vite、npm。

---

## File Structure

- Modify: `dataRoomFront/package.json`
  - 新增 `@codemirror/lang-javascript` 依赖。
- Modify: `dataRoomFront/package-lock.json`
  - 由 `npm install @codemirror/lang-javascript` 自动更新。
- Modify: `dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts`
  - 定义 `GlobalVariableSource`、三种 `config` 类型和配置创建/读取辅助函数。
- Modify: `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`
  - 按 `source` 读取变量值。
  - 只允许静态变量写回。
  - 代码块来源复用 `bep` 上下文。
- Modify: `dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue`
  - 使用新结构新增变量。
  - 切换来源时重建 `config`。
  - 左侧列表显示来源 `el-tag` 和备注。
  - 右侧按来源显示表单。
  - 代码块来源使用 CodeMirror JS 编辑器。

No backend files are modified.

---

### Task 1: Install CodeMirror JavaScript Language Support

**Files:**
- Modify: `dataRoomFront/package.json`
- Modify: `dataRoomFront/package-lock.json`

- [ ] **Step 1: Install dependency**

Run:

```bash
cd dataRoomFront
npm install @codemirror/lang-javascript
```

Expected:

- `package.json` contains `@codemirror/lang-javascript`.
- `package-lock.json` is updated.
- Command exits with code `0`.

- [ ] **Step 2: Verify dependency is present**

Run:

```bash
cd dataRoomFront
node -e "const pkg=require('./package.json'); if(!pkg.dependencies['@codemirror/lang-javascript']) process.exit(1); console.log(pkg.dependencies['@codemirror/lang-javascript'])"
```

Expected: prints the installed version, for example `^6.x.x`.

- [ ] **Step 3: Commit dependency change**

Run:

```bash
git add dataRoomFront/package.json dataRoomFront/package-lock.json
git commit -m "chore(front): add javascript codemirror language"
```

Expected: commit succeeds and includes only the two dependency files.

---

### Task 2: Replace Global Variable Type Model

**Files:**
- Modify: `dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts`

- [ ] **Step 1: Replace the type definition**

Replace the file with:

```ts
/**
 * 全局变量来源
 */
export type GlobalVariableSource = 'static' | 'url' | 'code'

/**
 * 静态值全局变量配置
 */
export interface StaticGlobalVariableConfig {
  value: string
}

/**
 * URL 参数全局变量配置
 */
export interface UrlGlobalVariableConfig {
  paramName: string
  defaultValue: string
}

/**
 * 代码块全局变量配置
 */
export interface CodeGlobalVariableConfig {
  code: string
}

export type GlobalVariableConfig = StaticGlobalVariableConfig | UrlGlobalVariableConfig | CodeGlobalVariableConfig

/**
 * 全局变量
 */
export interface GlobalVariable {
  id: string
  name: string
  remark: string
  source: GlobalVariableSource
  config: GlobalVariableConfig
}

export const GLOBAL_VARIABLE_SOURCE_OPTIONS: Array<{ label: string; value: GlobalVariableSource }> = [
  { label: '静态值', value: 'static' },
  { label: 'URL', value: 'url' },
  { label: '代码块', value: 'code' },
]

export const DEFAULT_CODE_GLOBAL_VARIABLE_CODE = `// 请输入JS代码
return ''`

export const getGlobalVariableSourceLabel = (source: GlobalVariableSource | string): string => {
  return GLOBAL_VARIABLE_SOURCE_OPTIONS.find((item) => item.value === source)?.label || String(source || '')
}

export const createDefaultGlobalVariableConfig = (source: GlobalVariableSource): GlobalVariableConfig => {
  if (source === 'url') {
    return {
      paramName: '',
      defaultValue: '',
    }
  }
  if (source === 'code') {
    return {
      code: DEFAULT_CODE_GLOBAL_VARIABLE_CODE,
    }
  }
  return {
    value: '',
  }
}

export const asStaticGlobalVariableConfig = (variable: GlobalVariable): StaticGlobalVariableConfig => {
  return variable.config as StaticGlobalVariableConfig
}

export const asUrlGlobalVariableConfig = (variable: GlobalVariable): UrlGlobalVariableConfig => {
  return variable.config as UrlGlobalVariableConfig
}

export const asCodeGlobalVariableConfig = (variable: GlobalVariable): CodeGlobalVariableConfig => {
  return variable.config as CodeGlobalVariableConfig
}
```

- [ ] **Step 2: Run type-check to expose compile errors**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: FAIL. Errors should reference old fields such as `from`, `urlName`, `defaultValue`, or `script` in `GlobalVariable.vue` and `use-canvas-inst/index.ts`.

- [ ] **Step 3: Commit the model change**

Run:

```bash
git add dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts
git commit -m "feat(front): define global variable source model"
```

Expected: commit succeeds with only the type model file.

---

### Task 3: Update Global Variable Runtime Semantics

**Files:**
- Modify: `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`

- [ ] **Step 1: Update imports**

Change the existing `GlobalVariable` import block to include config helpers:

```ts
import type {GlobalVariable} from "@/dataRoom/designer/types/GlobalVariable.ts";
import {
  asCodeGlobalVariableConfig,
  asStaticGlobalVariableConfig,
  asUrlGlobalVariableConfig,
} from "@/dataRoom/designer/types/GlobalVariable.ts";
```

Keep the existing import style in the file. Do not modify unrelated imports.

- [ ] **Step 2: Add a local finder helper inside `useCanvasInst`**

Add this helper after `const chartInstanceMap: ChartInstanceMap = {}`:

```ts
  const findGlobalVariable = (globalVariableName: string): GlobalVariable | null => {
    for (let i = 0; i < globalVariable.value.length; i++) {
      const globalVar = globalVariable.value[i]
      if (!globalVar) {
        continue
      }
      if (globalVar.name === globalVariableName) {
        return globalVar
      }
    }
    return null
  }
```

- [ ] **Step 3: Replace `getGlobalVariableValue` implementation**

Replace the current `getGlobalVariableValue` method body with:

```ts
    getGlobalVariableValue: (globalVariableName: string) => {
      const globalVar = findGlobalVariable(globalVariableName)
      if (!globalVar) {
        console.warn(`全局变量 ${globalVariableName} 不存在`)
        return ''
      }
      if (globalVar.source === 'static') {
        return asStaticGlobalVariableConfig(globalVar).value
      }
      if (globalVar.source === 'url') {
        const config = asUrlGlobalVariableConfig(globalVar)
        if (!config.paramName) {
          console.error(`无法获取全局变量 ${globalVar.name} 的值，因为 URL 参数名称未配置`)
          return config.defaultValue || ''
        }
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get(config.paramName) || config.defaultValue || ''
      }
      if (globalVar.source === 'code') {
        const config = asCodeGlobalVariableConfig(globalVar)
        let scriptFunc: Function | null = null
        try {
          const behaviorEventParam: BehaviorEventParam = {
            canvasInst: canvasInst,
            params: {}
          }
          scriptFunc = new Function('bep', config.code)
          const returnValue = scriptFunc(behaviorEventParam)
          if (returnValue === undefined || returnValue === null) {
            console.error(`全局变量 ${globalVar.name} 的代码块执行后未返回值`)
            return ''
          }
          return returnValue
        } catch (error) {
          console.error(`全局变量 ${globalVar.name} 的代码块执行失败:`, error)
          return ''
        } finally {
          scriptFunc = null
        }
      }
      console.warn(`全局变量 ${globalVar.name} 的来源 ${globalVar.source} 不支持`)
      return ''
    },
```

- [ ] **Step 4: Replace `updateGlobalVariableValue` implementation**

Replace the current `updateGlobalVariableValue` method body with:

```ts
    updateGlobalVariableValue: (globalVariableName: string, value: string) => {
      const globalVar = findGlobalVariable(globalVariableName)
      if (!globalVar) {
        console.warn(`全局变量 ${globalVariableName} 不存在，无法更新`)
        return
      }
      if (globalVar.source !== 'static') {
        console.warn(`全局变量 ${globalVar.name} 的来源为 ${globalVar.source}，不支持写回`)
        return
      }
      const config = asStaticGlobalVariableConfig(globalVar)
      config.value = value
      if (!value) {
        console.warn(`全局变量 ${globalVar.name} 的值被设置为空`)
      }
    },
```

- [ ] **Step 5: Run type-check to verify remaining errors are UI-related**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: FAIL until `GlobalVariable.vue` is updated. Remaining errors should not mention `use-canvas-inst/index.ts`.

- [ ] **Step 6: Commit runtime change**

Run:

```bash
git add dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts
git commit -m "feat(front): resolve global variables by source"
```

Expected: commit succeeds with only runtime changes.

---

### Task 4: Update Global Variable Configuration Dialog

**Files:**
- Modify: `dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue`

- [ ] **Step 1: Update imports**

Use these imports at the top of the script:

```ts
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Search } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import type { GlobalVariable, GlobalVariableSource } from '@/dataRoom/designer/types/GlobalVariable.ts'
import {
  asCodeGlobalVariableConfig,
  asStaticGlobalVariableConfig,
  asUrlGlobalVariableConfig,
  createDefaultGlobalVariableConfig,
  getGlobalVariableSourceLabel,
  GLOBAL_VARIABLE_SOURCE_OPTIONS,
} from '@/dataRoom/designer/types/GlobalVariable.ts'
```

- [ ] **Step 2: Add CodeMirror extensions and config computed helpers**

Add these after `const activeGlobalVariable = ref<GlobalVariable>()`:

```ts
const jsEditorExtensions = [javascript(), eclipse]

const staticConfig = computed(() => {
  if (!activeGlobalVariable.value || activeGlobalVariable.value.source !== 'static') {
    return undefined
  }
  return asStaticGlobalVariableConfig(activeGlobalVariable.value)
})

const urlConfig = computed(() => {
  if (!activeGlobalVariable.value || activeGlobalVariable.value.source !== 'url') {
    return undefined
  }
  return asUrlGlobalVariableConfig(activeGlobalVariable.value)
})

const codeConfig = computed(() => {
  if (!activeGlobalVariable.value || activeGlobalVariable.value.source !== 'code') {
    return undefined
  }
  return asCodeGlobalVariableConfig(activeGlobalVariable.value)
})
```

- [ ] **Step 3: Replace `onAdd`**

Replace `onAdd` with:

```ts
const onAdd = () => {
  const inst: GlobalVariable = {
    id: uuidv4(),
    name: generateVarName(),
    remark: '',
    source: 'static',
    config: createDefaultGlobalVariableConfig('static'),
  }
  props.globalVariable.push(inst)
  activeGlobalVariable.value = inst
}
```

- [ ] **Step 4: Add source change handler**

Add this function after `onAdd`:

```ts
const onSourceChange = (source: GlobalVariableSource) => {
  if (!activeGlobalVariable.value) {
    return
  }
  activeGlobalVariable.value.source = source
  activeGlobalVariable.value.config = createDefaultGlobalVariableConfig(source)
}
```

- [ ] **Step 5: Replace the left list item markup**

Replace the existing list item content:

```vue
<div class="name">{{ item.name }}</div>
<div class="remark">{{ item.remark }}</div>
```

with:

```vue
<div class="name">{{ item.name }}</div>
<div class="meta">
  <el-tag size="small">{{ getGlobalVariableSourceLabel(item.source) }}</el-tag>
  <span v-if="item.remark" class="remark">{{ item.remark }}</span>
</div>
```

- [ ] **Step 6: Replace the source form fields**

Replace the current source/default/script form block with:

```vue
          <el-form-item label="来源">
            <el-select :model-value="activeGlobalVariable.source" placeholder="请选择" @change="onSourceChange">
              <el-option v-for="item in GLOBAL_VARIABLE_SOURCE_OPTIONS" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="activeGlobalVariable.source === 'static' && staticConfig">
            <el-form-item label="变量值">
              <el-input v-model="staticConfig.value"></el-input>
            </el-form-item>
          </template>
          <template v-if="activeGlobalVariable.source === 'url' && urlConfig">
            <el-form-item label="URL参数名称">
              <el-input v-model="urlConfig.paramName"></el-input>
            </el-form-item>
            <el-form-item label="默认值">
              <el-input v-model="urlConfig.defaultValue"></el-input>
            </el-form-item>
          </template>
          <template v-if="activeGlobalVariable.source === 'code' && codeConfig">
            <el-form-item label="JS脚本">
              <div class="script-editor">
                <Codemirror v-model="codeConfig.code" :extensions="jsEditorExtensions" :indent-with-tab="true" :tab-size="2" />
              </div>
            </el-form-item>
          </template>
```

The final form order must be:

1. 变量名称
2. 来源
3. Dynamic source configuration
4. 变量描述

- [ ] **Step 7: Replace list metadata styles**

Replace the old `.remark` style under `.variable` with:

```scss
      & .meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }

      & .remark {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
```

- [ ] **Step 8: Add CodeMirror wrapper styles**

Add under `.variable-form-wrapper` or at the bottom of the scoped style:

```scss
  & .script-editor {
    width: 100%;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;

    :deep(.cm-editor) {
      height: 240px;
      font-size: 13px;
      font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
    }

    :deep(.cm-scroller) {
      overflow: auto;
    }
  }
```

- [ ] **Step 9: Run type-check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 10: Commit dialog change**

Run:

```bash
git add dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue
git commit -m "feat(front): add global variable source editor"
```

Expected: commit succeeds with only `GlobalVariable.vue`.

---

### Task 5: Final Validation and Manual Checks

**Files:**
- No expected source edits unless validation exposes a defect.

- [ ] **Step 1: Run lint**

Run:

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS. If ESLint formats files, inspect `git diff` and commit only relevant formatting changes:

```bash
git diff -- dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue
git add dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue
git commit -m "style(front): format global variable source changes"
```

- [ ] **Step 2: Run final type-check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 3: Inspect remaining references to old global variable fields**

Run:

```bash
rg -n "globalVar\\.(from|urlName|defaultValue|script)|activeGlobalVariable\\.(from|urlName|defaultValue|script)|\\.from === 'static'|\\.from === 'url'" dataRoomFront/src/dataRoom
```

Expected: no matches related to global variable objects. Matches for dataset parameter `from` are acceptable only when the file path or surrounding code clearly references `ChartDatasetParam`.

- [ ] **Step 4: Start the frontend dev server for manual verification**

Run:

```bash
cd dataRoomFront
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 5: Manual verification checklist**

Use the running UI and verify:

- 新增全局变量默认是静态值来源。
- 左侧变量列表显示变量名称、来源 `el-tag` 和变量描述。
- 修改变量描述后，左侧列表同步显示。
- 切换到静态值来源，只显示变量值。
- 切换到 URL 来源，只显示 URL 参数名称和默认值。
- 切换到代码块来源，只显示 JS 脚本 CodeMirror 编辑器。
- 静态值变量可被表单组件和交互动作写回。
- URL 变量不可被表单组件和交互动作写回，并在控制台输出 warning。
- 代码块变量不可被表单组件和交互动作写回，并在控制台输出 warning。
- 数据集参数绑定静态值变量时得到静态值。
- 数据集参数绑定 URL 变量时优先得到 URL 参数值，缺失时得到默认值。
- 数据集参数绑定代码块变量时得到脚本返回值。
- 代码块变量可以通过 `bep.canvasInst.getGlobalVariableValue('变量名')` 读取其他变量。
- 代码块执行异常时不阻断页面渲染，返回空字符串并输出错误。

- [ ] **Step 6: Commit validation fixes if any**

If manual validation required code fixes, commit them:

```bash
git add dataRoomFront/src/dataRoom/designer/types/GlobalVariable.ts dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts dataRoomFront/src/dataRoom/designer/components/GlobalVariable.vue dataRoomFront/package.json dataRoomFront/package-lock.json
git commit -m "fix(front): complete global variable source validation"
```

Expected: commit only exists if validation produced actual code fixes.

---

## Self-Review

- Spec coverage:
  - Data model is covered by Task 2.
  - CodeMirror JS dependency is covered by Task 1.
  - Runtime read/write rules are covered by Task 3.
  - Left list source tag and dynamic form are covered by Task 4.
  - Type-check, lint, old-field scan, dev server, and manual checks are covered by Task 5.
- Placeholder scan:
  - No placeholder markers or unspecified "handle edge cases" steps remain.
- Type consistency:
  - The plan consistently uses `source`, `config`, `StaticGlobalVariableConfig`, `UrlGlobalVariableConfig`, and `CodeGlobalVariableConfig`.
  - The plan does not use inner `config.type`.
