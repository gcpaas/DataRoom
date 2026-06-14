# 组件 MCP 工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增组件配置导出命令，并通过两个 MCP 工具读取 `dataRoomServer/src/main/resources/mcp/component-configs/` 下的组件列表和组件配置详情。

**Architecture:** 前端使用 Node ESM 脚本和现有 `typescript` 依赖解析组件源码，生成稳定 JSON 文件。后端新增独立 `component` 包，使用小型资源读取 service 解析 classpath JSON，并通过独立 `ComponentMcpTool` 暴露 `listComponents` 和 `getComponentConfig`。

**Tech Stack:** Vue 3 项目脚本、Node.js ESM、TypeScript Compiler API、Spring Boot 3.5、Spring AI MCP `@Tool`、Jackson、JUnit 5、Maven。

---

## 文件结构

- Create: `dataRoomFront/scripts/component-config-exporter.mjs`
  - 纯函数模块，负责解析 `PluginRegister.ts`、组件 `plugin.ts`、组件 `install.ts`，并生成组件摘要和详情对象。
- Create: `dataRoomFront/scripts/component-config-exporter.test.mjs`
  - 使用 Node 内置 `assert` 和临时目录测试导出器核心行为，不引入新测试框架。
- Create: `dataRoomFront/scripts/export-component-configs.mjs`
  - CLI 入口，调用导出器，把结果写入 `../dataRoomServer/src/main/resources/mcp/component-configs/`。
- Modify: `dataRoomFront/package.json`
  - 新增 `export:component-configs` 脚本。
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentSummary.java`
  - 组件摘要 DTO。
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentConfigField.java`
  - 单个扁平配置字段 DTO。
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentConfig.java`
  - 单个组件完整配置 DTO。
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceService.java`
  - 读取 classpath JSON 资源并解析为 DTO。
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/ComponentMcpTool.java`
  - MCP 工具对象，返回 `Resp<List<ComponentSummary>>` 和 `Resp<ComponentConfig>`。
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/DataRoomMcpConfiguration.java`
  - 注册 `ComponentMcpTool`。
- Create: `dataRoomServer/src/test/resources/mcp/component-configs/index.json`
  - 后端测试用组件摘要资源。
- Create: `dataRoomServer/src/test/resources/mcp/component-configs/DrText.config.json`
  - 后端测试用组件详情资源。
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceServiceTest.java`
  - 后端资源读取 service 测试。
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/ComponentMcpToolTest.java`
  - MCP 工具对象测试。
- Generated: `dataRoomServer/src/main/resources/mcp/component-configs/index.json`
  - 由前端命令生成并提交。
- Generated: `dataRoomServer/src/main/resources/mcp/component-configs/*.config.json`
  - 由前端命令生成并提交。

实施前先运行 `git status --short`。当前工作区已有与本任务无关的改动，执行计划时不要重置或回滚这些改动；提交时使用明确路径，避免把无关 staged 内容带入提交。

---

### Task 1: 前端导出器核心测试

**Files:**
- Create: `dataRoomFront/scripts/component-config-exporter.test.mjs`
- Create: `dataRoomFront/scripts/component-config-exporter.mjs`

- [ ] **Step 1: 写导出器核心行为测试**

创建 `dataRoomFront/scripts/component-config-exporter.test.mjs`：

```javascript
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  exportComponentConfigs,
  flattenConfigFields,
  parseLiteralOptions,
  resolveFieldType
} from './component-config-exporter.mjs'

const rootDir = await mkdtemp(path.join(tmpdir(), 'dataroom-component-export-'))

try {
  assert.deepEqual(parseLiteralOptions("'left' | 'center' | 'right'"), ['left', 'center', 'right'])
  assert.deepEqual(parseLiteralOptions('"top" | "bottom"'), ['top', 'bottom'])
  assert.equal(resolveFieldType('string').type, 'string')
  assert.equal(resolveFieldType('number | null').type, 'number')
  assert.equal(resolveFieldType('boolean').type, 'boolean')
  assert.deepEqual(resolveFieldType("'axis' | 'item'"), { type: 'enum', options: ['axis', 'item'] })

  const fields = flattenConfigFields({
    properties: [
      { name: 'text', typeText: 'string', description: '文本内容' },
      { name: 'align', typeText: "'left' | 'center' | 'right'", description: '对齐方式' },
      {
        name: 'textStyle',
        description: '文本样式',
        properties: [
          { name: 'fontSize', typeText: 'number', description: '字体大小(px)' }
        ]
      }
    ]
  }, {
    text: '文本占位符',
    align: 'left',
    textStyle: { fontSize: 14 }
  })

  assert.deepEqual(fields, [
    { field: 'text', type: 'string', description: '文本内容', defaultValue: '文本占位符' },
    { field: 'align', type: 'enum', options: ['left', 'center', 'right'], description: '对齐方式', defaultValue: 'left' },
    { field: 'textStyle.fontSize', type: 'number', description: '字体大小(px)', defaultValue: 14 }
  ])

  const projectDir = path.join(rootDir, 'project')
  const componentsDir = path.join(projectDir, 'src/dataroom-packages/components')
  const registerDir = path.join(projectDir, 'src/dataroom-packages/_components')
  const outputDir = path.join(rootDir, 'output')
  await mkdir(path.join(componentsDir, 'DrText'), { recursive: true })
  await mkdir(registerDir, { recursive: true })

  await writeFile(path.join(registerDir, 'PluginRegister.ts'), `
import {DrTextPlugin} from '@/dataroom-packages/components/DrText/plugin.ts'
const pluginList = [
  new DrTextPlugin(['TEXT'])
]
export { pluginList }
`, 'utf8')

  await writeFile(path.join(componentsDir, 'DrText/plugin.ts'), `
import thumbnail from './images/text.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts";
export class DrTextPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrText', '文本', '文字、文本、数字', thumbnail, tags)
  }
}
`, 'utf8')

  await writeFile(path.join(componentsDir, 'DrText/install.ts'), `
import {createChartConfig} from '../type/define'
interface DrTextPropsInterface {
  /** 文本内容 */
  text: string
  /** 对齐方式 */
  align: 'left' | 'center' | 'right'
  /** 文本样式 */
  textStyle: {
    /** 字体大小(px) */
    fontSize: number
  }
}
const getInstance = () => {
  return createChartConfig<DrTextPropsInterface>('DrText', {
    text: '文本占位符',
    align: 'left',
    textStyle: { fontSize: 14 }
  }, { title: '文本' })
}
export {getInstance}
`, 'utf8')

  const result = await exportComponentConfigs({
    projectRoot: projectDir,
    outputDir
  })

  assert.equal(result.components.length, 1)
  assert.equal(result.components[0].componentName, 'DrText')
  assert.equal(result.components[0].displayName, '文本')
  assert.equal(result.details[0].fields.length, 3)
  assert.equal(result.details[0].fields[2].field, 'textStyle.fontSize')
} finally {
  await rm(rootDir, { recursive: true, force: true })
}
```

- [ ] **Step 2: 创建最小导出器模块并确认测试失败在未实现点**

创建 `dataRoomFront/scripts/component-config-exporter.mjs`：

```javascript
export function parseLiteralOptions() {
  throw new Error('parseLiteralOptions not implemented')
}

export function resolveFieldType() {
  throw new Error('resolveFieldType not implemented')
}

export function flattenConfigFields() {
  throw new Error('flattenConfigFields not implemented')
}

export async function exportComponentConfigs() {
  throw new Error('exportComponentConfigs not implemented')
}
```

运行：

```bash
cd dataRoomFront
node scripts/component-config-exporter.test.mjs
```

Expected: FAIL，错误包含 `parseLiteralOptions not implemented`。

- [ ] **Step 3: 提交测试骨架**

```bash
git add dataRoomFront/scripts/component-config-exporter.test.mjs dataRoomFront/scripts/component-config-exporter.mjs
git commit -m "test(frontend): add component config exporter tests"
```

---

### Task 2: 实现前端导出器和 CLI

**Files:**
- Modify: `dataRoomFront/scripts/component-config-exporter.mjs`
- Create: `dataRoomFront/scripts/export-component-configs.mjs`
- Modify: `dataRoomFront/package.json`

- [ ] **Step 1: 实现导出器核心逻辑**

将 `dataRoomFront/scripts/component-config-exporter.mjs` 替换为实现，保留以下公开函数：

```javascript
import ts from 'typescript'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const registerPath = 'src/dataroom-packages/_components/PluginRegister.ts'
const componentsPath = 'src/dataroom-packages/components'

export function parseLiteralOptions(typeText) {
  const parts = typeText.split('|').map((part) => part.trim())
  if (parts.length < 2) {
    return []
  }
  const options = []
  for (const part of parts) {
    const match = part.match(/^['"]([^'"]+)['"]$/)
    if (!match) {
      return []
    }
    options.push(match[1])
  }
  return options
}

export function resolveFieldType(typeText) {
  const normalized = typeText.replace(/\s+/g, ' ').trim()
  const options = parseLiteralOptions(normalized)
  if (options.length > 0) {
    return { type: 'enum', options }
  }
  if (normalized.includes('boolean')) {
    return { type: 'boolean' }
  }
  if (normalized.includes('number')) {
    return { type: 'number' }
  }
  if (normalized.includes('string[]') || normalized.includes('Array<string>')) {
    return { type: 'array' }
  }
  if (normalized.includes('string')) {
    return { type: 'string' }
  }
  if (normalized.endsWith('[]') || normalized.startsWith('Array<')) {
    return { type: 'array' }
  }
  return { type: 'object' }
}

export function flattenConfigFields(interfaceInfo, defaults, prefix = '') {
  const fields = []
  for (const property of interfaceInfo.properties) {
    const fieldPath = prefix ? `${prefix}.${property.name}` : property.name
    const defaultValue = readDefaultValue(defaults, property.name)
    if (property.properties && property.properties.length > 0) {
      fields.push(...flattenConfigFields(property, defaultValue ?? {}, fieldPath))
      continue
    }
    const typeInfo = resolveFieldType(property.typeText)
    const field = {
      field: fieldPath,
      type: typeInfo.type,
      description: property.description || property.name
    }
    if (typeInfo.options) {
      field.options = typeInfo.options
    }
    if (defaultValue !== undefined) {
      field.defaultValue = defaultValue
    }
    fields.push(field)
  }
  return fields
}

function readDefaultValue(defaults, key) {
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) {
    return undefined
  }
  return defaults[key]
}

export async function exportComponentConfigs({ projectRoot, outputDir }) {
  const registerSource = await readText(path.join(projectRoot, registerPath))
  const registeredComponents = parseRegisteredComponents(registerSource)
  const summaries = []
  const details = []

  for (const componentName of registeredComponents) {
    const componentDir = path.join(projectRoot, componentsPath, componentName)
    const pluginSource = await readText(path.join(componentDir, 'plugin.ts'))
    const installSource = await readText(path.join(componentDir, 'install.ts'))
    const pluginMeta = parsePluginMetadata(pluginSource, componentName)
    const interfaceInfo = parsePropsInterface(installSource, componentName)
    const defaults = parsePropsDefaults(installSource, componentName)
    const fields = flattenConfigFields(interfaceInfo, defaults)
    const summary = {
      componentName: pluginMeta.componentName,
      displayName: pluginMeta.displayName,
      description: pluginMeta.description
    }
    const detail = { ...summary, fields }
    summaries.push(summary)
    details.push(detail)
  }

  await mkdir(outputDir, { recursive: true })
  await writeJson(path.join(outputDir, 'index.json'), summaries)
  for (const detail of details) {
    await writeJson(path.join(outputDir, `${detail.componentName}.config.json`), detail)
  }
  return { components: summaries, details }
}

function parseRegisteredComponents(source) {
  const matches = [...source.matchAll(/new\s+([A-Za-z0-9_]+)Plugin\s*\(/g)]
  const names = matches.map((match) => match[1])
  if (names.length === 0) {
    throw new Error('PluginRegister.ts 中未解析到组件插件')
  }
  return names
}

function parsePluginMetadata(source, expectedComponentName) {
  const superCall = source.match(/super\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/s)
  if (!superCall) {
    throw new Error(`${expectedComponentName}/plugin.ts 中未解析到 super(componentName, displayName, description)`)
  }
  const componentName = superCall[1]
  if (componentName !== expectedComponentName) {
    throw new Error(`${expectedComponentName}/plugin.ts 中组件名 ${componentName} 与目录名不一致`)
  }
  return {
    componentName,
    displayName: superCall[2],
    description: superCall[3]
  }
}

function parsePropsInterface(source, componentName) {
  const sourceFile = ts.createSourceFile(`${componentName}.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const interfaceNode = findPropsInterface(sourceFile, componentName)
  if (!interfaceNode) {
    throw new Error(`${componentName}/install.ts 中未找到 props interface`)
  }
  return {
    name: interfaceNode.name.text,
    properties: parseInterfaceMembers(interfaceNode.members, sourceFile)
  }
}

function findPropsInterface(sourceFile, componentName) {
  let found
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text.includes(componentName) && node.name.text.includes('PropsInterface')) {
      found = node
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

function parseInterfaceMembers(members, sourceFile) {
  const properties = []
  for (const member of members) {
    if (!ts.isPropertySignature(member) || !member.type || !member.name) {
      continue
    }
    const name = member.name.getText(sourceFile).replaceAll('"', '').replaceAll("'", '')
    const property = {
      name,
      typeText: member.type.getText(sourceFile),
      description: readJsDoc(member)
    }
    if (ts.isTypeLiteralNode(member.type)) {
      property.properties = parseInterfaceMembers(member.type.members, sourceFile)
    }
    properties.push(property)
  }
  return properties
}

function readJsDoc(node) {
  const docs = ts.getJSDocCommentsAndTags(node)
  for (const doc of docs) {
    if (ts.isJSDoc(doc) && doc.comment) {
      return String(doc.comment)
    }
  }
  return ''
}

function parsePropsDefaults(source, componentName) {
  const callIndex = source.indexOf(`createChartConfig<`)
  if (callIndex < 0) {
    throw new Error(`${componentName}/install.ts 中未找到 createChartConfig 调用`)
  }
  const firstArgStart = source.indexOf(',', callIndex)
  const objectStart = source.indexOf('{', firstArgStart)
  const objectEnd = findMatching(source, objectStart, '{', '}')
  if (objectStart < 0 || objectEnd < 0) {
    throw new Error(`${componentName}/install.ts 中未解析到 props 默认配置对象`)
  }
  const objectText = source.slice(objectStart, objectEnd + 1)
  return evaluateObjectLiteral(objectText, componentName)
}

function evaluateObjectLiteral(objectText, componentName) {
  const sourceFile = ts.createSourceFile(`${componentName}.defaults.ts`, `const defaults = ${objectText}`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let initializer
  sourceFile.forEachChild((node) => {
    if (ts.isVariableStatement(node)) {
      initializer = node.declarationList.declarations[0].initializer
    }
  })
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(`${componentName}/install.ts 中 props 默认配置不是对象字面量`)
  }
  return objectLiteralToValue(initializer, sourceFile)
}

function objectLiteralToValue(node, sourceFile) {
  const result = {}
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }
    const key = property.name.getText(sourceFile).replaceAll('"', '').replaceAll("'", '')
    result[key] = expressionToValue(property.initializer, sourceFile)
  }
  return result
}

function expressionToValue(node, sourceFile) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true
  }
  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false
  }
  if (node.kind === ts.SyntaxKind.NullKeyword) {
    return null
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text)
  }
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return node.operator === ts.SyntaxKind.MinusToken ? -Number(node.operand.text) : Number(node.operand.text)
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => expressionToValue(element, sourceFile))
  }
  if (ts.isObjectLiteralExpression(node)) {
    return objectLiteralToValue(node, sourceFile)
  }
  return node.getText(sourceFile)
}

function findMatching(source, start, open, close) {
  let depth = 0
  for (let index = start; index < source.length; index++) {
    const char = source[index]
    if (char === open) {
      depth++
    } else if (char === close) {
      depth--
      if (depth === 0) {
        return index
      }
    }
  }
  return -1
}

async function readText(filePath) {
  return readFile(filePath, 'utf8')
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
```

- [ ] **Step 2: 实现 CLI 入口**

创建 `dataRoomFront/scripts/export-component-configs.mjs`：

```javascript
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exportComponentConfigs } from './component-config-exporter.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const outputDir = path.resolve(projectRoot, '../dataRoomServer/src/main/resources/mcp/component-configs')

const result = await exportComponentConfigs({ projectRoot, outputDir })

console.log(`Exported ${result.components.length} component config files to ${outputDir}`)
```

- [ ] **Step 3: 新增 npm 脚本**

修改 `dataRoomFront/package.json` 的 `scripts`：

```json
"export:component-configs": "node scripts/export-component-configs.mjs"
```

保持现有脚本不变，只添加这一项。

- [ ] **Step 4: 运行前端导出器测试**

```bash
cd dataRoomFront
node scripts/component-config-exporter.test.mjs
```

Expected: PASS，无输出或仅 Node 正常退出。

- [ ] **Step 5: 运行导出命令**

```bash
cd dataRoomFront
npm run export:component-configs
cd ..
```

Expected: 输出 `Exported 30 component config files to .../dataRoomServer/src/main/resources/mcp/component-configs`，实际数量以 `PluginRegister.ts` 当前组件数为准。

- [ ] **Step 6: 抽查生成内容**

```bash
sed -n '1,80p' dataRoomServer/src/main/resources/mcp/component-configs/index.json
sed -n '1,120p' dataRoomServer/src/main/resources/mcp/component-configs/DrText.config.json
sed -n '1,120p' dataRoomServer/src/main/resources/mcp/component-configs/DrBarChart.config.json
```

Expected:

- `index.json` 包含 `componentName`、`displayName`、`description`。
- `DrText.config.json` 包含 `fields`。
- `DrText.config.json` 中 `align` 字段为 `type: "enum"` 且 `options` 包含 `left`、`center`、`right`。
- `DrBarChart.config.json` 中包含 `tooltip.trigger`、`series.label.position` 等点路径字段。

- [ ] **Step 7: 运行前端类型检查**

```bash
cd dataRoomFront
npm run type-check
cd ..
```

Expected: PASS。

- [ ] **Step 8: 提交前端导出功能和生成资源**

```bash
git add dataRoomFront/package.json dataRoomFront/scripts/component-config-exporter.mjs dataRoomFront/scripts/export-component-configs.mjs dataRoomServer/src/main/resources/mcp/component-configs
git commit -m "feat(frontend): export component mcp configs"
```

---

### Task 3: 后端资源 DTO 和 service 测试

**Files:**
- Create: `dataRoomServer/src/test/resources/mcp/component-configs/index.json`
- Create: `dataRoomServer/src/test/resources/mcp/component-configs/DrText.config.json`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceServiceTest.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentSummary.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentConfigField.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentConfig.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceService.java`

- [ ] **Step 1: 创建后端测试资源**

创建 `dataRoomServer/src/test/resources/mcp/component-configs/index.json`：

```json
[
  {
    "componentName": "DrText",
    "displayName": "文本",
    "description": "文字、文本、数字"
  }
]
```

创建 `dataRoomServer/src/test/resources/mcp/component-configs/DrText.config.json`：

```json
{
  "componentName": "DrText",
  "displayName": "文本",
  "description": "文字、文本、数字",
  "fields": [
    {
      "field": "text",
      "type": "string",
      "description": "文本内容",
      "defaultValue": "文本占位符"
    },
    {
      "field": "align",
      "type": "enum",
      "options": ["left", "center", "right"],
      "description": "对齐方式",
      "defaultValue": "left"
    }
  ]
}
```

- [ ] **Step 2: 写 service 测试**

创建 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceServiceTest.java`：

```java
package com.gccloud.gcpaas.core.component.service;

import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ComponentConfigResourceServiceTest {

    private final ComponentConfigResourceService service = new ComponentConfigResourceService();

    @Test
    void listComponentsReadsIndexJson() {
        List<ComponentSummary> components = service.listComponents();

        assertEquals(1, components.size());
        assertEquals("DrText", components.get(0).getComponentName());
        assertEquals("文本", components.get(0).getDisplayName());
        assertEquals("文字、文本、数字", components.get(0).getDescription());
    }

    @Test
    void getComponentConfigReadsComponentFile() {
        ComponentConfig config = service.getComponentConfig("DrText");

        assertEquals("DrText", config.getComponentName());
        assertEquals("文本", config.getDisplayName());
        assertEquals(2, config.getFields().size());
        assertEquals("align", config.getFields().get(1).getField());
        assertEquals("enum", config.getFields().get(1).getType());
        assertEquals(List.of("left", "center", "right"), config.getFields().get(1).getOptions());
    }

    @Test
    void getComponentConfigRejectsBlankName() {
        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.getComponentConfig(" "));

        assertEquals("组件名称不能为空", exception.getMessage());
    }

    @Test
    void getComponentConfigReportsAvailableNamesWhenMissing() {
        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.getComponentConfig("MissingComponent"));

        assertTrue(exception.getMessage().contains("组件不存在: MissingComponent"));
        assertTrue(exception.getMessage().contains("DrText"));
    }
}
```

- [ ] **Step 3: 创建最小 DTO 和 service 骨架**

创建 `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentSummary.java`：

```java
package com.gccloud.gcpaas.core.component.bean;

import lombok.Data;

@Data
public class ComponentSummary {
    private String componentName;
    private String displayName;
    private String description;
}
```

创建 `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentConfigField.java`：

```java
package com.gccloud.gcpaas.core.component.bean;

import lombok.Data;

import java.util.List;

@Data
public class ComponentConfigField {
    private String field;
    private String type;
    private List<String> options;
    private String description;
    private Object defaultValue;
}
```

创建 `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean/ComponentConfig.java`：

```java
package com.gccloud.gcpaas.core.component.bean;

import lombok.Data;

import java.util.List;

@Data
public class ComponentConfig {
    private String componentName;
    private String displayName;
    private String description;
    private List<ComponentConfigField> fields;
}
```

创建 `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceService.java`：

```java
package com.gccloud.gcpaas.core.component.service;

import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComponentConfigResourceService {

    public List<ComponentSummary> listComponents() {
        throw new DataRoomException("组件配置资源读取未实现");
    }

    public ComponentConfig getComponentConfig(String componentName) {
        throw new DataRoomException("组件配置资源读取未实现");
    }
}
```

运行：

```bash
mvn -q -pl dataRoomServer -Dtest=ComponentConfigResourceServiceTest test
```

Expected: FAIL，错误包含 `组件配置资源读取未实现`。

- [ ] **Step 4: 实现资源读取 service**

将 `ComponentConfigResourceService.java` 替换为：

```java
package com.gccloud.gcpaas.core.component.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ComponentConfigResourceService {

    private static final String BASE_PATH = "mcp/component-configs/";
    private static final String EXPORT_COMMAND = "npm run export:component-configs";

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ComponentSummary> listComponents() {
        ClassPathResource resource = new ClassPathResource(BASE_PATH + "index.json");
        if (!resource.exists()) {
            throw new DataRoomException("组件配置索引文件不存在，请先执行 " + EXPORT_COMMAND);
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, new TypeReference<List<ComponentSummary>>() {
            });
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("组件配置索引文件读取失败", e);
        }
    }

    public ComponentConfig getComponentConfig(String componentName) {
        if (StringUtils.isBlank(componentName)) {
            throw new DataRoomException("组件名称不能为空");
        }
        String normalizedName = componentName.trim();
        ClassPathResource resource = new ClassPathResource(BASE_PATH + normalizedName + ".config.json");
        if (!resource.exists()) {
            throw new DataRoomException("组件不存在: " + normalizedName + availableComponentNamesMessage());
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, ComponentConfig.class);
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("组件配置文件读取失败: " + normalizedName, e);
        }
    }

    private String availableComponentNamesMessage() {
        try {
            List<ComponentSummary> components = listComponents();
            String names = components.stream()
                    .map(ComponentSummary::getComponentName)
                    .collect(Collectors.joining(", "));
            return "，可用组件: " + names;
        } catch (DataRoomException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return "";
        }
    }
}
```

- [ ] **Step 5: 运行 service 测试**

```bash
mvn -q -pl dataRoomServer -Dtest=ComponentConfigResourceServiceTest test
```

Expected: PASS。

- [ ] **Step 6: 提交后端 service**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/bean dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/service dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/service dataRoomServer/src/test/resources/mcp/component-configs
git commit -m "feat(server): read component config resources"
```

---

### Task 4: 后端 MCP 工具对象和注册

**Files:**
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/ComponentMcpToolTest.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/ComponentMcpTool.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/DataRoomMcpConfiguration.java`

- [ ] **Step 1: 写 MCP 工具对象测试**

创建 `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/ComponentMcpToolTest.java`：

```java
package com.gccloud.gcpaas.core.component;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.component.service.ComponentConfigResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.annotation.Tool;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ComponentMcpToolTest {

    private final ComponentMcpTool tool = new ComponentMcpTool(new ComponentConfigResourceService());

    @Test
    void listComponentsReturnsResourceData() {
        Resp<List<ComponentSummary>> response = tool.listComponents();

        assertEquals(200, response.getCode());
        assertEquals("DrText", response.getData().get(0).getComponentName());
    }

    @Test
    void getComponentConfigReturnsResourceData() {
        Resp<ComponentConfig> response = tool.getComponentConfig("DrText");

        assertEquals(200, response.getCode());
        assertEquals("DrText", response.getData().getComponentName());
        assertEquals("align", response.getData().getFields().get(1).getField());
    }

    @Test
    void methodsAreMcpTools() throws NoSuchMethodException {
        Method listMethod = ComponentMcpTool.class.getMethod("listComponents");
        Method detailMethod = ComponentMcpTool.class.getMethod("getComponentConfig", String.class);

        assertNotNull(listMethod.getAnnotation(Tool.class));
        assertEquals("listComponents", listMethod.getAnnotation(Tool.class).name());
        assertNotNull(detailMethod.getAnnotation(Tool.class));
        assertEquals("getComponentConfig", detailMethod.getAnnotation(Tool.class).name());
    }
}
```

- [ ] **Step 2: 创建 MCP 工具对象**

创建 `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/ComponentMcpTool.java`：

```java
package com.gccloud.gcpaas.core.component;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.component.service.ComponentConfigResourceService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ComponentMcpTool {

    private final ComponentConfigResourceService componentConfigResourceService;

    public ComponentMcpTool(ComponentConfigResourceService componentConfigResourceService) {
        this.componentConfigResourceService = componentConfigResourceService;
    }

    @Tool(name = "listComponents", description = "获取DataRoom当前系统可用组件列表。返回componentName、displayName和description；componentName可作为getComponentConfig工具的入参。")
    public Resp<List<ComponentSummary>> listComponents() {
        return Resp.success(componentConfigResourceService.listComponents());
    }

    @Tool(name = "getComponentConfig", description = "根据DataRoom组件名称获取组件详细配置。参数componentName为组件名称，例如DrText；返回组件基础信息和扁平化配置字段列表。")
    public Resp<ComponentConfig> getComponentConfig(String componentName) {
        return Resp.success(componentConfigResourceService.getComponentConfig(componentName));
    }
}
```

- [ ] **Step 3: 注册 MCP 工具对象**

修改 `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/DataRoomMcpConfiguration.java`：

```java
package com.gccloud.gcpaas.core.config;

import com.gccloud.gcpaas.core.component.ComponentMcpTool;
import com.gccloud.gcpaas.core.dataset.DatasetController;
import com.gccloud.gcpaas.core.page.PageController;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataRoomMcpConfiguration {

    /**
     * 注册MCP Tool
     *
     * @param datasetController 数据集控制器
     * @param pageController 页面控制器
     * @param componentMcpTool 组件配置MCP工具
     * @return ToolCallbackProvider
     */
    @Bean
    public ToolCallbackProvider datasetTools(DatasetController datasetController, PageController pageController, ComponentMcpTool componentMcpTool) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(datasetController, pageController, componentMcpTool)
                .build();
    }
}
```

- [ ] **Step 4: 运行 MCP 工具测试**

```bash
mvn -q -pl dataRoomServer -Dtest=ComponentMcpToolTest test
```

Expected: PASS。

- [ ] **Step 5: 运行 service 和工具测试**

```bash
mvn -q -pl dataRoomServer -Dtest=ComponentConfigResourceServiceTest,ComponentMcpToolTest test
```

Expected: PASS。

- [ ] **Step 6: 提交 MCP 工具注册**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/ComponentMcpTool.java dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/DataRoomMcpConfiguration.java dataRoomServer/src/test/java/com/gccloud/gcpaas/core/component/ComponentMcpToolTest.java
git commit -m "feat(server): expose component config mcp tools"
```

---

### Task 5: 全量验证和质量检查

**Files:**
- Verify: `dataRoomFront/scripts/component-config-exporter.mjs`
- Verify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/component/service/ComponentConfigResourceService.java`
- Verify: `dataRoomServer/src/main/resources/mcp/component-configs/`

- [ ] **Step 1: 重新生成组件配置资源**

```bash
cd dataRoomFront
npm run export:component-configs
cd ..
```

Expected: PASS，输出导出的组件数量。

- [ ] **Step 2: 检查生成文件路径**

```bash
test -f dataRoomServer/src/main/resources/mcp/component-configs/index.json
test -f dataRoomServer/src/main/resources/mcp/component-configs/DrText.config.json
test -f dataRoomServer/src/main/resources/mcp/component-configs/DrBarChart.config.json
```

Expected: 三条命令均退出码为 `0`。

- [ ] **Step 3: 运行前端测试和类型检查**

```bash
cd dataRoomFront
node scripts/component-config-exporter.test.mjs
npm run type-check
cd ..
```

Expected: 两条命令均 PASS。

- [ ] **Step 4: 运行后端相关测试**

```bash
mvn -q -pl dataRoomServer -Dtest=ComponentConfigResourceServiceTest,ComponentMcpToolTest test
```

Expected: PASS。

- [ ] **Step 5: 运行 catch 块日志规范测试**

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

Expected: PASS。

- [ ] **Step 6: 检查 MCP 工具注册点**

```bash
rg -n "ComponentMcpTool|listComponents|getComponentConfig|toolObjects" dataRoomServer/src/main/java/com/gccloud/gcpaas/core
```

Expected:

- `ComponentMcpTool.java` 中存在 `@Tool(name = "listComponents"`。
- `ComponentMcpTool.java` 中存在 `@Tool(name = "getComponentConfig"`。
- `DataRoomMcpConfiguration.java` 中 `toolObjects` 包含 `componentMcpTool`。

- [ ] **Step 7: 检查无关改动未混入提交**

```bash
git status --short
git log --oneline -n 5
```

Expected:

- 与本任务相关的文件已提交。
- 用户原有的无关工作区改动仍保持原状态。
- 最近提交分别对应前端导出、后端资源读取、后端 MCP 工具注册。

- [ ] **Step 8: 最终交付说明**

交付说明包含：

- 新增 npm 命令：`cd dataRoomFront && npm run export:component-configs`
- 生成目录：`dataRoomServer/src/main/resources/mcp/component-configs/`
- MCP 工具：`listComponents`、`getComponentConfig`
- 已运行验证命令及结果。
- 如果某个命令未运行成功，写明失败命令、失败原因和当前影响。
