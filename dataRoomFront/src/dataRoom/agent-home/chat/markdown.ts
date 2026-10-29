import MarkdownIt, { type RendererRule } from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github.css'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'
import groovy from 'highlight.js/lib/languages/groovy'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'

// 仅加载明确支持的语法，不自动猜测语言，避免流式输出时反复切换高亮。
hljs.registerLanguage('json', json)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('groovy', groovy)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerAliases(['js', 'jsx', 'mjs', 'cjs'], { languageName: 'javascript' })

const languageLabels: Record<string, string> = {
  json: 'JSON',
  sql: 'SQL',
  groovy: 'Groovy',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  css: 'CSS',
}

const getCodeLanguage = (info: string): string => info.trim().split(/\s+/u)[0]?.toLowerCase() ?? ''

const getCodeLanguageLabel = (info: string): string => {
  const language = getCodeLanguage(info)
  return Object.prototype.hasOwnProperty.call(languageLabels, language)
    ? languageLabels[language]!
    : language || '纯文本'
}

/**
 * Agent 回复的 Markdown 渲染器。
 * html:false —— 不渲染原始 HTML，防注入；linkify 自动识别链接。
 */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight: (code, info): string => {
    const language = getCodeLanguage(info)
    // 使用 highlight.js 自带 GitHub 浅色主题；未知语言和超长代码交给 MarkdownIt 安全转义。
    if (!language || !hljs.getLanguage(language) || code.length > 50000) {
      return ''
    }
    try {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value
    } catch (error) {
      console.error('Agent 代码块高亮失败', error)
      return ''
    }
  },
})

// 链接统一新窗口打开：避免在当前窗口跳转导致对话页状态丢失；
// rel="noopener noreferrer" 防止新页面通过 window.opener 反向控制对话页
const fallbackLinkOpen: RendererRule = (tokens, idx, options, _env, renderer) =>
  renderer.renderToken(tokens, idx, options)
const defaultLinkOpen: RendererRule = md.renderer.rules.link_open ?? fallbackLinkOpen
const linkOpen: RendererRule = (tokens, idx, options, env, renderer) => {
  const token = tokens[idx]
  if (token) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, idx, options, env, renderer)
}
md.renderer.rules.link_open = linkOpen

// 围栏和缩进代码块共用复制入口，事件由 MessageItem 委托处理。
const defaultFence = md.renderer.rules.fence
const defaultCodeBlock = md.renderer.rules.code_block
const copyableCodeBlock: RendererRule = (tokens, idx, options, env, renderer) => {
  const token = tokens[idx]
  if (!token) {
    return ''
  }
  const defaultRenderer = token.type === 'fence' ? defaultFence : defaultCodeBlock
  const renderedCode = defaultRenderer
    ? defaultRenderer(tokens, idx, options, env, renderer).replace('<pre>', '<pre class="hljs">')
    : `<pre class="hljs"><code>${md.utils.escapeHtml(token.content ?? '')}</code></pre>`
  const languageLabel = token.type === 'fence' ? getCodeLanguageLabel(token.info ?? '') : '纯文本'
  return `<div class="markdown-code-block"><span class="markdown-code-block__language">${md.utils.escapeHtml(languageLabel)}</span><button type="button" class="markdown-code-block__copy" data-copy-code aria-label="复制代码" title="复制代码"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.5 5.5h6v7h-6zM3 10.5H2.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25"/></svg></button>${renderedCode}</div>`
}
md.renderer.rules.fence = copyableCodeBlock
md.renderer.rules.code_block = copyableCodeBlock

/**
 * 渲染 Markdown 文本为 HTML 字符串（配合 v-html 使用）
 */
export const renderMarkdown = (content: string): string => {
  if (!content) {
    return ''
  }
  return md.render(content)
}
