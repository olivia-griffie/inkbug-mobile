import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import type { PlotSection } from '../lib/api'
import { excerptRichText } from '../lib/richText'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

const types = ['Act', 'Chapter', 'Scene']
const statuses = ['Draft', 'In Progress', 'Complete']

export function PlotPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { projects, activeProject, setActiveProject, saveActiveProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlotSection>({
    id: '',
    name: '',
    type: 'Act',
    summary: '',
    targetWords: 0,
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
  const plotSections = Array.isArray(currentProject.plotSections) ? currentProject.plotSections : []

  function openForNew() {
    setEditingId(null)
    setForm({
      id: crypto.randomUUID(),
      name: '',
      type: 'Act',
      summary: '',
      targetWords: 0,
      status: 'Draft',
    })
    setOpen(true)
  }

  function openForEdit(item: PlotSection) {
    setEditingId(item.id)
    setForm({
      id: item.id,
      name: item.name ?? '',
      type: item.type ?? 'Act',
      summary: item.summary ?? '',
      targetWords: item.targetWords ?? 0,
      status: item.status ?? 'Draft',
    })
    setOpen(true)
  }

  async function handleSave() {
    const nextItems = editingId
      ? plotSections.map((item) => (item.id === editingId ? form : item))
      : [...plotSections, form]

    await saveActiveProject({
      ...currentProject,
      plotSections: nextItems,
    })

    setOpen(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button type="button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', fontSize: '1.2rem', color: C.ink }}>←</button>
        <div style={{ fontFamily: 'Lora, serif', fontSize: '1.45rem', color: C.ink }}>Plot</div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {plotSections.map((item) => (
          <button key={item.id} type="button" onClick={() => openForEdit(item)} style={cardButtonStyle}>
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>{item.name || 'Untitled section'}</div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
              {excerptRichText(item.summary || '', 'Tap to add a summary.')}
            </div>
          </button>
        ))}
      </div>

      <button type="button" onClick={openForNew} style={fabStyle}>+</button>

      {open ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Section name" style={fieldStyle} />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={fieldStyle}>
                {types.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" style={areaStyle} />
              <input type="number" value={form.targetWords ?? 0} onChange={(e) => setForm({ ...form, targetWords: Number(e.target.value) || 0 })} placeholder="Target words" style={fieldStyle} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={fieldStyle}>
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <button type="button" onClick={() => void handleSave()} style={saveButtonStyle}>Save</button>
              <button type="button" onClick={() => setOpen(false)} style={cancelButtonStyle}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
}

const areaStyle = {
  ...fieldStyle,
  minHeight: 110,
  resize: 'vertical' as const,
}

const cardButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: C.card,
  border: 0,
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
}

const fabStyle = {
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

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(47,53,69,0.22)',
  display: 'flex',
  alignItems: 'flex-end',
}

const sheetStyle = {
  width: '100%',
  maxWidth: 430,
  margin: '0 auto',
  background: 'white',
  borderRadius: '20px 20px 0 0',
  padding: 24,
  maxHeight: '90dvh',
  overflowY: 'auto' as const,
}

const saveButtonStyle = {
  width: '100%',
  border: 0,
  borderRadius: 10,
  padding: 14,
  background: C.ink,
  color: 'white',
  fontWeight: 600,
}

const cancelButtonStyle = {
  border: 0,
  background: 'transparent',
  color: C.inkMuted,
  padding: 6,
}
