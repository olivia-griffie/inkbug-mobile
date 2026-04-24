import { Link, useLocation } from 'react-router-dom'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

function NavIcon({
  kind,
  active,
}: {
  kind: 'home' | 'write' | 'community' | 'prompts' | 'inbox'
  active: boolean
}) {
  const color = active ? C.coral : C.inkMuted
  const common = {
    width: 21,
    height: 21,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (kind === 'home') {
    return (
      <svg {...common}>
        <path d="M5.25 10.3L12 4.75l6.75 5.55" />
        <path d="M7.15 9.75V19h9.7V9.75" />
        <path d="M10.1 19v-4.25h3.8V19" />
      </svg>
    )
  }

  if (kind === 'write') {
    return (
      <svg {...common}>
        <path d="M12 6.25c-1.55-1.1-3.05-1.65-4.5-1.65H5.8v12.9h1.7c1.55 0 3.05.52 4.5 1.55" />
        <path d="M12 6.25c1.55-1.1 3.05-1.65 4.5-1.65h1.7v12.9h-1.7c-1.55 0-3.05.52-4.5 1.55" />
        <path d="M12 6.35V19.05" />
      </svg>
    )
  }

  if (kind === 'community') {
    return (
      <svg {...common}>
        <path d="M9 10.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" />
        <path d="M16.2 11.6a2.15 2.15 0 1 0 0-4.3 2.15 2.15 0 0 0 0 4.3Z" />
        <path d="M4.5 18.2c.75-2.15 2.7-3.35 5.45-3.35 2.5 0 4.4 1.06 5.2 2.97" />
        <path d="M14.35 17.55c.52-1.18 1.73-1.85 3.38-1.85 1.02 0 1.92.27 2.77.82" />
      </svg>
    )
  }

  if (kind === 'prompts') {
    return (
      <svg {...common}>
        <path d="M13.35 3.95L7.65 12.1h3.85l-1.05 7.95 5.9-8.55h-3.9l.9-7.55Z" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M6 17.35h12" />
      <path d="M7.25 17.35V10.8a4.75 4.75 0 1 1 9.5 0v6.55" />
      <path d="M10.15 19.05a1.9 1.9 0 0 0 3.7 0" />
    </svg>
  )
}

export function BottomNav() {
  const location = useLocation()
  const { activeProject } = useProjects()
  const activeProjectId = activeProject?.id
  const unreadCount = 0

  const items = [
    { label: 'Home', icon: 'home' as const, to: '/home', active: location.pathname === '/home' },
    {
      label: 'Write',
      icon: 'write' as const,
      to: activeProjectId ? `/project/${activeProjectId}/chapters` : '/home',
      active: location.pathname.includes('/chapters'),
    },
    {
      label: 'Community',
      icon: 'community' as const,
      to: '/community',
      active: location.pathname === '/community',
    },
    {
      label: 'Prompts',
      icon: 'prompts' as const,
      to: activeProjectId ? `/project/${activeProjectId}/prompts` : '/home',
      active: location.pathname.includes('/prompts'),
    },
    {
      label: 'Inbox',
      icon: 'inbox' as const,
      to: '/inbox',
      active: location.pathname === '/inbox' || location.pathname.startsWith('/inbox/'),
    },
  ]

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        background: '#fffdfb',
        borderTop: `1px solid ${C.borderSoft}`,
        boxShadow: '0 -4px 18px rgba(47,53,69,0.04)',
        padding: '7px 8px 8px',
      }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 3,
            color: item.active ? C.coral : C.inkMuted,
            fontSize: '0.66rem',
            fontWeight: 600,
            padding: '2px 0 1px',
            letterSpacing: '0.01em',
            position: 'relative',
          }}
        >
          <NavIcon kind={item.icon} active={item.active} />
          {item.label === 'Inbox' && unreadCount > 0 ? (
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 'calc(50% + 3px)',
                minWidth: 15,
                height: 15,
                padding: '0 4px',
                borderRadius: 999,
                background: C.coral,
                color: '#fff',
                fontSize: '0.58rem',
                fontWeight: 700,
                lineHeight: '15px',
                textAlign: 'center',
              }}
            >
              {unreadCount}
            </span>
          ) : null}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
