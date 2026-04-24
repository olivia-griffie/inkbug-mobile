import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Chapter } from '../lib/api'
import {
  countRichTextWords,
  parseRichTextValue,
  serializeRichTextValue,
} from '../lib/richText'
import { useAuthStore } from '../store/useAuthStore'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

type SaveState = 'saved' | 'saving'

function ensureChapter(chapter: Chapter | undefined, index: number): Chapter | null {
  if (!chapter) return null

  return {
    ...chapter,
    title: typeof chapter.title === 'string' ? chapter.title : `Chapter ${index + 1}`,
    content: typeof chapter.content === 'string' ? chapter.content : '',
    wordCount:
      typeof chapter.wordCount === 'number' && Number.isFinite(chapter.wordCount)
        ? chapter.wordCount
        : countRichTextWords(typeof chapter.content === 'string' ? chapter.content : ''),
    section: typeof chapter.section === 'string' ? chapter.section : `Section ${index + 1}`,
  }
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

type ToolbarButtonProps = {
  label: string
  onClick: () => void
  title: string
}

function ToolbarButton({ label, onClick, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      style={{
        border: `1px solid ${C.border}`,
        background: C.soft,
        borderRadius: 10,
        minWidth: 40,
        height: 40,
        padding: '0 10px',
        color: C.ink,
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  )
}

export function ChapterEditorPage() {
  const navigate = useNavigate()
  const { id, cid } = useParams()
  const { session } = useAuthStore()
  const { projects, activeProject, setActiveProject, saveActiveProject } = useProjects()
  const [fontSize, setFontSize] = useState(16)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [titleDraft, setTitleDraft] = useState('')
  const [sectionDraft, setSectionDraft] = useState('Draft')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [editorHtml, setEditorHtml] = useState('<p><br></p>')
  const editorRef = useRef<HTMLDivElement | null>(null)
  const latestSaveToken = useRef(0)

  const project = useMemo(
    () => projects.find((item) => item.id === id) ?? activeProject,
    [id, projects, activeProject]
  )

  useEffect(() => {
    if (project) {
      setActiveProject(project)
    }
  }, [project, setActiveProject])

  const chapters = Array.isArray(project?.chapters) ? project.chapters : []
  const chapterIndex = chapters.findIndex((item) => item.id === cid)
  const chapter = ensureChapter(chapterIndex >= 0 ? chapters[chapterIndex] : undefined, chapterIndex)
  const wordCount = countRichTextWords(serializeRichTextValue(editorHtml))

  useEffect(() => {
    if (!chapter) return

    const parsed = parseRichTextValue(chapter.content ?? '')
    setTitleDraft(chapter.title ?? '')
    setSectionDraft(chapter.section ?? 'Draft')
    setEditorHtml(parsed.html || '<p><br></p>')
    setIsDirty(false)
    setSaveState('saved')
    setFontSize(parsed.settings.fontSize ? Number(parsed.settings.fontSize) || 16 : 16)
  }, [chapter?.id])

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== editorHtml) {
      editorRef.current.innerHTML = editorHtml
    }
  }, [editorHtml])

  const buildUpdatedProject = () => {
    if (!project || !chapter || chapterIndex < 0) return null

    const content = serializeRichTextValue(editorHtml, {
      fontSize: String(fontSize),
      lineHeight: '1.7',
    })

    const updatedChapter: Chapter = {
      ...chapter,
      title: titleDraft.trim() || `Chapter ${chapterIndex + 1}`,
      content,
      section: sectionDraft,
      wordCount: countRichTextWords(content),
    }

    const nextChapters = chapters.map((item, index) =>
      index === chapterIndex ? updatedChapter : item
    )

    const currentWordCount = nextChapters.reduce((sum, item) => {
      const contentValue = typeof item.content === 'string' ? item.content : ''
      const count =
        typeof item.wordCount === 'number' && Number.isFinite(item.wordCount)
          ? item.wordCount
          : countRichTextWords(contentValue)
      return sum + count
    }, 0)

    return {
      ...project,
      chapters: nextChapters,
      currentWordCount,
    }
  }

  async function persistChanges() {
    const userId = session?.user.id
    const updatedProject = buildUpdatedProject()

    if (!userId || !updatedProject) return

    const token = ++latestSaveToken.current
    setSaveState('saving')

    await saveActiveProject(updatedProject, userId)

    if (latestSaveToken.current === token) {
      setIsDirty(false)
      setSaveState('saved')
    }
  }

  useEffect(() => {
    if (!chapter || !isDirty) return

    setSaveState('saving')
    const timeout = window.setTimeout(() => {
      void persistChanges()
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [titleDraft, sectionDraft, editorHtml, fontSize, isDirty, chapter?.id])

  if (!project || !chapter) {
    return <div style={{ padding: 16 }}>Chapter not found.</div>
  }

  async function handleBack() {
    if (isDirty) {
      const shouldSave = window.confirm('Save before leaving?')
      if (!shouldSave) return
      await persistChanges()
    }

    navigate(-1)
  }

  function syncEditor() {
    const nextHtml = editorRef.current?.innerHTML || '<p><br></p>'
    setEditorHtml(nextHtml)
    setIsDirty(true)
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    syncEditor()
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: C.cream,
      }}
    >
      <div
        style={{
          padding: '18px 16px 12px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${C.borderSoft}`,
          background: C.card,
        }}
      >
        <button
          type="button"
          onClick={() => void handleBack()}
          style={{
            border: 0,
            background: 'transparent',
            color: C.ink,
            width: 28,
            height: 28,
            display: 'grid',
            placeItems: 'center',
          }}
          aria-label="Go back"
        >
          <BackIcon />
        </button>

        <div style={{ minWidth: 0 }}>
          {isEditingTitle ? (
            <input
              value={titleDraft}
              onChange={(event) => {
                setTitleDraft(event.target.value)
                setIsDirty(true)
              }}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              style={{
                width: '100%',
                border: 0,
                outline: 'none',
                background: 'transparent',
                fontFamily: 'Lora, serif',
                fontSize: '1.05rem',
                color: C.ink,
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              style={{
                padding: 0,
                border: 0,
                background: 'transparent',
                fontFamily: 'Lora, serif',
                fontSize: '1.05rem',
                color: C.ink,
                textAlign: 'left',
                width: '100%',
              }}
            >
              {titleDraft}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: C.inkSoft, fontSize: '0.8rem' }}>{wordCount} words</div>
          <div style={{ color: saveState === 'saving' ? C.coral : C.inkMuted, fontSize: '0.78rem' }}>
            {saveState === 'saving' ? 'Saving...' : 'Saved'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          background: C.soft,
          borderBottom: `1px solid ${C.borderSoft}`,
          overflowX: 'auto',
        }}
      >
        <ToolbarButton label="B" title="Bold" onClick={() => runCommand('bold')} />
        <ToolbarButton label="I" title="Italic" onClick={() => runCommand('italic')} />
        <ToolbarButton label="U" title="Underline" onClick={() => runCommand('underline')} />
        <ToolbarButton label="• List" title="Bullet list" onClick={() => runCommand('insertUnorderedList')} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncEditor}
        onPaste={() => {
          window.setTimeout(syncEditor, 0)
        }}
        style={{
          flex: 1,
          padding: 20,
          fontSize,
          lineHeight: 1.7,
          border: 'none',
          background: C.cream,
          outline: 'none',
          color: C.ink,
          overflowY: 'auto',
          whiteSpace: 'normal',
        }}
      />

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px calc(14px + env(safe-area-inset-bottom))',
          background: C.card,
          borderTop: `1px solid ${C.borderSoft}`,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setFontSize((size) => Math.max(14, size - 1))
              setIsDirty(true)
            }}
            style={{
              border: `1px solid ${C.border}`,
              background: C.soft,
              borderRadius: 10,
              width: 40,
              height: 40,
            }}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              setFontSize((size) => Math.min(24, size + 1))
              setIsDirty(true)
            }}
            style={{
              border: `1px solid ${C.border}`,
              background: C.soft,
              borderRadius: 10,
              width: 40,
              height: 40,
            }}
          >
            +
          </button>
        </div>

        <select
          value={sectionDraft}
          onChange={(event) => {
            setSectionDraft(event.target.value)
            setIsDirty(true)
          }}
          style={{
            border: `1px solid ${C.border}`,
            background: C.soft,
            borderRadius: 10,
            padding: '10px 12px',
            color: C.ink,
          }}
        >
          <option value="Draft">Draft</option>
          <option value="Act I">Act I</option>
          <option value="Act II">Act II</option>
          <option value="Act III">Act III</option>
          <option value="Finale">Finale</option>
        </select>
      </div>
    </div>
  )
}
