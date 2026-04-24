import { PropsWithChildren, ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { C } from '../styles/tokens';
import { contentStyle, shellStyle } from '../lib/ui';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/community', label: 'Community' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/account', label: 'Account' },
];

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
                  padding: '12px 8px',
                  textAlign: 'center',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  color: active ? 'white' : C.inkSoft,
                  background: active
                    ? `linear-gradient(135deg, ${C.coral} 0%, ${C.orange} 100%)`
                    : 'transparent',
                }}
              >
                {item.label}
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
