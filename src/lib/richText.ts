export function decodeHtmlEntities(value = '') {
  const raw = String(value || '')

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = raw
    return textarea.value
  }

  return raw
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function richTextToPlainText(value = '') {
  const decoded = decodeHtmlEntities(value)

  if (typeof document !== 'undefined') {
    const container = document.createElement('div')
    container.innerHTML = decoded
    const root =
      container.querySelector('[data-editor-root="true"]') ??
      container.firstElementChild

    if (root instanceof HTMLElement && root.matches('[data-editor-root="true"]')) {
      const temp = document.createElement('div')
      temp.innerHTML = root.innerHTML || ''
      return (temp.textContent || temp.innerText || '').replace(/\u00a0/g, ' ').trim()
    }

    if (/<[a-z][\s\S]*>/i.test(decoded)) {
      return (container.textContent || container.innerText || '').replace(/\u00a0/g, ' ').trim()
    }
  }

  const withoutWrapper = decoded.replace(/^<div[^>]*data-editor-root="true"[^>]*>/i, '').replace(/<\/div>\s*$/i, '')

  return withoutWrapper
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\u00a0/g, ' ')
    .trim()
}

export function toDisplayText(value: unknown, fallback = '') {
  const text = typeof value === 'string' ? richTextToPlainText(value) : ''
  return text || fallback
}

export function excerptText(value: unknown, fallback = '', maxLength = 160) {
  const text = toDisplayText(value, fallback).replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}
