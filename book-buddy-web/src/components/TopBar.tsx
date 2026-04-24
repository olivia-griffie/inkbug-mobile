import type { ReactNode } from 'react'
import { C } from '../styles/tokens'

export function TopBar({
  title,
  left,
  right,
}: {
  title: ReactNode
  left?: ReactNode
  right?: ReactNode
}) {
  return (
    <header
      style={{
        height: 52,
        background: C.soft,
        borderBottom: `1px solid ${C.borderSoft}`,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 24, display: 'flex', alignItems: 'center' }}>{left}</div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: 'Lora, serif',
          fontSize: '1.2rem',
          color: C.ink,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </div>
      <div
        style={{
          minWidth: 24,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {right}
      </div>
    </header>
  )
}
