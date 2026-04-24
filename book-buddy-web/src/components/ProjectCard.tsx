import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../lib/api'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

function getGradient(genre: string) {
  const normalized = genre.toLowerCase()

  if (normalized.includes('fantasy')) {
    return `linear-gradient(135deg, ${C.orange} 0%, ${C.pink} 100%)`
  }

  if (normalized.includes('romance')) {
    return `linear-gradient(135deg, ${C.coral} 0%, ${C.mint} 100%)`
  }

  if (normalized.includes('sci')) {
    return `linear-gradient(135deg, ${C.mint} 0%, ${C.ink} 100%)`
  }

  return `linear-gradient(135deg, ${C.coral} 0%, ${C.orange} 100%)`
}

function toWordCount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const cardStyle: CSSProperties = {
  background: C.card,
  borderRadius: 16,
  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
  overflow: 'hidden',
  border: `1px solid ${C.borderSoft}`,
}

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { setActiveProject } = useProjects()
  const title = typeof project.title === 'string' ? project.title : 'Untitled Project'
  const genre = typeof project.genre === 'string' ? project.genre : 'General'
  const current = toWordCount(project.currentWordCount)
  const goal = Math.max(toWordCount(project.wordCountGoal), 1)
  const progress = Math.max(0, Math.min(100, (current / goal) * 100))

  function handleOpen() {
    setActiveProject(project)
    navigate(`/project/${project.id}`)
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      style={{
        ...cardStyle,
        width: '100%',
        padding: 0,
        textAlign: 'left',
        backgroundColor: C.card,
        borderColor: C.borderSoft,
      }}
    >
      <div style={{ height: 90, background: getGradient(genre) }} />
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.05rem',
            color: C.ink,
            marginBottom: 10,
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span
            style={{
              background: '#f1eadf',
              color: C.inkSoft,
              borderRadius: 6,
              fontSize: '0.72rem',
              padding: '6px 8px',
            }}
          >
            {genre}
          </span>
        </div>

        <div style={{ fontSize: '0.84rem', color: C.inkSoft, marginBottom: 8 }}>
          {current.toLocaleString()} / {goal.toLocaleString()} words
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: C.borderSoft,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${C.coral} 0%, ${C.orange} 100%)`,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </button>
  )
}
