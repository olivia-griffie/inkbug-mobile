import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import genrePromptsData from '../data/genre_prompts.json'
import specificGenrePromptsData from '../data/specific_genre_prompts.json'
import type { DailyPromptHistoryEntry, Project } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

type SpecificPrompt = {
  genre: string
  plotPoint?: string
  prompt: string
}

type GenrePrompt = {
  genre: string
  plotPoint?: string
  questions?: string[]
  description?: string
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function formatTodayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getWordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

function getProjectGenres(project: Project) {
  if (Array.isArray(project.genres)) {
    return project.genres.filter((genre): genre is string => typeof genre === 'string')
  }

  if (typeof project.genre === 'string' && project.genre.trim()) {
    return [project.genre]
  }

  return ['General']
}

function buildPromptPool(genres: string[]) {
  const specificPrompts = specificGenrePromptsData as SpecificPrompt[]
  const genrePrompts = genrePromptsData as GenrePrompt[]

  const matchedSpecific = specificPrompts
    .filter((item) => genres.some((genre) => item.genre.toLowerCase() === genre.toLowerCase()))
    .map((item) => item.prompt)

  if (matchedSpecific.length) {
    return matchedSpecific
  }

  const matchedGeneric = genrePrompts
    .filter((item) => genres.some((genre) => item.genre.toLowerCase() === genre.toLowerCase()))
    .flatMap((item) => {
      const questions = Array.isArray(item.questions) ? item.questions : []
      return questions.length ? questions : item.description ? [item.description] : []
    })

  return matchedGeneric.length
    ? matchedGeneric
    : ['Write a scene that moves your story forward in one surprising way today.']
}

export function PromptsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { session } = useAuthStore()
  const { projects, activeProject, loading, loadProjects, setActiveProject, saveActiveProject } =
    useProjects()
  const [promptOffset, setPromptOffset] = useState(0)
  const [response, setResponse] = useState('')
  const [editingAnswered, setEditingAnswered] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

  const project = useMemo(() => {
    if (id) {
      return projects.find((item) => item.id === id) ?? null
    }

    return activeProject
  }, [id, projects, activeProject])

  useEffect(() => {
    const userId = session?.user.id
    if (!userId || projects.length) return
    void loadProjects(userId)
  }, [session?.user.id, projects.length, loadProjects])

  useEffect(() => {
    if (project) {
      setActiveProject(project)
    }
  }, [project, setActiveProject])

  useEffect(() => {
    setPromptOffset(0)
    setResponse('')
    setEditingAnswered(false)
  }, [project?.id])

  const dateKey = todayKey()
  const currentProject = project ?? null
  const genres = currentProject ? getProjectGenres(currentProject) : ['General']
  const promptsForGenre = buildPromptPool(genres)
  const seed = Number(dateKey.replace(/-/g, ''))
  const promptIndex = promptsForGenre.length ? (seed + promptOffset) % promptsForGenre.length : 0
  const selectedPrompt =
    promptsForGenre[promptIndex] ??
    'Write a scene that moves your story forward in one surprising way today.'
  const history = (Array.isArray(currentProject?.dailyPromptHistory)
    ? currentProject.dailyPromptHistory
    : []) as DailyPromptHistoryEntry[]
  const todayEntry = history.find((entry) => entry.date === dateKey) ?? null
  const recentHistory = [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  useEffect(() => {
    if (todayEntry) {
      setResponse(todayEntry.answer)
    } else {
      setResponse('')
    }
  }, [todayEntry?.date, todayEntry?.answer])

  async function handleSave() {
    if (!currentProject) return

    const entry: DailyPromptHistoryEntry = {
      date: dateKey,
      prompt: selectedPrompt,
      answer: response,
      wordCount: getWordCount(response),
      answeredAt: new Date().toISOString(),
    }

    const nextHistory = todayEntry
      ? history.map((item) => (item.date === dateKey ? entry : item))
      : [...history, entry]

    await saveActiveProject({
      ...currentProject,
      dailyPromptHistory: nextHistory,
    })

    setEditingAnswered(false)
  }

  function toggleExpanded(date: string) {
    setExpandedDates((current) => ({ ...current, [date]: !current[date] }))
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      {currentProject ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ border: 0, background: 'transparent', fontSize: '1.2rem', color: C.ink }}
            >
              ←
            </button>
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: C.inkMuted,
                  marginBottom: 6,
                }}
              >
                Daily Prompt
              </div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: '1.35rem', color: C.ink }}>
                {formatTodayLabel(dateKey)}
              </div>
            </div>
          </div>

          {!todayEntry || editingAnswered ? (
            <>
              <div
                style={{
                  background: C.card,
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    color: C.ink,
                  }}
                >
                  {todayEntry && !editingAnswered ? todayEntry.prompt : selectedPrompt}
                </div>
              </div>

              {!todayEntry ? (
                <button
                  type="button"
                  onClick={() => setPromptOffset((current) => current + 1)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: C.inkMuted,
                    padding: 0,
                    marginBottom: 14,
                  }}
                >
                  ↻ New Prompt
                </button>
              ) : null}

              <textarea
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                style={{
                  width: '100%',
                  minHeight: 200,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  background: C.card,
                  padding: 16,
                  color: C.ink,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />

              <div style={{ color: C.inkMuted, marginTop: 8, marginBottom: 14 }}>
                {getWordCount(response)} words
              </div>

              <button
                type="button"
                onClick={() => void handleSave()}
                style={{
                  width: '100%',
                  border: 0,
                  borderRadius: 12,
                  background: C.ink,
                  color: C.cream,
                  padding: 15,
                  fontWeight: 600,
                }}
              >
                Save Response
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  background: C.soft,
                  border: `1px solid ${C.borderSoft}`,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    color: C.ink,
                  }}
                >
                  {todayEntry.prompt}
                </div>
              </div>

              <div
                style={{
                  background: C.card,
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
                  color: C.inkSoft,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  marginBottom: 10,
                }}
              >
                {todayEntry.answer}
              </div>

              <button
                type="button"
                onClick={() => {
                  setResponse(todayEntry.answer)
                  setEditingAnswered(true)
                }}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: C.inkMuted,
                  padding: 0,
                  marginBottom: 22,
                }}
              >
                Edit Response
              </button>
            </>
          )}

          <div style={{ marginTop: 28 }}>
            <div
              style={{
                fontFamily: 'Lora, serif',
                fontSize: '1.2rem',
                color: C.ink,
                marginBottom: 14,
              }}
            >
              Past Prompts
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {recentHistory.map((entry) => {
                const expanded = Boolean(expandedDates[entry.date])
                return (
                  <button
                    key={`${entry.date}-${entry.answeredAt}`}
                    type="button"
                    onClick={() => toggleExpanded(entry.date)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 0,
                      borderRadius: 14,
                      background: C.card,
                      padding: 16,
                      boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 8,
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ color: C.ink, fontWeight: 600 }}>{entry.date}</div>
                      <span
                        style={{
                          background: '#f1eadf',
                          borderRadius: 999,
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          color: C.inkSoft,
                        }}
                      >
                        {entry.wordCount} words
                      </span>
                    </div>
                    <div
                      style={{
                        color: C.inkSoft,
                        lineHeight: 1.5,
                        marginBottom: expanded ? 12 : 0,
                      }}
                    >
                      {entry.prompt.slice(0, 120)}
                      {entry.prompt.length > 120 ? '…' : ''}
                    </div>
                    {expanded ? (
                      <div
                        style={{
                          color: C.inkSoft,
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                          borderTop: `1px solid ${C.borderSoft}`,
                          paddingTop: 12,
                        }}
                      >
                        {entry.answer}
                      </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div style={{ color: C.inkSoft, paddingTop: 24 }}>
          {loading ? 'Loading prompts...' : 'Project not found.'}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
