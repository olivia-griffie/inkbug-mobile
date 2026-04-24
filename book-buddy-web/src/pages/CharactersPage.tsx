import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { TopBar } from '../components/TopBar'
import type { Character } from '../lib/api'
import { excerptRichText } from '../lib/richText'
import { useProjects } from '../store/useProjectStore'
import { C } from '../styles/tokens'

const roles = ['Protagonist', 'Antagonist', 'Supporting', 'Minor']

function excerptFromCharacter(character: Character) {
  return excerptRichText(
    character.motivations ||
      character.backstory ||
      character.physicalDescription ||
      '',
    'Tap to add details.'
  )
}

export function CharactersPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { projects, activeProject, setActiveProject, saveActiveProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Character>({
    id: '',
    name: '',
    role: 'Supporting',
    age: '',
    physicalDescription: '',
    backstory: '',
    motivations: '',
  })

  const project = useMemo(
    () => projects.find((item) => item.id === id) ?? activeProject,
    [id, projects, activeProject]
  )

  useEffect(() => {
    if (project) setActiveProject(project)
  }, [project, setActiveProject])

  if (!project) return <div style={{ padding: 16 }}>Project not found.</div>

  const characters = Array.isArray(project.characters) ? project.characters : []

  function openForNew() {
    setEditingId(null)
    setForm({
      id: crypto.randomUUID(),
      name: '',
      role: 'Supporting',
      age: '',
      physicalDescription: '',
      backstory: '',
      motivations: '',
    })
    setOpen(true)
  }

  function openForEdit(character: Character) {
    setEditingId(character.id)
    setForm({
      id: character.id,
      name: character.name ?? '',
      role: character.role ?? 'Supporting',
      age: character.age ?? '',
      physicalDescription: character.physicalDescription ?? '',
      backstory: character.backstory ?? '',
      motivations: character.motivations ?? '',
    })
    setOpen(true)
  }

  async function handleSave() {
    const nextCharacters = editingId
      ? characters.map((item) => (item.id === editingId ? form : item))
      : [...characters, form]

    await saveActiveProject({
      ...project,
      characters: nextCharacters,
    })

    setOpen(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, paddingBottom: '96px' }}>
      <TopBar
        title="Characters"
        left={<button type="button" onClick={() => navigate(-1)} style={{ border: 0, background: 'transparent', color: C.ink }}>Back</button>}
      />

      <div style={{ display: 'grid', gap: 12, padding: '20px 16px 0' }}>
        {characters.map((character) => (
          <button
            key={character.id}
            type="button"
            onClick={() => openForEdit(character)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: C.card,
              border: 0,
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
            }}
          >
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>
              {character.name || 'Untitled character'}
            </div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>{excerptFromCharacter(character)}</div>
          </button>
        ))}
      </div>

      <button type="button" onClick={openForNew} style={fabStyle}>+</button>

      {open ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" style={fieldStyle} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={fieldStyle}>
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" style={fieldStyle} />
              <textarea value={form.physicalDescription} onChange={(e) => setForm({ ...form, physicalDescription: e.target.value })} placeholder="Physical description" style={areaStyle} />
              <textarea value={form.backstory} onChange={(e) => setForm({ ...form, backstory: e.target.value })} placeholder="Backstory" style={areaStyle} />
              <textarea value={form.motivations} onChange={(e) => setForm({ ...form, motivations: e.target.value })} placeholder="Motivations" style={areaStyle} />
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
  minHeight: 100,
  resize: 'vertical' as const,
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
