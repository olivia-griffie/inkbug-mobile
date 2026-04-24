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

function BookBuddyMark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: 58,
        height: 44,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 5,
          right: 5,
          bottom: 0,
          height: 12,
          background: 'linear-gradient(180deg, #b44dd0 0%, #ff6aa7 100%)',
          borderRadius: 8,
          transform: 'skewX(-18deg)',
          boxShadow: '0 7px 10px rgba(180,77,208,0.18)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 8,
          right: 10,
          bottom: 8,
          height: 15,
          background: 'linear-gradient(180deg, #ff7eb8 0%, #ff6a5a 100%)',
          borderRadius: 8,
          transform: 'skewX(-18deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 16,
          height: 17,
          background: 'linear-gradient(180deg, #ffd18a 0%, #ffab48 100%)',
          borderRadius: 8,
          transform: 'skewX(-18deg)',
          boxShadow: '0 6px 12px rgba(255,138,61,0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: 20,
          width: 18,
          height: 14,
          borderRadius: 7,
          background: C.card,
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 8px rgba(47,53,69,0.12)',
          fontSize: 9,
        }}
      >
        ...
      </div>
    </div>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { setActiveProject } = useProjects()
  const title = typeof project.title === 'string' ? project.title : 'Untitled Project'
  const rawGenres =
    Array.isArray(project.genres) && project.genres.length
      ? project.genres.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : typeof project.genre === 'string' && project.genre
        ? [project.genre]
        : ['General']
  const primaryGenre = rawGenres[0]
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
      <div
        style={{
          height: 96,
          background: getGradient(primaryGenre),
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <BookBuddyMark />
      </div>
      <div style={{ padding: 16 }}>
        <h3
          style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.05rem',
            color: C.ink,
            marginBottom: 10,
            fontWeight: 400,
            lineHeight: 1.25,
          }}
        >
          {title}
        </h3>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {rawGenres.map((genre) => (
            <span
              key={genre}
              style={{
                background: '#f1eadf',
                color: C.inkSoft,
                borderRadius: 6,
                fontSize: '0.72rem',
                padding: '4px 8px',
              }}
            >
              {genre}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.74rem',
            marginBottom: 6,
          }}
        >
          <div style={{ color: C.inkMuted }}>
            {current.toLocaleString()} / {goal.toLocaleString()} words
          </div>
          <div style={{ color: C.coral, fontWeight: 700 }}>{Math.round(progress)}%</div>
        </div>
        <div
          style={{
            height: 5,
            borderRadius: 999,
            background: '#efe7da',
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
