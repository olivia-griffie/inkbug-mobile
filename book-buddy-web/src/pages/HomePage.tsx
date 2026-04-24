import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ProjectCard } from '../components/ProjectCard'
import { Spinner } from '../components/Spinner'
import { useAuthStore } from '../store/useAuthStore'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

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
    <div style={{ minHeight: '100dvh', padding: '24px 16px 80px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: C.inkMuted,
              marginBottom: 10,
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
            borderRadius: 12,
            width: 42,
            height: 42,
            color: C.ink,
            fontSize: '1.1rem',
          }}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.borderSoft}`,
          borderRadius: 14,
          padding: '12px 16px',
          marginTop: 20,
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ marginBottom: 6, color: C.inkSoft, fontSize: '0.9rem' }}>
            🔥 Writing Streak
          </div>
          <div style={{ color: C.ink, fontWeight: 600 }}>{streakCount} days in a row</div>
        </div>
        <button
          type="button"
          onClick={() => navigate(promptsHref)}
          style={{
            border: 0,
            borderRadius: 10,
            padding: '10px 14px',
            background: C.ink,
            color: C.cream,
            fontWeight: 600,
          }}
        >
          Prompts
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ color: C.ink, fontWeight: 600 }}>Your Projects</div>
        <button
          type="button"
          onClick={() => navigate('/home/create')}
          style={{
            border: 0,
            background: 'transparent',
            color: C.coral,
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          + New
        </button>
      </div>

      <main style={{ display: 'grid', gap: 14 }}>
        {loading ? <Spinner /> : null}
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

        {projects.map((project) => (
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
              Book Buddy
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
