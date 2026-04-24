import { Link, useLocation } from 'react-router-dom'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

export function BottomNav() {
  const location = useLocation()
  const { activeProject } = useProjects()
  const activeProjectId = activeProject?.id

  const items = [
    { label: 'Home', icon: '⌂', to: '/home', active: location.pathname === '/home' },
    {
      label: 'Write',
      icon: '✎',
      to: activeProjectId ? `/project/${activeProjectId}/chapters` : '/home',
      active: location.pathname.includes('/chapters'),
    },
    {
      label: 'Community',
      icon: '◎',
      to: '/community',
      active: location.pathname === '/community',
    },
    {
      label: 'Prompts',
      icon: '✦',
      to: activeProjectId ? `/project/${activeProjectId}/prompts` : '/home',
      active: location.pathname.includes('/prompts'),
    },
    {
      label: 'Inbox',
      icon: '☰',
      to: '/inbox',
      active: location.pathname === '/inbox',
    },
  ]

  return (
    <nav
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        background: C.soft,
        borderTop: `1px solid ${C.borderSoft}`,
        padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
      }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 4,
            color: item.active ? C.coral : C.inkMuted,
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
