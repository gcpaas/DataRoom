import ts from 'typescript'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const registerPath = 'src/dataroom-packages/_components/PluginRegister.ts'
const componentsPath = 'src/dataroom-packages/components'
const chartConfigPath = 'src/dataroom-packages/components/type/ChartConfig.ts'
const pageConfigPath = 'src/dataroom-packages/PageDesigner/type/PageConfig.ts'
const visualScreenPageConfigPath = 'src/dataroom-packages/PageDesigner/type/VisualScreenPageConfig.ts'

const baseChartConfigDefaults = {
  title: '未命名组件',
  w: 150,
  h: 100,
  x: 100,
  y: 100,
  z: 100,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  behaviors: {},
  dataset: {
    code: '',
    fields: {},
    script: '',
    params: {},
  },
}

const pageConfigSchemaDefinitions = [
  {
    componentName: 'PageConfig',
    displayName: '页面配置',
    description: '网格化页面设计器页面配置。chartList数组元素为组件配置，需要结合具体组件配置文件填写。',
    sourcePath: pageConfigPath,
    interfaceName: 'PageConfig',
    defaults: {
      pageType: 'page',
      basicConfig: {
        background: {
          fill: 'color',
          color: '',
          url: '',
          opacity: 1,
          repeat: 'no-repeat',
        },
        timers: [],
      },
      globalVariableList: [],
      chartList: [],
    },
  },
  {
    componentName: 'VisualScreenPageConfig',
    displayName: '大屏配置',
    description: '像素级自由布局大屏设计器页面配置。chartList数组元素为组件配置，需要结合具体组件配置文件填写。',
    sourcePath: visualScreenPageConfigPath,
    interfaceName: 'VisualScreenPageConfig',
    defaults: {
      pageType: 'visualScreen',
      basicConfig: {
        background: {
          fill: 'color',
          color: '#0d1e42',
          url: '',
          opacity: 100,
          repeat: 'no-repeat',
        },
        size: {
          width: 1920,
          height: 1080,
          zoom: 'contain',
        },
        zoom: {
          mode: 'best',
          value: 100,
          visiable: true,
        },
        ruler: {
          visible: true,
          guidesVisible: true,
          guidesLocked: false,
          verticalGuides: [],
          horizontalGuides: [],
        },
        timers: [],
      },
      globalVariableList: [],
      chartList: [],
    },
  },
]

export function parseLiteralOptions(typeText) {
  const parts = typeText
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
  const options = []
  for (const part of parts) {
    const stringMatch = part.match(/^['"]([^'"]+)['"]$/)
    if (stringMatch) {
      options.push(stringMatch[1])
      continue
    }
    if (part === 'false') {
      options.push(false)
      continue
    }
    if (part === 'true') {
      options.push(true)
      continue
    }
    if (/^-?\d+(\.\d+)?$/.test(part)) {
      options.push(Number(part))
      continue
    }
    if (part === 'null' || part === 'undefined') {
      continue
    }
    return []
  }
  return options
}

export function resolveFieldType(typeText) {
  const normalized = typeText.replace(/\s+/g, ' ').trim()
  const options = parseLiteralOptions(normalized)
  if (options.length > 0) {
    return { type: 'enum', options }
  }
  if (normalized.startsWith('[') || normalized.endsWith('[]') || normalized.startsWith('Array<')) {
    return { type: 'array' }
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
      description: property.description || property.name,
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

export async function exportComponentConfigs({ projectRoot, outputDir }) {
  const registerSource = await readText(path.join(projectRoot, registerPath))
  const registeredComponents = parseRegisteredComponents(registerSource)
  const chartConfigInterface = await parseChartConfigInterface(projectRoot)
  const pageConfigDetails = buildPageConfigDetails(projectRoot)
  const summaries = []
  const details = []

  for (const componentName of registeredComponents) {
    const componentDir = path.join(projectRoot, componentsPath, componentName)
    const pluginSource = await readText(path.join(componentDir, 'plugin.ts'))
    const installPath = path.join(componentDir, 'install.ts')
    const installSource = await readText(installPath)
    const pluginMeta = parsePluginMetadata(pluginSource, componentName)
    const typeAliases = await parseImportedTypeAliases(projectRoot, installPath, installSource)
    const interfaceInfo = parsePropsInterface(installSource, componentName, typeAliases)
    const defaults = parseCreateChartConfigDefaults(installSource, componentName)
    const fields = buildComponentConfigFields(chartConfigInterface, interfaceInfo, defaults)
    const summary = {
      componentName: pluginMeta.componentName,
      displayName: pluginMeta.displayName,
      description: pluginMeta.description,
    }
    const detail = { ...summary, fields }
    summaries.push(summary)
    details.push(detail)
  }

  await mkdir(outputDir, { recursive: true })
  await cleanOutputDir(outputDir)
  await writeJson(path.join(outputDir, 'index.json'), summaries)
  for (const detail of [...details, ...pageConfigDetails]) {
    await writeJson(path.join(outputDir, `${detail.componentName}.config.json`), detail)
  }
  return { components: summaries, details, pageConfigs: pageConfigDetails }
}

function buildComponentConfigFields(chartConfigInterface, propsInterface, defaults) {
  const baseInterface = {
    ...chartConfigInterface,
    properties: chartConfigInterface.properties.filter((property) => property.name !== 'props'),
  }
  return [
    ...flattenConfigFields(baseInterface, defaults.chartConfig),
    ...flattenConfigFields(propsInterface, defaults.props, 'props'),
  ]
}

function buildPageConfigDetails(projectRoot) {
  return pageConfigSchemaDefinitions.map((definition) => {
    const interfaceInfo = parseInterfaceFromFile(projectRoot, definition.sourcePath, definition.interfaceName)
    const fields = flattenConfigFields(interfaceInfo, definition.defaults).map((field) => {
      if (field.field === 'chartList') {
        return {
          ...field,
          description: `${field.description}，数组元素为ChartConfig结构；组件个性化props字段请通过getComponentConfig(componentName)查询对应组件配置。`,
        }
      }
      if (field.field === 'globalVariableList') {
        return {
          ...field,
          description: `${field.description}，数组元素为GlobalVariable结构。`,
        }
      }
      if (field.field === 'basicConfig.timers') {
        return {
          ...field,
          description: `${field.description}，数组元素为PageTimer结构。`,
        }
      }
      return field
    })
    return {
      componentName: definition.componentName,
      displayName: definition.displayName,
      description: definition.description,
      fields,
    }
  })
}

async function cleanOutputDir(outputDir) {
  const entries = await readdir(outputDir)
  const staleFiles = entries.filter((entry) => entry === 'index.json' || entry.endsWith('.config.json'))
  await Promise.all(staleFiles.map((entry) => unlink(path.join(outputDir, entry))))
}

function readDefaultValue(defaults, key) {
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) {
    return undefined
  }
  return defaults[key]
}

function parseInterfaceFromFile(projectRoot, relativeSourcePath, interfaceName, seen = new Set()) {
  const sourcePath = path.join(projectRoot, relativeSourcePath)
  return parseInterfaceFromPath(projectRoot, sourcePath, interfaceName, seen)
}

function parseInterfaceFromPath(projectRoot, sourcePath, interfaceName, seen = new Set()) {
  const interfaceKey = `${sourcePath}:${interfaceName}`
  if (seen.has(interfaceKey)) {
    return null
  }
  seen.add(interfaceKey)
  const source = readTextSync(sourcePath)
  const sourceFile = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const interfaceNode = findInterface(sourceFile, interfaceName)
  if (!interfaceNode) {
    throw new Error(`${sourcePath} 中未找到 ${interfaceName} interface`)
  }
  const typeAliases = parseLocalTypeAliases(sourceFile)
  const importMap = parseNamedImportMap(projectRoot, sourcePath, sourceFile)
  const interfaceResolver = (typeName) => {
    const localInterface = findInterface(sourceFile, typeName)
    if (localInterface) {
      const localKey = `${sourcePath}:${typeName}`
      if (seen.has(localKey)) {
        return null
      }
      seen.add(localKey)
      return {
        name: localInterface.name.text,
        properties: parseInterfaceMembers(localInterface.members, sourceFile, typeAliases, interfaceResolver),
      }
    }
    const imported = importMap.get(typeName)
    if (!imported) {
      return null
    }
    return parseInterfaceFromPath(projectRoot, imported.sourcePath, imported.importedName, seen)
  }
  return {
    name: interfaceNode.name.text,
    properties: parseInterfaceMembers(interfaceNode.members, sourceFile, typeAliases, interfaceResolver),
  }
}

function parseNamedImportMap(projectRoot, fromFile, sourceFile) {
  const imports = new Map()
  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !node.importClause || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
      return
    }
    const bindings = node.importClause.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) {
      return
    }
    const importPath = resolveImportPath(projectRoot, fromFile, node.moduleSpecifier.text)
    if (!importPath) {
      return
    }
    for (const element of bindings.elements) {
      imports.set(element.name.text, {
        sourcePath: importPath,
        importedName: element.propertyName?.text ?? element.name.text,
      })
    }
  })
  return imports
}

function readTextSync(filePath) {
  return readFileSync(filePath, 'utf8')
}

async function parseChartConfigInterface(projectRoot) {
  const sourcePath = path.join(projectRoot, chartConfigPath)
  const source = await readText(sourcePath)
  const sourceFile = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const interfaceNode = findInterface(sourceFile, 'ChartConfig')
  if (!interfaceNode) {
    throw new Error('ChartConfig.ts 中未找到 ChartConfig interface')
  }
  return {
    name: interfaceNode.name.text,
    properties: parseInterfaceMembers(interfaceNode.members, sourceFile, new Map()),
  }
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
    description: superCall[3],
  }
}

async function parseImportedTypeAliases(projectRoot, installPath, source) {
  const sourceFile = ts.createSourceFile(installPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const aliases = parseLocalTypeAliases(sourceFile)
  const importJobs = []
  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !node.importClause || !node.moduleSpecifier) {
      return
    }
    if (!ts.isStringLiteral(node.moduleSpecifier)) {
      return
    }
    const moduleText = node.moduleSpecifier.text
    if (!moduleText.startsWith('.') && !moduleText.startsWith('@/')) {
      return
    }
    const bindings = node.importClause.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) {
      return
    }
    const importedNames = bindings.elements.map((element) => element.name.text)
    importJobs.push(readTypeAliasesFromImport(projectRoot, installPath, moduleText, importedNames))
  })
  const importedAliases = await Promise.all(importJobs)
  for (const aliasGroup of importedAliases) {
    for (const [name, typeText] of aliasGroup) {
      aliases.set(name, typeText)
    }
  }
  return aliases
}

function parseLocalTypeAliases(sourceFile) {
  const aliases = new Map()
  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      aliases.set(node.name.text, node.type.getText(sourceFile))
    }
  })
  return aliases
}

async function readTypeAliasesFromImport(projectRoot, fromFile, moduleText, importedNames) {
  const aliases = new Map()
  const importPath = resolveImportPath(projectRoot, fromFile, moduleText)
  if (!importPath) {
    return aliases
  }
  let source
  try {
    source = await readText(importPath)
  } catch {
    return aliases
  }
  const sourceFile = ts.createSourceFile(importPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  sourceFile.forEachChild((node) => {
    if (!ts.isTypeAliasDeclaration(node)) {
      return
    }
    const aliasName = node.name.text
    if (importedNames.includes(aliasName)) {
      aliases.set(aliasName, node.type.getText(sourceFile))
    }
  })
  return aliases
}

function resolveImportPath(projectRoot, fromFile, moduleText) {
  const basePath = moduleText.startsWith('@/')
    ? path.resolve(projectRoot, 'src', moduleText.slice(2))
    : path.resolve(path.dirname(fromFile), moduleText)
  for (const candidate of [basePath, `${basePath}.ts`]) {
    const relative = path.relative(projectRoot, candidate)
    if (!relative.startsWith('..') && existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

function parsePropsInterface(source, componentName, typeAliases) {
  const sourceFile = ts.createSourceFile(`${componentName}.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const interfaceNode = findPropsInterface(sourceFile, componentName)
  if (!interfaceNode) {
    throw new Error(`${componentName}/install.ts 中未找到 props interface`)
  }
  return {
    name: interfaceNode.name.text,
    properties: parseInterfaceMembers(interfaceNode.members, sourceFile, typeAliases),
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

function findInterface(sourceFile, interfaceName) {
  let found
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      found = node
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

function parseInterfaceMembers(members, sourceFile, typeAliases, interfaceResolver = () => null) {
  const properties = []
  for (const member of members) {
    if (!ts.isPropertySignature(member) || !member.type || !member.name) {
      continue
    }
    const name = member.name.getText(sourceFile).replaceAll('"', '').replaceAll("'", '')
    const rawTypeText = resolveTypeText(member.type.getText(sourceFile), typeAliases)
    const property = {
      name,
      typeText: rawTypeText,
      description: readDescription(member, sourceFile),
    }
    if (ts.isTypeLiteralNode(member.type)) {
      const childProperties = parseInterfaceMembers(member.type.members, sourceFile, typeAliases, interfaceResolver)
      if (childProperties.length > 0) {
        property.properties = childProperties
      } else {
        property.typeText = 'object'
      }
    } else {
      const referencedInterface = resolveReferencedInterface(member.type, sourceFile, interfaceResolver)
      if (referencedInterface?.properties?.length) {
        property.properties = referencedInterface.properties
      }
    }
    properties.push(property)
  }
  return properties
}

function resolveReferencedInterface(typeNode, sourceFile, interfaceResolver) {
  if (!ts.isTypeReferenceNode(typeNode)) {
    return null
  }
  const typeName = typeNode.typeName.getText(sourceFile)
  return interfaceResolver(typeName)
}

function resolveTypeText(typeText, typeAliases, seen = new Set()) {
  if (seen.has(typeText)) {
    return typeText
  }
  const aliasText = typeAliases.get(typeText)
  if (!aliasText) {
    return typeText
  }
  seen.add(typeText)
  return resolveTypeText(aliasText, typeAliases, seen)
}

function readDescription(node, sourceFile) {
  const docs = ts.getJSDocCommentsAndTags(node)
  for (const doc of docs) {
    if (ts.isJSDoc(doc) && doc.comment) {
      return String(doc.comment)
    }
  }
  const fullText = sourceFile.getFullText()
  const comments = ts.getLeadingCommentRanges(fullText, node.pos) ?? []
  if (comments.length > 0) {
    return normalizeCommentText(fullText.slice(comments[comments.length - 1].pos, comments[comments.length - 1].end))
  }
  return ''
}

function normalizeCommentText(commentText) {
  return commentText
    .split('\n')
    .map((line) => line.trim().replace(/^\/\*\*?/, '').replace(/\*\/$/, '').replace(/^\*/, '').replace(/^\/\//, '').trim())
    .filter(Boolean)
    .join('\n')
}

function parseCreateChartConfigDefaults(source, componentName) {
  const sourceFile = ts.createSourceFile(`${componentName}.defaults.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const call = findCreateChartConfigCall(sourceFile)
  if (!call) {
    throw new Error(`${componentName}/install.ts 中未找到 createChartConfig 调用`)
  }
  const propsArg = call.arguments[1]
  if (!propsArg || !ts.isObjectLiteralExpression(propsArg)) {
    throw new Error(`${componentName}/install.ts 中 props 默认配置不是对象字面量`)
  }
  const componentType = readComponentTypeArgument(call, sourceFile, componentName)
  const overrides = readOverridesArgument(call, sourceFile)
  return {
    chartConfig: {
      ...baseChartConfigDefaults,
      type: componentType,
      ...overrides,
    },
    props: objectLiteralToValue(propsArg, sourceFile),
  }
}

function readComponentTypeArgument(call, sourceFile, componentName) {
  const typeArg = call.arguments[0]
  if (typeArg && (ts.isStringLiteral(typeArg) || ts.isNoSubstitutionTemplateLiteral(typeArg))) {
    return typeArg.text
  }
  return componentName
}

function readOverridesArgument(call, sourceFile) {
  const overridesArg = call.arguments[2]
  if (!overridesArg || !ts.isObjectLiteralExpression(overridesArg)) {
    return {}
  }
  return objectLiteralToValue(overridesArg, sourceFile)
}

function findCreateChartConfigCall(sourceFile) {
  let found
  const visit = (node) => {
    if (found) {
      return
    }
    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'createChartConfig') {
      found = node
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
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

async function readText(filePath) {
  return readFile(filePath, 'utf8')
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
