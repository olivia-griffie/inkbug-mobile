import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

function toWordCount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function ProjectDashboardPage() {
  const { id } = useParams()
  const { projects, setActiveProject } = useProjects()

  const project = useMemo(
    () => projects.find((item) => item.id === id) ?? null,
    [id, projects]
  )

  useEffect(() => {
    if (project) {
      setActiveProject(project)
    }
  }, [project, setActiveProject])

  if (!project) {
    return <div style={{ padding: 16 }}>Project not found.</div>
  }

  const genre = typeof project.genre === 'string' ? project.genre : 'General'
  const current = toWordCount(project.currentWordCount)
  const goal = Math.max(toWordCount(project.wordCountGoal), 1)
  const progress = Math.max(0, Math.min(100, (current / goal) * 100))

  const navItems = [
    ['📄', 'Chapters', `/project/${project.id}/chapters`],
    ['👥', 'Characters', `/project/${project.id}/characters`],
    ['🧭', 'Plot', `/project/${project.id}/plot`],
    ['📍', 'Locations', `/project/${project.id}/locations`],
    ['🎬', 'Scenes', `/project/${project.id}/scenes`],
    ['✦', 'Prompts', `/project/${project.id}/prompts`],
  ] as const

  return (
    <div style={{ minHeight: '100dvh', padding: '24px 16px 88px' }}>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.7rem',
            color: C.ink,
            marginBottom: 12,
          }}
        >
          {typeof project.title === 'string' ? project.title : 'Untitled Project'}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: '#f1eadf',
              color: C.inkSoft,
              fontSize: '0.75rem',
            }}
          >
            {genre}
          </span>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.borderSoft}`,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ color: C.inkSoft, fontSize: '0.9rem', marginBottom: 8 }}>
            {current.toLocaleString()} / {goal.toLocaleString()} words
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: C.borderSoft,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, ${C.coral} 0%, ${C.orange} 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {navItems.map(([icon, label, to]) => (
          <Link
            key={label}
            to={to}
            style={{
              background: C.card,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 16,
              padding: 16,
              minHeight: 92,
              display: 'grid',
              alignContent: 'space-between',
              boxShadow: '0 6px 16px rgba(47,53,69,0.05)',
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>{icon}</div>
            <div style={{ color: C.ink, fontWeight: 600 }}>{label}</div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
