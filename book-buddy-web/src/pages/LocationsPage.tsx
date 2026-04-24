import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import type { LocationItem } from '../lib/api'
import { excerptRichText } from '../lib/richText'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

export function LocationsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { projects, activeProject, setActiveProject, saveActiveProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<LocationItem>({
    id: '',
    name: '',
    description: '',
    associatedChapters: [],
  })

  const project = useMemo(
    () => projects.find((item) => item.id === id) ?? activeProject,
    [id, projects, activeProject]
  )

  useEffect(() => {
    if (project) setActiveProject(project)
  }, [project, setActiveProject])

  if (!project) return <div style={{ padding: 16 }}>Project not found.</div>

  const currentProject = project
  const locations = Array.isArray(currentProject.locations) ? currentProject.locations : []
  const chapters = Array.isArray(currentProject.chapters) ? currentProject.chapters : []

  function openForNew() {
    setEditingId(null)
    setForm({ id: crypto.randomUUID(), name: '', description: '', associatedChapters: [] })
    setOpen(true)
  }

  function openForEdit(item: LocationItem) {
    setEditingId(item.id)
    setForm({
      id: item.id,
      name: item.name ?? '',
      description: item.description ?? '',
      associatedChapters: item.associatedChapters ?? [],
    })
    setOpen(true)
  }

  async function handleSave() {
    const nextItems = editingId
      ? locations.map((item) => (item.id === editingId ? form : item))
      : [...locations, form]

    await saveActiveProject({
      ...currentProject,
      locations: nextItems,
    })

    setOpen(false)
  }

  function toggleChapter(title: string) {
    const current = form.associatedChapters ?? []
    setForm({
      ...form,
      associatedChapters: current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title],
    })
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', fontSize: '1.2rem', color: C.ink }}>←</button>
        <div style={{ fontFamily: 'Lora, serif', fontSize: '1.45rem', color: C.ink }}>Locations</div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {locations.map((item) => (
          <button key={item.id} type="button" onClick={() => openForEdit(item)} style={sharedCardStyle}>
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>{item.name || 'Untitled location'}</div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
              {excerptRichText(item.description || '', 'Tap to add details.')}
            </div>
          </button>
        ))}
      </div>

      <button type="button" onClick={openForNew} style={sharedFabStyle}>+</button>

      {open ? (
        <div style={sharedOverlayStyle}>
          <div style={sharedSheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" style={sharedFieldStyle} />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" style={sharedAreaStyle} />
              <div>
                <div style={{ color: C.ink, fontWeight: 600, marginBottom: 10 }}>Associated chapters</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {chapters.map((chapter, index) => {
                    const title =
                      typeof chapter.title === 'string' ? chapter.title : `Chapter ${index + 1}`
                    const selected = (form.associatedChapters ?? []).includes(title)

                    return (
                      <label key={chapter.id} style={{ display: 'flex', gap: 10, color: C.inkSoft }}>
                        <input type="checkbox" checked={selected} onChange={() => toggleChapter(title)} />
                        <span>{title}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <button type="button" onClick={() => void handleSave()} style={sharedSaveButtonStyle}>Save</button>
              <button type="button" onClick={() => setOpen(false)} style={sharedCancelButtonStyle}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  )
}

const sharedFieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
}

const sharedAreaStyle = {
  ...sharedFieldStyle,
  minHeight: 110,
  resize: 'vertical' as const,
}

const sharedCardStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: C.card,
  border: 0,
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
}

const sharedFabStyle = {
  position: 'fixed' as const,
  right: 'max(calc((100vw - 430px) / 2 + 16px), 16px)',
  bottom: '92px',
  width: 56,
  height: 56,
  borderRadius: '50%',
  border: 0,
  background: C.ink,
  color: 'white',
  fontSize: '1.7rem',
  boxShadow: '0 10px 24px rgba(47,53,69,0.2)',
}

const sharedOverlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(47,53,69,0.22)',
  display: 'flex',
  alignItems: 'flex-end',
}

const sharedSheetStyle = {
  width: '100%',
  maxWidth: 430,
  margin: '0 auto',
  background: 'white',
  borderRadius: '20px 20px 0 0',
  padding: 24,
  maxHeight: '90dvh',
  overflowY: 'auto' as const,
}

const sharedSaveButtonStyle = {
  width: '100%',
  border: 0,
  borderRadius: 10,
  padding: 14,
  background: C.ink,
  color: 'white',
  fontWeight: 600,
}

const sharedCancelButtonStyle = {
  border: 0,
  background: 'transparent',
  color: C.inkMuted,
  padding: 6,
}
