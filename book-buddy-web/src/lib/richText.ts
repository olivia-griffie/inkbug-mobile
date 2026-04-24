export type RichTextSettings = {
  fontFamily?: string
  fontSize?: string
  lineHeight?: string
  textAlign?: string
}

export type ParsedRichText = {
  html: string
  settings: RichTextSettings
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function plainTextToEditorHtml(value = '') {
  const normalized = String(value || '').replace(/\r\n/g, '\n')
  if (!normalized.trim()) {
    return '<p><br></p>'
  }

  return normalized
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export function parseRichTextValue(value = ''): ParsedRichText {
  const raw = String(value || '')

  if (typeof document !== 'undefined') {
    const container = document.createElement('div')
    container.innerHTML = raw
    const root = container.firstElementChild

    if (root instanceof HTMLElement && root.matches('[data-editor-root="true"]')) {
      return {
        html: root.innerHTML || '<p><br></p>',
        settings: {
          fontFamily: root.dataset.fontFamily || '',
          fontSize: root.dataset.fontSize || '',
          lineHeight: root.dataset.lineHeight || '',
          textAlign: root.dataset.textAlign || '',
        },
      }
    }
  } else {
    const match = raw.match(/^<div[^>]*data-editor-root="true"[^>]*>([\s\S]*)<\/div>$/i)
    if (match) {
      return {
        html: match[1] || '<p><br></p>',
        settings: {},
      }
    }
  }

  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return {
      html: raw,
      settings: {},
    }
  }

  return {
    html: plainTextToEditorHtml(raw),
    settings: {},
  }
}

export function serializeRichTextValue(html = '', settings: RichTextSettings = {}) {
  const fontFamily = settings.fontFamily || ''
  const fontSize = settings.fontSize || ''
  const lineHeight = settings.lineHeight || ''
  const textAlign = settings.textAlign || ''
  const content = html || '<p><br></p>'

  return `<div data-editor-root="true" data-font-family="${escapeHtml(fontFamily)}" data-font-size="${escapeHtml(fontSize)}" data-line-height="${escapeHtml(lineHeight)}" data-text-align="${escapeHtml(textAlign)}">${content}</div>`
}

export function richTextToPlainText(value = '') {
  const parsed = parseRichTextValue(value)
  const html = parsed.html || ''

  if (typeof document !== 'undefined') {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return (temp.textContent || temp.innerText || '').replace(/\u00a0/g, ' ').trim()
  }

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function countRichTextWords(value = '') {
  return richTextToPlainText(value).split(/\s+/).filter(Boolean).length
}
