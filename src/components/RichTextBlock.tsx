import { CSSProperties, useMemo } from 'react';
import { parseRichTextValue } from '../lib/richText';

function normalizeFontFamily(fontFamily?: string) {
  if (!fontFamily) {
    return undefined;
  }

  return fontFamily;
}

export function RichTextBlock({
  value,
  style,
}: {
  value?: string | null;
  style?: CSSProperties;
}) {
  const parsed = useMemo(() => parseRichTextValue(value || ''), [value]);

  return (
    <div
      style={{
        fontFamily: normalizeFontFamily(parsed.settings.fontFamily),
        fontSize: parsed.settings.fontSize ? `${parsed.settings.fontSize}px` : undefined,
        lineHeight: parsed.settings.lineHeight || undefined,
        textAlign: (parsed.settings.textAlign as CSSProperties['textAlign']) || undefined,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: parsed.html || '<p><br></p>' }}
    />
  );
}
