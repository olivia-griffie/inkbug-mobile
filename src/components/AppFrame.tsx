import { PropsWithChildren, ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { C } from '../styles/tokens';
import { contentStyle, shellStyle } from '../lib/ui';

type NavItem = {
  to: string;
  label: string;
  icon: 'home' | 'community' | 'inbox' | 'account';
};

const navItems: NavItem[] = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/community', label: 'Community', icon: 'community' },
  { to: '/inbox', label: 'Inbox', icon: 'inbox' },
  { to: '/account', label: 'Account', icon: 'account' },
];

function FooterIcon({ kind, active }: { kind: NavItem['icon']; active: boolean }) {
  const color = active ? 'white' : C.inkSoft;
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (kind === 'home') {
    return (
      <svg {...common}>
        <path d="M5.25 10.3L12 4.75l6.75 5.55" />
        <path d="M7.15 9.75V19h9.7V9.75" />
        <path d="M10.1 19v-4.25h3.8V19" />
      </svg>
    );
  }

  if (kind === 'community') {
    return (
      <svg {...common}>
        <path d="M9 10.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z" />
        <path d="M16.2 11.6a2.15 2.15 0 1 0 0-4.3 2.15 2.15 0 0 0 0 4.3Z" />
        <path d="M4.5 18.2c.75-2.15 2.7-3.35 5.45-3.35 2.5 0 4.4 1.06 5.2 2.97" />
        <path d="M14.35 17.55c.52-1.18 1.73-1.85 3.38-1.85 1.02 0 1.92.27 2.77.82" />
      </svg>
    );
  }

  if (kind === 'inbox') {
    return (
      <svg {...common}>
        <path d="M4.75 7.75h14.5v8.75H14.9l-1.8 2h-2.2l-1.8-2H4.75V7.75Z" />
        <path d="M8.5 11.15h7" />
        <path d="M8.5 14.1h4.2" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 12a3.15 3.15 0 1 0 0-6.3 3.15 3.15 0 0 0 0 6.3Z" />
      <path d="M6.3 18.45c.95-2.35 3.05-3.55 5.7-3.55 2.68 0 4.78 1.2 5.7 3.55" />
    </svg>
  );
}

export function AppFrame({
  title,
  eyebrow,
  actions,
  children,
}: PropsWithChildren<{
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}>) {
  const location = useLocation();

  return (
    <div style={shellStyle}>
      <div style={contentStyle}>
        <div
          style={{
            padding: '12px 4px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                color: C.coral,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {eyebrow ?? 'Book Buddy'}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: 'Lora, serif',
                fontSize: 30,
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
          </div>
          {actions}
        </div>

        {children}

        <nav
          style={{
            position: 'sticky',
            bottom: 12,
            marginTop: 24,
            padding: 10,
            background: 'rgba(255, 255, 255, 0.94)',
            border: `1px solid ${C.borderSoft}`,
            borderRadius: 999,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            backdropFilter: 'blur(12px)',
          }}
        >
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  padding: '9px 8px 10px',
                  textAlign: 'center',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  color: active ? 'white' : C.inkSoft,
                  background: active
                    ? `linear-gradient(135deg, ${C.coral} 0%, ${C.orange} 100%)`
                    : 'transparent',
                  display: 'grid',
                  justifyItems: 'center',
                  gap: 4,
                }}
              >
                <FooterIcon kind={item.icon} active={active} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function ProjectTabs({ projectId }: { projectId: string }) {
  const tabs = [
    ['', 'Overview'],
    ['/chapters', 'Chapters'],
    ['/characters', 'Characters'],
    ['/plot', 'Plot'],
    ['/locations', 'Locations'],
    ['/scenes', 'Scenes'],
    ['/prompts', 'Prompts'],
  ] as const;

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        paddingBottom: 6,
        marginBottom: 18,
      }}
    >
      {tabs.map(([suffix, label]) => (
        <Link
          key={suffix}
          to={`/project/${projectId}${suffix}`}
          style={{
            whiteSpace: 'nowrap',
            padding: '10px 14px',
            borderRadius: 999,
            border: `1px solid ${C.border}`,
            background: 'rgba(255,255,255,0.8)',
            color: C.inkSoft,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export function StatChip({
  label,
  value,
  tone = 'coral',
}: {
  label: string;
  value: string | number;
  tone?: 'coral' | 'mint' | 'pink';
}) {
  const backgrounds: Record<string, string> = {
    coral: 'rgba(255, 106, 90, 0.12)',
    mint: 'rgba(79, 242, 201, 0.16)',
    pink: 'rgba(255, 126, 184, 0.14)',
  };

  return (
    <div
      style={{
        padding: '14px 16px',
        background: backgrounds[tone],
        borderRadius: 20,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '28px 18px',
        borderRadius: 24,
        border: `1px dashed ${C.border}`,
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <h3 style={{ margin: '0 0 8px', fontFamily: 'Lora, serif' }}>{title}</h3>
      <p style={{ margin: 0, color: C.inkMuted, lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

export function ListCard({
  title,
  subtitle,
  body,
  href,
}: {
  title: string;
  subtitle?: string;
  body?: string;
  href?: string;
}) {
  const cardBody = (
    <>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {subtitle ? (
        <div style={{ color: C.coral, fontSize: 13, marginBottom: 8 }}>{subtitle}</div>
      ) : null}
      {body ? <div style={{ color: C.inkMuted, lineHeight: 1.55 }}>{body}</div> : null}
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        style={{
          display: 'block',
          padding: 18,
          borderRadius: 22,
          border: `1px solid ${C.borderSoft}`,
          background: 'rgba(255,255,255,0.95)',
          marginBottom: 12,
        }}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <div
      style={{
        display: 'block',
        padding: 18,
        borderRadius: 22,
        border: `1px solid ${C.borderSoft}`,
        background: 'rgba(255,255,255,0.95)',
        marginBottom: 12,
      }}
    >
      {cardBody}
    </div>
  );
}
