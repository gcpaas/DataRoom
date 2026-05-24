# Remove THIS_PLUGIN_TYPE Build Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the custom Vite transform that replaces `DrConst.THIS_PLUGIN_TYPE` and hardcode each component type as its component directory name.

**Architecture:** Component type values stay owned by each component directory. The build pipeline no longer rewrites source code, and `DrConst` keeps only shared runtime constants. A mechanical rewrite handles repeated component files, followed by small manual edits to the Vite config and constant file.

**Tech Stack:** Vue 3 single-file components, TypeScript, Vite, `vue-tsc`.

---

### Task 1: Mechanically Replace Component Type Placeholders

**Files:**
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrAreaChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrBarChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrBorder/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrBubbleChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrDecoration/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrFullScreen/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrGauge/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrHorizontalBarChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrIframe/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrImage/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrInput/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrLineChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrMap/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrModel3D/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrPieChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrProgressBar/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrRadarChart/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrRadio/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrSelect/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrTabList/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrText/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrVideoPlayer/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/DrWordCloud/`
- Modify component files under `data-room-ui/src/dataroom-packages/components/Remote/`

- [ ] **Step 1: Run the mechanical replacement script**

Run from repository root:

```bash
node <<'NODE'
const fs = require('node:fs')
const path = require('node:path')

const componentsRoot = path.join(process.cwd(), 'data-room-ui/src/dataroom-packages/components')
const targetFiles = ['install.ts', 'plugin.ts', 'index.vue', 'panel/index.vue']
const comment = '组件类型需与当前组件目录名保持一致'

for (const entry of fs.readdirSync(componentsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'type') continue

  const componentType = entry.name

  for (const relativeFile of targetFiles) {
    const filePath = path.join(componentsRoot, componentType, relativeFile)
    if (!fs.existsSync(filePath)) continue

    let source = fs.readFileSync(filePath, 'utf8')
    const original = source

    source = source.replace(/DrConst\.THIS_PLUGIN_TYPE/g, `'${componentType}'`)
    source = source.replace(new RegExp(`'${componentType}'\\s*\\+\\s*'ControlPanel'`, 'g'), `'${componentType}ControlPanel'`)

    source = source
      .split('\n')
      .filter((line) => !/^\s*import\s*\{\s*DrConst\s*\}\s*from\s*['"][^'"]+DrConst\.ts['"];?\s*$/.test(line))
      .join('\n')

    const lines = source.split('\n')
    const rewritten = []
    for (const line of lines) {
      const hasComponentTypeLiteral = line.includes(`'${componentType}'`) || line.includes(`'${componentType}ControlPanel'`)
      const previousLine = rewritten[rewritten.length - 1] || ''
      if (hasComponentTypeLiteral && !previousLine.includes(comment)) {
        const indent = line.match(/^\s*/)?.[0] || ''
        rewritten.push(`${indent}// ${comment}`)
      }
      rewritten.push(line)
    }

    source = rewritten.join('\n')

    if (source !== original) {
      fs.writeFileSync(filePath, source, 'utf8')
    }
  }
}
NODE
```

Expected: component files are updated; `DrConst` imports used only for `THIS_PLUGIN_TYPE` are removed; component type literals have the comment above them.

- [ ] **Step 2: Inspect representative component files**

Run:

```bash
sed -n '1,24p' data-room-ui/src/dataroom-packages/components/DrBarChart/plugin.ts
sed -n '158,172p' data-room-ui/src/dataroom-packages/components/DrBarChart/install.ts
sed -n '1,12p' data-room-ui/src/dataroom-packages/components/DrBarChart/index.vue
sed -n '1,12p' data-room-ui/src/dataroom-packages/components/DrBarChart/panel/index.vue
```

Expected snippets:

```ts
// 组件类型需与当前组件目录名保持一致
super('DrBarChart', '柱状图', '柱状图、bar、柱形图、条形图', thumbnail, tags)
```

```ts
// 组件类型需与当前组件目录名保持一致
'DrBarChart',
```

```ts
export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrBarChart',
})
```

```ts
export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrBarChartControlPanel',
})
```

- [ ] **Step 3: Commit the component rewrite**

```bash
git add data-room-ui/src/dataroom-packages/components
git commit -m "refactor(ui): hardcode component type names"
```

### Task 2: Remove the Vite Plugin and Shared Placeholder Constant

**Files:**
- Modify: `data-room-ui/vite.config.ts`
- Modify: `data-room-ui/src/dataroom-packages/constant/DrConst.ts`
- Delete: `data-room-ui/ReplaceThisPluginType.ts`

- [ ] **Step 1: Update `data-room-ui/vite.config.ts`**

Remove this import:

```ts
import {ReplaceThisPluginType} from './ReplaceThisPluginType'
```

Remove this `define` block:

```ts
  define: {
    __THIS_PLUGIN_TYPE__: JSON.stringify(process.env.THIS_PLUGIN_TYPE || ''),
  },
```

Remove this plugin entry:

```ts
    ReplaceThisPluginType(),
```

- [ ] **Step 2: Update `data-room-ui/src/dataroom-packages/constant/DrConst.ts`**

Replace the file contents with:

```ts
export enum DrConst {
  /**
   * 画布实例
   */
  CANVAS_INST = 'canvasInst',
  /**
   * 全局变量
   */
  GLOBAL_VARIABLE = 'globalVariable',
}
```

- [ ] **Step 3: Delete `data-room-ui/ReplaceThisPluginType.ts`**

Delete the file because no source code depends on the build-time replacement behavior.

- [ ] **Step 4: Commit plugin removal**

```bash
git add data-room-ui/vite.config.ts data-room-ui/src/dataroom-packages/constant/DrConst.ts data-room-ui/ReplaceThisPluginType.ts
git commit -m "refactor(ui): remove plugin type replacement"
```

### Task 3: Verify the Migration

**Files:**
- Inspect: `data-room-ui`

- [ ] **Step 1: Search for removed identifiers**

Run:

```bash
rg -n "DrConst\\.THIS_PLUGIN_TYPE|ReplaceThisPluginType|__THIS_PLUGIN_TYPE__" data-room-ui
```

Expected: no output.

- [ ] **Step 2: Search for remaining component `DrConst` imports**

Run:

```bash
rg -n "import \\{\\s*DrConst\\s*\\}" data-room-ui/src/dataroom-packages/components
```

Expected: no output.

- [ ] **Step 3: Run frontend type checking**

Run:

```bash
cd data-room-ui
npm run type-check
```

Expected: `vue-tsc --build` completes successfully.

- [ ] **Step 4: Commit verification fixes if needed**

If verification reveals only mechanical misses, fix them and commit:

```bash
git add data-room-ui
git commit -m "fix(ui): complete component type migration"
```

If no fixes are needed, do not create an empty commit.

