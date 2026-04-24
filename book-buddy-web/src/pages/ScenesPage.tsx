import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import type { Scene } from '../lib/api'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

const sceneStatuses = ['Draft', 'Written', 'Revised']

export function ScenesPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { projects, activeProject, setActiveProject, saveActiveProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Scene>({
    id: '',
    title: '',
    summary: '',
    charactersInvolved: [],
    location: '',
    status: 'Draft',
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
  const scenes = Array.isArray(currentProject.scenes) ? currentProject.scenes : []
  const characters = Array.isArray(currentProject.characters) ? currentProject.characters : []
  const locations = Array.isArray(currentProject.locations) ? currentProject.locations : []

  function openForNew() {
    setEditingId(null)
    setForm({
      id: crypto.randomUUID(),
      title: '',
      summary: '',
      charactersInvolved: [],
      location: '',
      status: 'Draft',
    })
    setOpen(true)
  }

  function openForEdit(item: Scene) {
    setEditingId(item.id)
    setForm({
      id: item.id,
      title: item.title ?? '',
      summary: item.summary ?? '',
      charactersInvolved: item.charactersInvolved ?? [],
      location: item.location ?? '',
      status: item.status ?? 'Draft',
    })
    setOpen(true)
  }

  async function handleSave() {
    const nextItems = editingId
      ? scenes.map((item) => (item.id === editingId ? form : item))
      : [...scenes, form]

    await saveActiveProject({
      ...currentProject,
      scenes: nextItems,
    })

    setOpen(false)
  }

  function toggleCharacter(name: string) {
    const current = form.charactersInvolved ?? []
    setForm({
      ...form,
      charactersInvolved: current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    })
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', fontSize: '1.2rem', color: C.ink }}>←</button>
        <div style={{ fontFamily: 'Lora, serif', fontSize: '1.45rem', color: C.ink }}>Scenes</div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {scenes.map((item) => (
          <button key={item.id} type="button" onClick={() => openForEdit(item)} style={sceneCardStyle}>
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>{item.title || 'Untitled scene'}</div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>{(item.summary || 'Tap to add scene notes.').slice(0, 120)}</div>
          </button>
        ))}
      </div>

      <button type="button" onClick={openForNew} style={sceneFabStyle}>+</button>

      {open ? (
        <div style={sceneOverlayStyle}>
          <div style={sceneSheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" style={sceneFieldStyle} />
              <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" style={sceneAreaStyle} />
              <div>
                <div style={{ color: C.ink, fontWeight: 600, marginBottom: 10 }}>Characters involved</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {characters.map((character) => {
                    const name = character.name ?? 'Unnamed character'
                    const selected = (form.charactersInvolved ?? []).includes(name)
                    return (
                      <label key={character.id} style={{ display: 'flex', gap: 10, color: C.inkSoft }}>
                        <input type="checkbox" checked={selected} onChange={() => toggleCharacter(name)} />
                        <span>{name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={sceneFieldStyle}>
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name ?? ''}>
                    {location.name ?? 'Unnamed location'}
                  </option>
                ))}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={sceneFieldStyle}>
                {sceneStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button type="button" onClick={() => void handleSave()} style={sceneSaveButtonStyle}>Save</button>
              <button type="button" onClick={() => setOpen(false)} style={sceneCancelButtonStyle}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  )
}

const sceneFieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
}

const sceneAreaStyle = {
  ...sceneFieldStyle,
  minHeight: 110,
  resize: 'vertical' as const,
}

const sceneCardStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: C.card,
  border: 0,
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
}

const sceneFabStyle = {
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

const sceneOverlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(47,53,69,0.22)',
  display: 'flex',
  alignItems: 'flex-end',
}

const sceneSheetStyle = {
  width: '100%',
  maxWidth: 430,
  margin: '0 auto',
  background: 'white',
  borderRadius: '20px 20px 0 0',
  padding: 24,
  maxHeight: '90dvh',
  overflowY: 'auto' as const,
}

const sceneSaveButtonStyle = {
  width: '100%',
  border: 0,
  borderRadius: 10,
  padding: 14,
  background: C.ink,
  color: 'white',
  fontWeight: 600,
}

const sceneCancelButtonStyle = {
  border: 0,
  background: 'transparent',
  color: C.inkMuted,
  padding: 6,
}
