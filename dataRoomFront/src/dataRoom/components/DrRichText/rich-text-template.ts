import type { JSONContent } from '@tiptap/core'

function cloneJson<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneJson(item)) as T
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJson(item)]),
    ) as T
  }
  return value
}

export function resolveRichTextContent(content: JSONContent, data: unknown): JSONContent {
  const result = cloneJson(content)
  const row: unknown = Array.isArray(data) ? data[0] : data
  if (row === null || typeof row !== 'object' || Array.isArray(row)) return result

  function resolveTextRun(nodes: JSONContent[]): JSONContent[] {
    let length = 0
    const spans = nodes.map((node) => {
      const text = node.text ?? ''
      const start = length
      length += text.length
      return { node, text, start, end: length }
    })
    const text = spans.map((span) => span.text).join('')
    const output: JSONContent[] = []
    let cursor = 0
    let replaced = false

    function appendOriginal(start: number, end: number) {
      for (const span of spans) {
        const from = Math.max(start, span.start)
        const to = Math.min(end, span.end)
        if (from < to) {
          output.push({ ...span.node, text: span.text.slice(from - span.start, to - span.start) })
        }
      }
    }

    // 只扫描原文，注入值中的占位符不会再次参与替换。
    for (const match of text.matchAll(/#\{([^{}]+)\}/g)) {
      const key = match[1]!
      if (!Object.prototype.hasOwnProperty.call(row, key)) continue
      const start = match.index!
      appendOriginal(cursor, start)
      const value = (row as Record<string, unknown>)[key]
      const replacement = value == null ? '' : String(value)
      if (replacement) {
        const origin = spans.find((span) => span.start <= start && start < span.end)!
        output.push({ ...origin.node, text: replacement })
      }
      cursor = start + match[0].length
      replaced = true
    }
    if (!replaced) return nodes
    appendOriginal(cursor, text.length)
    return output
  }

  function visit(node: JSONContent) {
    if (!node.content) return
    const children: JSONContent[] = []
    let run: JSONContent[] = []
    function flush() {
      children.push(...resolveTextRun(run))
      run = []
    }
    for (const child of node.content) {
      if (child.type === 'text') {
        run.push(child)
      } else {
        // 所有非文本节点都是边界，包括段落、hardBreak 和内联原子节点。
        flush()
        visit(child)
        children.push(child)
      }
    }
    flush()
    node.content = children
  }

  visit(result)
  return result
}

export function isSafeRichTextLink(url: string): boolean {
  if (/[\u0000-\u001f\u007f-\u009f\\]/.test(url)) return false
  const value = url.trim()
  if (value.startsWith('#')) return true
  // 不接受协议相对地址，避免将外部地址伪装为站内链接。
  if (value.startsWith('/')) return !value.startsWith('//')
  return /^(?:https?:\/\/|mailto:|tel:)\S+$/i.test(value)
}
