import { getFieldValue, normalizeRows, type DatasetRow } from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

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

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'formaction', 'data'])

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

export const buildHtmlSrcdoc = (
  html: string,
  css: string,
  datasetValue: unknown,
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
