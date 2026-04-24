export type RichTextSettings = {
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  textAlign?: string;
};

export type ParsedRichText = {
  html: string;
  settings: RichTextSettings;
};

export function decodeHtmlEntities(value = '') {
  const raw = String(value || '');

  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = raw;
    return textarea.value;
  }

  return raw
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function parseRichTextValue(value = ''): ParsedRichText {
  const decoded = decodeHtmlEntities(value);

  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = decoded;
    const root = container.querySelector('[data-editor-root="true"]');

    if (root instanceof HTMLElement) {
      return {
        html: root.innerHTML || '<p><br></p>',
        settings: {
          fontFamily: root.dataset.fontFamily || '',
          fontSize: root.dataset.fontSize || '',
          lineHeight: root.dataset.lineHeight || '',
          textAlign: root.dataset.textAlign || '',
        },
      };
    }
  }

  const match = decoded.match(/^<div[^>]*data-editor-root="true"[^>]*>([\s\S]*)<\/div>$/i);
  if (match) {
    return {
      html: match[1] || '<p><br></p>',
      settings: {},
    };
  }

  if (/<[a-z][\s\S]*>/i.test(decoded)) {
    return {
      html: decoded,
      settings: {},
    };
  }

  return {
    html: String(decoded || '').replace(/\n/g, '<br>'),
    settings: {},
  };
}

export function richTextToPlainText(value = '') {
  const parsed = parseRichTextValue(value);

  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = parsed.html || '';
    return (temp.textContent || temp.innerText || '').replace(/\u00a0/g, ' ').trim();
  }

  return (parsed.html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function toDisplayText(value: unknown, fallback = '') {
  const text = typeof value === 'string' ? richTextToPlainText(value) : '';
  return text || fallback;
}

export function excerptText(value: unknown, fallback = '', maxLength = 160) {
  const text = toDisplayText(value, fallback).replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
