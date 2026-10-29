import { getFieldValue, normalizeRows, type DatasetRow } from '@/dataRoom/components/_shared/metric-table-utils.ts'

export interface HtmlRenderResult {
  srcdoc: string
  missingPaths: string[]
}

export const getPlaceholderPaths = (html: string): string[] => {
  if (!html) {
    return []
  }
  const matches = [...html.matchAll(/#\{([^}]+)\}/g)]
  return [...new Set(matches.map(match => match[1]?.trim()).filter(Boolean) as string[])]
}

export const escapeHtml = (value: unknown): string => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const getPlaceholderContext = (datasetValue: unknown): DatasetRow | undefined => {
  return normalizeRows(datasetValue)[0]
}

export const substitutePlaceholders = (
  html: string,
  datasetValue: unknown,
): { html: string; missingPaths: string[] } => {
  const context = getPlaceholderContext(datasetValue)
  const missingPaths = new Set<string>()
  const substituted = html.replace(/#\{([^}]+)\}/g, (_match, rawPath: string) => {
    const path = rawPath.trim()
    if (!path) {
      return ''
    }
    const value = getFieldValue(context, path)
    if (value === undefined || value === null) {
      missingPaths.add(path)
      return ''
    }
    return escapeHtml(value)
  })
  return {
    html: substituted,
    missingPaths: Array.from(missingPaths),
  }
}

const isJavaScriptUrl = (value: string): boolean => {
  return value.replace(/[\u0000-\u0020\u007F]/g, '').toLowerCase().startsWith('javascript:')
}

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'data'])

export const sanitizeHtmlFragment = (html: string): string => {
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('script').forEach(node => node.remove())

  const elements = template.content.querySelectorAll('*')
  elements.forEach(element => {
    for (const attr of Array.from(element.attributes)) {
      const attrName = attr.name.toLowerCase()
      const attrValue = attr.value
      if (attrName.startsWith('on')) {
        element.removeAttribute(attr.name)
        continue
      }
      if (attrName === 'srcdoc') {
        element.removeAttribute(attr.name)
        continue
      }
      if (URL_ATTRIBUTES.has(attrName) && isJavaScriptUrl(attrValue)) {
        element.removeAttribute(attr.name)
      }
    }
  })

  return template.innerHTML
}

const protectStyleEndTag = (css: string): string => {
  return css.replace(/<\/style/gi, '<\\/style')
}

// Only Element Plus color tokens cross the iframe boundary, never arbitrary CSS.
export const ELEMENT_PLUS_COLOR_NAMES = [
  '--el-color-white', '--el-color-black',
  ...['primary', 'success', 'warning', 'danger', 'error', 'info'].flatMap(name => [
    `--el-color-${name}`,
    ...[3, 5, 7, 8, 9].map(level => `--el-color-${name}-light-${level}`),
    `--el-color-${name}-dark-2`,
  ]),
  ...['primary', 'regular', 'secondary', 'placeholder', 'disabled'].map(name => `--el-text-color-${name}`),
  '--el-border-color', ...['light', 'lighter', 'extra-light', 'dark', 'darker'].map(name => `--el-border-color-${name}`),
  '--el-bg-color', '--el-bg-color-page', '--el-bg-color-overlay',
  '--el-fill-color', ...['light', 'lighter', 'extra-light', 'dark', 'darker', 'blank'].map(name => `--el-fill-color-${name}`),
] as const

export type HtmlThemeColors = Readonly<Record<string, string>>

export const readElementPlusColors = (element: Element): HtmlThemeColors => {
  const styles = element.ownerDocument.defaultView?.getComputedStyle(element)
  return Object.fromEntries(ELEMENT_PLUS_COLOR_NAMES.map(name => [name, styles?.getPropertyValue(name).trim() ?? '']))
}

export const serializeElementPlusColors = (colors: HtmlThemeColors): string => {
  // Only literal colors: reject URLs, CSS escapes, separators and HTML delimiters.
  const literalColor = /^(?:#[\da-f]{3,8}|(?:rgb|rgba|hsl|hsla)\([\d\s.,%+\-/]+\))$/i
  return ELEMENT_PLUS_COLOR_NAMES.flatMap(name => {
    const value = colors[name]?.trim()
    return value && literalColor.test(value) ? [`${name}:${value};`] : []
  }).join('')
}

export const buildHtmlSrcdoc = (
  html: string,
  css: string,
  datasetValue: unknown,
  themeColors: HtmlThemeColors = {},
): HtmlRenderResult => {
  const substituted = substitutePlaceholders(html, datasetValue)
  const sanitizedHtml = sanitizeHtmlFragment(substituted.html)
  const safeCss = protectStyleEndTag(css)

  return {
    srcdoc: `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root { ${serializeElementPlusColors(themeColors)} }
    html, body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      box-sizing: border-box;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    ${safeCss}
  </style>
</head>
<body>${sanitizedHtml}</body>
</html>`,
    missingPaths: substituted.missingPaths,
  }
}
