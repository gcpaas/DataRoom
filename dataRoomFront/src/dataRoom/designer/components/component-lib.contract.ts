import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { getActiveComponentGroup, groupComponents } from './component-lib.ts'

const categories = [
  { tag: 'line', name: '折线图' },
  { tag: 'bar', name: '柱状图' },
  { tag: 'empty', name: '空分类' },
]
const plugin = (type: string, tags: string[], desc = '') => ({ type, name: type, desc, thumbnail: '', tags })

test('分类及组内顺序沿用注册顺序，隐藏空分类', () => {
  const groups = groupComponents([plugin('B', ['bar']), plugin('L2', ['line']), plugin('L1', ['line'])], categories, '')
  assert.deepEqual(groups.map(({ tag }) => tag), ['line', 'bar'])
  assert.deepEqual(groups[0]!.plugins.map(({ type }) => type), ['L2', 'L1'])
})

test('按名称和描述搜索，忽略首尾空格和大小写，过滤空分组', () => {
  const plugins = [plugin('DrLine', ['line']), plugin('柱状图', ['bar'], 'BAR、柱形图')]
  assert.equal(groupComponents(plugins, categories, '  drLINE ')[0]!.plugins[0]!.type, 'DrLine')
  assert.equal(groupComponents(plugins, categories, ' bar ')[0]!.tag, 'bar')
  assert.deepEqual(groupComponents(plugins, categories, '不存在'), [])
  assert.equal(groupComponents(plugins, categories, '  ').length, 2)
})

test('未知标签和无标签进入其他分类，有有效标签的组件不会重复进入其他', () => {
  const groups = groupComponents([plugin('A', []), plugin('B', ['unknown']), plugin('C', ['line', 'unknown'])], categories, '')
  assert.deepEqual(groups.map(({ tag }) => tag), ['line', '__other__'])
  assert.deepEqual(groups[1]!.plugins.map(({ type }) => type), ['A', 'B'])
})

test('多标签组件在各分类保留相同唯一标识', () => {
  const groups = groupComponents([plugin('Shared', ['line', 'bar', 'bar'])], categories, '')
  assert.deepEqual(groups.map(({ plugins }) => plugins.map(({ type }) => type)), [['Shared'], ['Shared']])
})

const positions = [{ tag: 'line', top: 0 }, { tag: 'bar', top: 200 }, { tag: 'last', top: 650 }]

test('滚动按照分组顶部及16px阈值联动', () => {
  assert.equal(getActiveComponentGroup(positions, 0, 300, 900), 'line')
  assert.equal(getActiveComponentGroup(positions, 183, 300, 900), 'line')
  assert.equal(getActiveComponentGroup(positions, 184, 300, 900), 'bar')
  assert.equal(getActiveComponentGroup(positions, 400, 300, 900), 'bar')
})

test('滚动到底激活不能到达顶部的短末组', () => {
  assert.equal(getActiveComponentGroup(positions, 598, 300, 900), 'last')
})

test('尾部补足定位空间后，点击倒数第二组不会误选末组', () => {
  const groups = [{ tag: 'first', top: 0 }, { tag: 'middle', top: 220 }, { tag: 'last', top: 440 }]
  const viewportHeight = 500
  const contentHeight = 660
  const endSpace = Math.max(0, viewportHeight - 220)
  const scrollHeight = contentHeight + endSpace
  const actualScrollTop = Math.min(220, scrollHeight - viewportHeight)
  assert.equal(getActiveComponentGroup(groups, actualScrollTop, viewportHeight, scrollHeight), 'middle')
  assert.equal(getActiveComponentGroup(groups, 440, viewportHeight, scrollHeight), 'last')
})

test('空结果、无滚动条、搜索后只剩一个分组', () => {
  assert.equal(getActiveComponentGroup([], 0, 300, 300), '')
  assert.equal(getActiveComponentGroup(positions.slice(0, 2), 0, 300, 300), 'line')
  assert.equal(getActiveComponentGroup([{ tag: 'bar', top: 0 }], 0, 300, 180), 'bar')
})

test('两个设计器共用组件库，保留按唯一标识多选、按选中顺序插入与历史提交', () => {
  for (const path of ['../../page-designer/PageDesigner.vue', '../../visual-screen-designer/VisualScreenDesigner.vue']) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    assert.match(source, /designer\/components\/ComponentLib\.vue/)
    assert.match(source, /<ComponentLib\s/)
  }
  const source = readFileSync(new URL('./ComponentLib.vue', import.meta.url), 'utf8')
  assert.match(source, /selectedPluginTypes\.value\.indexOf\(type\)/)
  assert.match(source, /selectedPluginTypes\.value\.forEach\(\(type\) => \{\s*const chart = canvasInst\.addChart\(type\)\s*canvasInst\.commitChartAdd\(chart\)/)
  assert.match(source, /:key="plugin\.type"/)
  assert.match(source, /@scroll="syncActiveCategory"/)
  assert.doesNotMatch(source, /selectedPluginTypes\.value\s*=/)
})

test('卡片名称与类型同行，描述单行省略并使用次级文本色', () => {
  const source = readFileSync(new URL('./ComponentLib.vue', import.meta.url), 'utf8')
  assert.match(source, /class="card-heading">\s*<span class="card-name"[^>]*>\{\{ plugin.name \}\}<\/span>\s*<span class="card-type" :title="plugin.type">\{\{ plugin.type \}\}<\/span>\s*<\/span>\s*<span class="card-desc" :title="plugin.desc">\{\{ plugin.desc \}\}<\/span>/)
  assert.match(source, /& \.card-type,\s*& \.card-desc\s*\{[^}]*color: var\(--el-text-color-secondary\);[^}]*overflow: hidden;[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/)
  assert.match(source, /& \.card-type\s*\{[^}]*max-width: 50%;[^}]*margin-left: auto;[^}]*text-align: right;/)
  assert.match(source, /& \.card-footer\s*\{[^}]*flex-direction: column;/)
})

test('左右区域使用Element Plus滚动条及公开API保持分类联动', () => {
  const source = readFileSync(new URL('./ComponentLib.vue', import.meta.url), 'utf8')
  assert.equal((source.match(/<el-scrollbar\b/g) ?? []).length, 2)
  assert.match(source, /ref="categoryScrollbar"/)
  assert.match(source, /ref="componentScrollbar"/)
  assert.match(source, /componentScrollbar\.value\?\.wrapRef/)
  assert.match(source, /categoryScrollbar\.value\?\.setScrollTop/)
  assert.match(source, /componentScrollbar\.value\?\.scrollTo/)
  assert.match(source, /componentScrollbar\.value\?\.update\(\)/)
  assert.doesNotMatch(source, /overflow-y:\s*auto/)
})

test('卡片自适应列数、图片比例和局部放大，不覆盖Element Plus内部样式', () => {
  const source = readFileSync(new URL('./ComponentLib.vue', import.meta.url), 'utf8')
  assert.match(source, /repeat\(auto-fill, minmax\(min\(240px, 100%\), 1fr\)\)/)
  assert.match(source, /aspect-ratio:\s*4\s*\/\s*3/)
  assert.match(source, /& \.thumbnail-image\s*\{\s*transform: scale\(1\.08\)/)
  assert.doesNotMatch(source, /transform:\s*scale\(1\.02\)/)
  assert.match(source, /prefers-reduced-motion:\s*reduce/)
  assert.doesNotMatch(source, /:deep\(|::v-deep|!important|--dr-/)
})
