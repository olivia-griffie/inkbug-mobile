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
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (kind === 'home') {
    return (
      <svg {...common}>
        <path d="M4 10.8L12 4l8 6.8" />
        <path d="M6.5 9.8V19h11V9.8" />
        <path d="M10 19v-4.5h4V19" />
      </svg>
    )
  }

  if (kind === 'write') {
    return (
      <svg {...common}>
        <path d="M6.5 5.5h8.5a2 2 0 0 1 2 2v11H8.5a2 2 0 0 0-2 2V5.5Z" />
        <path d="M8.5 18.5V7.2" />
        <path d="M10.5 9.5h4.7" />
        <path d="M10.5 12.5h4.7" />
      </svg>
    )
  }

  if (kind === 'community') {
    return (
      <svg {...common}>
        <path d="M8.2 11a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 8.2 11Z" />
        <path d="M15.8 12.4a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        <path d="M4.7 18c.7-2 2.5-3.1 5-3.1 2.4 0 4.2 1.1 4.9 3.1" />
        <path d="M13.5 18c.4-1.4 1.7-2.2 3.5-2.2 1.3 0 2.3.4 3 .9" />
      </svg>
    )
  }

  if (kind === 'prompts') {
    return (
      <svg {...common}>
        <path d="M12 4.5c-3.6 0-6.5 2.9-6.5 6.5 0 1.8.7 3.3 1.8 4.5.6.7 1 1.4 1.1 2.3h6.2c.1-.9.5-1.6 1.1-2.3 1.1-1.1 1.8-2.7 1.8-4.5 0-3.6-2.9-6.5-6.5-6.5Z" />
        <path d="M9.6 20h4.8" />
        <path d="M10.2 17.8h3.6" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M5 7.5h14v9.5H8.5L5 20V7.5Z" />
      <path d="M8.5 11h7" />
      <path d="M8.5 14h4.5" />
    </svg>
  )
}

export function BottomNav() {
  const location = useLocation()
  const { activeProject } = useProjects()
  const activeProjectId = activeProject?.id

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
        background: C.soft,
        borderTop: `1px solid ${C.borderSoft}`,
        padding: '10px 8px 10px',
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
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '4px 0',
            letterSpacing: '0.02em',
          }}
        >
          <NavIcon kind={item.icon} active={item.active} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
