import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { TopBar } from '../components/TopBar'
import type { Chapter } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

function getChapterWordCount(chapter: Chapter) {
  if (typeof chapter.wordCount === 'number' && Number.isFinite(chapter.wordCount)) {
    return chapter.wordCount
  }

  const content = typeof chapter.content === 'string' ? chapter.content : ''
  return content.split(/\s+/).filter(Boolean).length
}

export function ChaptersPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { session } = useAuthStore()
  const { projects, activeProject, setActiveProject, saveActiveProject } = useProjects()

  const project = useMemo(
    () => projects.find((item) => item.id === id) ?? activeProject,
    [id, projects, activeProject]
  )

  useEffect(() => {
    if (project) {
      setActiveProject(project)
    }
  }, [project, setActiveProject])

  if (!project) {
    return <div style={{ padding: 16 }}>Project not found.</div>
  }

  const chapters = Array.isArray(project.chapters) ? project.chapters : []

  async function handleAddChapter() {
    const userId = session?.user.id
    if (!userId) return

    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Chapter ${chapters.length + 1}`,
      content: '',
      wordCount: 0,
      section: `Section ${chapters.length + 1}`,
    }

    const updatedProject = {
      ...project,
      chapters: [...chapters, newChapter],
      currentWordCount: chapters.reduce((sum, chapter) => sum + getChapterWordCount(chapter), 0),
    }

    await saveActiveProject(updatedProject, userId)
    navigate(`/project/${project.id}/chapters/${newChapter.id}`)
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 96, background: C.cream }}>
      <TopBar
        title="Chapters"
        left={
          <button type="button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', color: C.ink }}>
            Back
          </button>
        }
      />

      <div style={{ display: 'grid', gap: 12, padding: '20px 16px 0' }}>
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => navigate(`/project/${project.id}/chapters/${chapter.id}`)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: C.card,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 6px 16px rgba(47,53,69,0.05)',
            }}
          >
            <div style={{ fontWeight: 600, color: C.ink, marginBottom: 8 }}>
              {typeof chapter.title === 'string' ? chapter.title : `Chapter ${index + 1}`}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.inkSoft }}>
              <span>{getChapterWordCount(chapter).toLocaleString()} words</span>
              <span>{typeof chapter.section === 'string' ? chapter.section : `Section ${index + 1}`}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void handleAddChapter()}
        style={{
          width: 'calc(100% - 32px)',
          margin: '18px 16px 0',
          border: 0,
          borderRadius: 12,
          background: C.ink,
          color: C.cream,
          padding: 16,
          fontWeight: 600,
        }}
      >
        Add Chapter
      </button>

      <BottomNav />
    </div>
  )
}
