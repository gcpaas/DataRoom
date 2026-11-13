import ts from 'typescript'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import vm from 'node:vm'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const registerPath = 'src/dataRoom/designer/registry/PluginRegister.ts'
const componentsPath = 'src/dataRoom/components'
const chartConfigPath = 'src/dataRoom/components/type/ChartConfig.ts'
const pageConfigPath = 'src/dataRoom/page-designer/type/PageConfig.ts'
const visualScreenPageConfigPath = 'src/dataRoom/page-designer/type/VisualScreenPageConfig.ts'

const layoutDescription = 'fields.defaultValue 默认对应 visualScreen；两种页面的默认值差异见字段 description，必须按目标 pageType 选择：page 的 w/h 为网格份数，visualScreen 的 w/h 为像素，不可混用。'

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
        iframeInteractionEnabled: false,
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
    const stringMatch = part.match(/^['"]([^'"]*)['"]$/)
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
  const presetPaths = parseRegisteredPresets(projectRoot, registerSource)
  const readFactory = createFactoryReader(projectRoot)
  const parents = new Map()
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
    const configs = readFactory(installPath)
    validateFactoryConfigs(configs, componentName)
    const fields = buildPageAwareFields(chartConfigInterface, interfaceInfo, configs)
    const datasetFields = parseDatasetFields(installSource, componentName)
    const summary = {
      componentName: pluginMeta.componentName,
      displayName: pluginMeta.displayName,
      description: pluginMeta.description,
    }
    const detail = {
      ...summary,
      description: `${summary.description}。实际 ChartConfig.type 必须为 ${componentName}。${layoutDescription}`,
      fields,
      datasetFields,
    }
    parents.set(componentName, { interfaceInfo, datasetFields })
    summaries.push(summary)
    details.push(detail)
  }

  const names = new Set([...registeredComponents, ...pageConfigDetails.map((item) => item.componentName)])
  for (const presetPath of presetPaths) {
    const { metadata, configs } = readFactory(presetPath, true)
    const { id, componentType, name, desc } = metadata
    if (typeof id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(id) || names.has(id)) {
      throw new Error(`${presetPath} 中预设 id 非法或重复：${id}`)
    }
    const parent = parents.get(componentType)
    if (!parent || typeof name !== 'string' || typeof desc !== 'string') {
      throw new Error(`${presetPath} 中预设元数据无效或父组件未注册：${componentType}`)
    }
    validateFactoryConfigs(configs, componentType)
    names.add(id)
    const summary = {
      componentName: id,
      displayName: name,
      description: `${desc}。预设检索名为 ${id}，实际 ChartConfig.type 必须为 ${componentType}，不可使用预设 id。`,
    }
    summaries.push(summary)
    details.push({
      ...summary,
      description: `${summary.description}${layoutDescription}`,
      fields: buildPageAwareFields(chartConfigInterface, parent.interfaceInfo, configs),
      datasetFields: parent.datasetFields,
    })
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
  const typeAliases = await parseImportedTypeAliases(projectRoot, sourcePath, source)
  const interfaceNode = findInterface(sourceFile, 'ChartConfig')
  if (!interfaceNode) {
    throw new Error('ChartConfig.ts 中未找到 ChartConfig interface')
  }
  return {
    name: interfaceNode.name.text,
    properties: parseInterfaceMembers(interfaceNode.members, sourceFile, typeAliases),
  }
}

function registeredList(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) continue
      let value = declaration.initializer
      while (value && (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value))) {
        value = value.expression
      }
      if (!value || !ts.isArrayLiteralExpression(value)) {
        throw new Error(`PluginRegister.ts 中 ${name} 必须为手动数组字面量`)
      }
      return value.elements
    }
  }
  return []
}

function parseRegisteredComponents(source) {
  const sourceFile = ts.createSourceFile(registerPath, source, ts.ScriptTarget.Latest, true)
  const names = registeredList(sourceFile, 'pluginList').map((element) => {
    if (!ts.isNewExpression(element) || !ts.isIdentifier(element.expression) || !element.expression.text.endsWith('Plugin')) {
      throw new Error('PluginRegister.ts 中 pluginList 仅支持 new Dr...Plugin(...)')
    }
    return element.expression.text.slice(0, -'Plugin'.length)
  })
  if (names.length === 0) throw new Error('PluginRegister.ts 中未解析到组件插件')
  return names
}

function parseRegisteredPresets(projectRoot, source) {
  const sourceFile = ts.createSourceFile(registerPath, source, ts.ScriptTarget.Latest, true)
  const imports = new Map()
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && statement.importClause?.name && !statement.importClause.isTypeOnly && ts.isStringLiteral(statement.moduleSpecifier)) {
      imports.set(statement.importClause.name.text, statement.moduleSpecifier.text)
    }
  }
  return registeredList(sourceFile, 'presetList').map((element) => {
    const specifier = ts.isIdentifier(element) && imports.get(element.text)
    const resolved = specifier && (specifier.startsWith('@/') || specifier.startsWith('.')) &&
      resolveImportPath(projectRoot, path.join(projectRoot, registerPath), specifier)
    if (!resolved) {
      throw new Error(`PluginRegister.ts 中 presetList 元素必须为可解析的本地 default 导入：${element.getText(sourceFile)}`)
    }
    return resolved
  })
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
  for (const candidate of [basePath, `${basePath}.ts`, `${basePath}.js`, path.join(basePath, 'index.ts')]) {
    const relative = path.relative(projectRoot, candidate)
    if (!relative.startsWith('..') && existsSync(candidate) && statSync(candidate).isFile()) {
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

function validateFactoryConfigs(configs, componentType) {
  for (const [pageType, config] of Object.entries(configs)) {
    if (!config || config.type !== componentType || !config.props ||
        !Number.isFinite(config.w) || config.w <= 0 || !Number.isFinite(config.h) || config.h <= 0) {
      throw new Error(`${componentType} 的 ${pageType} 工厂配置无效，type 必须为父组件类型且 w/h 必须为正数`)
    }
  }
}

function buildPageAwareFields(chartConfigInterface, propsInterface, configs) {
  const fieldsByPageType = Object.fromEntries(Object.entries(configs).map(([pageType, config]) => [
    pageType,
    buildComponentConfigFields(chartConfigInterface, propsInterface, { chartConfig: config, props: config.props }),
  ]))
  return fieldsByPageType.visualScreen.map((field, index) => {
    const pageField = fieldsByPageType.page[index]
    if (field.field === 'type') {
      return { ...field, description: `${field.description}；实际 ChartConfig.type 必须为 ${field.defaultValue}，不可使用预设 id。` }
    }
    if (field.field === 'w' || field.field === 'h' ||
        JSON.stringify(field.defaultValue) !== JSON.stringify(pageField.defaultValue)) {
      return {
        ...field,
        description: `${field.description}；默认值须按 pageType 选择，page=${JSON.stringify(pageField.defaultValue) ?? '未设置'}${['w', 'h'].includes(field.field) ? '（网格份数）' : ''}，visualScreen=${JSON.stringify(field.defaultValue) ?? '未设置'}${['w', 'h'].includes(field.field) ? '（像素）' : ''}。`,
      }
    }
    return field
  })
}

// 仅用于可信仓库源码的构建导出；node:vm 不是恶意代码安全边界。
// 不加载 Vue 视图、浏览器环境或任意 npm/Node 模块，未知依赖直接报错。
function createFactoryReader(projectRoot) {
  projectRoot = realpathSync(projectRoot)
  const sourceRoot = realpathSync(path.join(projectRoot, 'src'))
  const compiled = new Map()
  return (entryPath, isPreset = false) => {
    const context = vm.createContext(Object.create(null), {
      codeGeneration: { strings: false, wasm: false },
      microtaskMode: 'afterEvaluate',
    })
    const run = (code, filename = entryPath) => new vm.Script(code, { filename }).runInContext(context, { timeout: 1000 })
    const stubs = run(`({
      vue: { defineAsyncComponent: () => ({}) },
      uuid: { v4: () => 'export-only-id' }
    })`)
    const modules = new Map()
    const load = (filePath) => {
      const realPath = realpathSync(filePath)
      const relative = path.relative(sourceRoot, realPath)
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`导出工厂禁止加载 src 外文件：${filePath}`)
      }
      if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(realPath)) {
        return `@/${relative.split(path.sep).join('/')}`
      }
      if (!/\.(ts|js)$/.test(realPath)) {
        throw new Error(`导出工厂不支持模块：${filePath}`)
      }
      if (modules.has(realPath)) return modules.get(realPath).exports
      if (!compiled.has(realPath)) {
        const source = readTextSync(realPath)
        compiled.set(realPath, ts.transpileModule(source, {
          fileName: realPath,
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
        }).outputText)
      }
      const module = run('({ exports: {} })')
      modules.set(realPath, module)
      const requireModule = (specifier) => {
        if (Object.hasOwn(stubs, specifier)) return stubs[specifier]
        if (typeof specifier !== 'string' || (!specifier.startsWith('.') && !specifier.startsWith('@/'))) {
          throw new Error(`导出工厂禁止加载外部模块：${specifier}（${realPath}）`)
        }
        const dependency = resolveImportPath(projectRoot, realPath, specifier)
        if (!dependency) throw new Error(`导出工厂无法解析依赖：${specifier}（${realPath}）`)
        return load(dependency)
      }
      const previous = context.__moduleArgs
      context.__moduleArgs = [module.exports, module, requireModule]
      try {
        run(`(function(exports, module, require) {\n${compiled.get(realPath)}\n})(...__moduleArgs)`, realPath)
      } finally {
        context.__moduleArgs = previous
      }
      return module.exports
    }
    try {
      context.__entry = load(entryPath)
      const result = JSON.parse(run(`JSON.stringify((() => {
        const entry = ${isPreset ? '__entry.default' : '__entry'};
        if (!entry || typeof entry.getInstance !== 'function') throw new Error('未找到 getInstance 工厂');
        const configs = {};
        for (const pageType of ['page', 'visualScreen']) {
          const config = entry.getInstance(pageType);
          if (!config || typeof config !== 'object' || typeof config.then === 'function') throw new Error('工厂必须同步返回配置');
          const { id, i, ...defaults } = config;
          configs[pageType] = JSON.parse(JSON.stringify(defaults));
        }
        return {
          configs,
          metadata: ${isPreset ? '{ id: entry.id, componentType: entry.componentType, name: entry.name, desc: entry.desc, tags: entry.tags, thumbnail: entry.thumbnail }' : 'null'}
        };
      })())`))
      return isPreset ? result : result.configs
    } catch (error) {
      throw new Error(`${entryPath} 工厂导出失败：${error.message}`, { cause: error })
    }
  }
}

function parseDatasetFields(source, componentName) {
  const sourceFile = ts.createSourceFile(`${componentName}.datasetFields.ts`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let datasetFieldsNode
  const visit = (node) => {
    if (datasetFieldsNode) {
      return
    }
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === 'datasetFields' && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
          datasetFieldsNode = declaration.initializer
          return
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (!datasetFieldsNode) {
    throw new Error(`${componentName}/install.ts 中未找到 datasetFields 定义`)
  }
  return datasetFieldsNode.elements
    .filter((element) => ts.isObjectLiteralExpression(element))
    .map((element) => {
      const value = objectLiteralToValue(element, sourceFile)
      return {
        name: value.name,
        desc: value.desc,
        required: value.required === true,
        multiple: value.multiple === true,
      }
    })
    .filter((field) => typeof field.name === 'string' && field.name.length > 0)
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
