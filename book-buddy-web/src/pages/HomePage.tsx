import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ProjectCard } from '../components/ProjectCard'
import { useAuthStore } from '../store/useAuthStore'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke={C.inkSoft}
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="6.5" x2="20" y2="6.5" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17.5" x2="20" y2="17.5" />
    </svg>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { session, profile } = useAuthStore()
  const { projects, activeProject, loading, loadProjects } = useProjects()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const userId = session?.user.id
    if (!userId) return
    void loadProjects(userId)
  }, [session?.user.id, loadProjects])

  const streakCount =
    typeof profile?.streak_count === 'number' && Number.isFinite(profile.streak_count)
      ? profile.streak_count
      : 0

  const promptsHref = activeProject ? `/project/${activeProject.id}/prompts` : '/home'

  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: '18px 20px 88px',
        position: 'relative',
        background: 'linear-gradient(180deg, #fff6f4 0%, #fff7f3 32%, #fff7f3 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingTop: 4,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: C.inkMuted,
              marginBottom: 4,
            }}
          >
            Projects
          </div>
          <h1
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '1.6rem',
              color: C.ink,
              fontWeight: 400,
              lineHeight: 1.16,
            }}
          >
            Your Writing Desk
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{
            border: `1px solid ${C.borderSoft}`,
            background: C.card,
            borderRadius: 14,
            width: 42,
            height: 42,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 6px 14px rgba(47,53,69,0.05)',
          }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.borderSoft}`,
          borderRadius: 14,
          padding: '12px 16px',
          marginTop: 18,
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 4px 12px rgba(47,53,69,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '1.3rem', lineHeight: 1 }}>🔥</div>
          <div>
            <div
              style={{
                marginBottom: 2,
                color: C.inkMuted,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Writing Streak
            </div>
            <div style={{ color: C.ink, fontWeight: 600, fontSize: '1rem' }}>
              {streakCount} days in a row
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(promptsHref)}
          style={{
            border: 0,
            borderRadius: 8,
            padding: '9px 14px',
            background: C.ink,
            color: C.cream,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Prompts
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            color: C.inkSoft,
            fontWeight: 700,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            lineHeight: 1.1,
            maxWidth: 90,
          }}
        >
          Your Projects
        </div>
        <button
          type="button"
          onClick={() => navigate('/home/create')}
          style={{
            border: 0,
            background: 'transparent',
            color: C.coral,
            fontWeight: 600,
            fontSize: '0.75rem',
            lineHeight: 1.1,
          }}
        >
          +<br />
          New
        </button>
      </div>

      <main style={{ display: 'grid', gap: 14 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                style={{
                  height: 180,
                  borderRadius: 16,
                  background: 'linear-gradient(180deg, #f6eee7 0%, #ffffff 100%)',
                  border: `1px solid ${C.borderSoft}`,
                  animation: 'shimmer 1.2s ease-in-out infinite alternate',
                  boxShadow: '0 6px 16px rgba(47,53,69,0.05)',
                }}
              />
            ))
          : null}
        {!loading && !projects.length ? (
          <div
            style={{
              padding: 20,
              background: C.card,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 16,
              color: C.inkSoft,
            }}
          >
            No projects yet. Create one from desktop or use the placeholder new-project flow.
          </div>
        ) : null}

        {!loading &&
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
      </main>

      {drawerOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(47,53,69,0.18)',
              border: 0,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 260,
              maxWidth: '85vw',
              height: '100dvh',
              background: C.card,
              borderLeft: `1px solid ${C.borderSoft}`,
              padding: 20,
              zIndex: 1,
              boxShadow: '-8px 0 24px rgba(47,53,69,0.08)',
            }}
          >
            <div
              style={{
                fontFamily: 'Lora, serif',
                fontSize: '1.3rem',
                color: C.ink,
                marginBottom: 16,
              }}
            >
              Inkbug Beta
            </div>
            <div style={{ display: 'grid', gap: 12, color: C.inkSoft }}>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false)
                  navigate('/account')
                }}
                style={{
                  textAlign: 'left',
                  border: 0,
                  background: 'transparent',
                  color: C.inkSoft,
                  padding: 0,
                }}
              >
                Account
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  textAlign: 'left',
                  border: 0,
                  background: 'transparent',
                  color: C.inkSoft,
                  padding: 0,
                }}
              >
                Close
              </button>
            </div>
          </aside>
        </>
      ) : null}

      <BottomNav />
    </div>
  )
}
