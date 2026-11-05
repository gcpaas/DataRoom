import assert from 'node:assert/strict'
import test from 'node:test'
import type { JSONContent } from '@tiptap/core'
import { isSafeRichTextLink, resolveRichTextContent } from './rich-text-template.ts'

function doc(...content: JSONContent[]): JSONContent {
  return { type: 'doc', content: [{ type: 'paragraph', content }] }
}

function text(value: string, marks?: JSONContent['marks']): JSONContent {
  return marks ? { type: 'text', text: value, marks } : { type: 'text', text: value }
}

function plainText(content: JSONContent): string {
  return content.text ?? content.content?.map(plainText).join('') ?? ''
}

function freezeDeep(value: unknown) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep)
    Object.freeze(value)
  }
}

test('对象自有字段：保留 0/false，空值为空文本，缺失字段保留', () => {
  const input = doc(text('#{name}|#{zero}|#{flag}|#{nil}|#{empty}|#{undef}|#{missing}'))
  const data = { name: '标题', zero: 0, flag: false, nil: null, empty: '', undef: undefined }
  assert.equal(plainText(resolveRichTextContent(input, data)), '标题|0|false||||#{missing}')
})

test('数组仅使用第一行，不回退到后续行', () => {
  const input = doc(text('#{value}'))
  assert.equal(plainText(resolveRichTextContent(input, [{ value: 0 }, { value: 2 }])), '0')
  for (const data of [[], [null, { value: 2 }], [{}, { value: 2 }]]) {
    assert.deepEqual(resolveRichTextContent(input, data), input)
  }
})

test('无效数据返回独立副本', () => {
  const input = doc(text('#{value}'))
  for (const data of [null, undefined, 0, false, 'value', [1], [[]]]) {
    const result = resolveRichTextContent(input, data)
    assert.deepEqual(result, input)
    assert.notStrictEqual(result, input)
    assert.notStrictEqual(result.content, input.content)
  }
})

test('不读取原型字段；字段名按完整 key 匹配，不解析路径', () => {
  const data = Object.assign(Object.create({ inherited: '不可使用' }), {
    'a.b': '完整字段',
    a: { b: '嵌套字段' },
    '带 空格': '中文字段',
  })
  const input = doc(text('#{inherited}|#{toString}|#{a.b}|#{带 空格}'))
  assert.equal(
    plainText(resolveRichTextContent(input, data)),
    '#{inherited}|#{toString}|完整字段|中文字段',
  )
  const own = JSON.parse('{"__proto__":"自有字段","constructor":"自有构造字段"}')
  assert.equal(
    plainText(resolveRichTextContent(doc(text('#{__proto__}|#{constructor}')), own)),
    '自有字段|自有构造字段',
  )
})

test('跨不同 marks 节点匹配，注入值继承 # 的 marks，前后原文保持 marks', () => {
  const bold = [{ type: 'bold' }]
  const italic = [{ type: 'italic' }]
  const link = [{ type: 'link', attrs: { href: '/#{url}', target: '_blank' } }]
  const input = doc(text('前#', bold), text('{na', italic), text('me}后', link))
  assert.deepEqual(
    resolveRichTextContent(input, { name: '张三', url: '不得替换' }),
    doc(text('前', bold), text('张三', bold), text('后', link)),
  )
})

test('起始字符无 marks 时，不继承后续节点的 marks', () => {
  const input = doc(text('#'), text('{value}', [{ type: 'bold' }]))
  assert.deepEqual(resolveRichTextContent(input, { value: '普通文本' }), doc(text('普通文本')))
})

test('多个占位符、缺失占位符与跨节点替换可混合使用', () => {
  const bold = [{ type: 'bold' }]
  const input = doc(text('#{missing}#{a}#', bold), text('{b}#{a}!'))
  assert.deepEqual(
    resolveRichTextContent(input, { a: 'A', b: 'B' }),
    doc(text('#{missing}', bold), text('A', bold), text('B', bold), text('A'), text('!')),
  )
})

test('空值删除整个跨节点占位符，不生成空 text 节点', () => {
  const input = doc(text('#{'), text('value}'))
  assert.deepEqual(resolveRichTextContent(input, { value: null }), doc())
  assert.deepEqual(resolveRichTextContent(doc(text('前#{value}后')), { value: '' }), doc(text('前'), text('后')))
})

test('不跨段落、hardBreak 或内联原子节点匹配', () => {
  const input: JSONContent = {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [text('#{')] },
      { type: 'paragraph', content: [text('value}')] },
      { type: 'paragraph', content: [text('#{'), { type: 'hardBreak' }, text('value}')] },
      { type: 'paragraph', content: [text('#{'), { type: 'image', attrs: { src: '/image' } }, text('value}')] },
    ],
  }
  assert.deepEqual(resolveRichTextContent(input, { value: '不能跨界' }), input)
})

test('嵌套文档内的每个段落独立处理，hardBreak 两侧的完整占位符正常替换', () => {
  const input: JSONContent = {
    type: 'doc',
    content: [{
      type: 'blockquote',
      content: [{ type: 'paragraph', content: [text('#{a}'), { type: 'hardBreak' }, text('#{b}')] }],
    }],
  }
  const result = resolveRichTextContent(input, { a: 'A', b: 'B' })
  assert.deepEqual(result.content?.[0]?.content?.[0]?.content, [text('A'), { type: 'hardBreak' }, text('B')])
})

test('注入值只作为文本，不解析 HTML，也不递归替换', () => {
  const value = '<img src=x onerror=alert(1)>#{other}&nbsp;'
  assert.deepEqual(
    resolveRichTextContent(doc(text('#{value} #{other}')), { value, other: '完成' }),
    doc(text(value), text(' '), text('完成')),
  )
})

test('文档、marks、attrs 和数据不变，所有嵌套对象与输入隔离', () => {
  const input = doc(text('#{name}', [{ type: 'link', attrs: { href: '/#{name}', nested: { a: [1] } } }]))
  input.attrs = { title: '#{name}', options: { values: ['原始'] } }
  input.content![0]!.attrs = { class: '#{name}' }
  const data = { name: '替换值', unused: { list: [1, 2] } }
  const before = structuredClone(input)
  const dataBefore = structuredClone(data)
  freezeDeep(input)
  freezeDeep(data)
  const result = resolveRichTextContent(input, data)
  assert.deepEqual(input, before)
  assert.deepEqual(data, dataBefore)
  assert.deepEqual(result.attrs, input.attrs)
  assert.deepEqual(result.content![0]!.attrs, input.content![0]!.attrs)
  const outputMarks = result.content![0]!.content![0]!.marks!
  const inputMarks = input.content![0]!.content![0]!.marks!
  assert.deepEqual(outputMarks, inputMarks)
  assert.notStrictEqual(outputMarks, inputMarks)
  assert.notStrictEqual(outputMarks[0]!.attrs, inputMarks[0]!.attrs)
  outputMarks[0]!.attrs!.nested.a.push(2)
  result.attrs!.options.values.push('新增')
  assert.deepEqual(input, before)
})

test('允许明确协议、站内绝对路径和锚点', () => {
  for (const url of [
    'http://example.com', 'https://example.com/path?q=1#part', 'HTTPS://example.com',
    'mailto:user@example.com', 'tel:+8613800000000', '/', '/path?q=1#part', '#', '#section',
    ' https://example.com ',
  ]) {
    assert.equal(isSafeRichTextLink(url), true, url)
  }
})

test('拒绝危险协议、协议相对地址、反斜杠和未允许的链接', () => {
  for (const url of [
    'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<b>x</b>', 'vbscript:msgbox(1)',
    'ftp://example.com', '//example.com', '/\\example.com', '\\example.com', 'example.com',
    './path', '../path', '', '   ', 'https:', 'http://', 'mailto:', 'tel:',
  ]) {
    assert.equal(isSafeRichTextLink(url), false, url)
  }
})

test('任意位置的 C0、DEL、C1 控制字符均拒绝，不能通过 trim 绕过', () => {
  for (let code = 0; code <= 0x9f; code++) {
    if (code > 0x1f && code < 0x7f) continue
    const control = String.fromCharCode(code)
    for (const url of [`${control}https://example.com`, `https://exa${control}mple.com`, `/path${control}`, `#${control}part`]) {
      assert.equal(isSafeRichTextLink(url), false, JSON.stringify(url))
    }
  }
})
