import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { Scene } from '../types/bookBuddy';

const statuses = ['Draft', 'Written', 'Revised'];

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
};

const areaStyle = {
  ...fieldStyle,
  minHeight: 110,
  resize: 'vertical' as const,
};

export function ScenesPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<Scene>({
    id: '',
    title: '',
    summary: '',
    charactersInvolved: [],
    location: '',
    status: 'Draft',
  });

  const scenes = useMemo(() => project?.scenes ?? [], [project]);
  const characters = useMemo(() => project?.characters ?? [], [project]);
  const locations = useMemo(() => project?.locations ?? [], [project]);

  function openForNew() {
    setEditingId(null);
    setStatus('');
    setForm({
      id: crypto.randomUUID(),
      title: '',
      summary: '',
      charactersInvolved: [],
      location: '',
      status: 'Draft',
    });
    setOpen(true);
  }

  function openForEdit(scene: Scene) {
    setEditingId(scene.id);
    setStatus('');
    setForm({
      id: scene.id,
      title: scene.title ?? '',
      summary: scene.summary ?? '',
      charactersInvolved: scene.charactersInvolved ?? [],
      location: scene.location ?? '',
      status: scene.status ?? 'Draft',
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!project || !session?.user.id) {
      return;
    }

    setSaving(true);
    setStatus('');
    try {
      const nextScenes = editingId
        ? scenes.map((item) => (item.id === editingId ? form : item))
        : [...scenes, form];

      await saveNormalizedProject(
        {
          ...project,
          scenes: nextScenes,
        },
        session.user.id,
      );
      await reload();
      setOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save scene.');
    } finally {
      setSaving(false);
    }
  }

  function toggleCharacter(name: string) {
    const current = form.charactersInvolved ?? [];
    setForm({
      ...form,
      charactersInvolved: current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    });
  }

  return (
    <ProjectGate title="Scenes">
      <div style={{ display: 'grid', gap: 12 }}>
        {scenes.map((scene) => (
          <button key={scene.id} type="button" onClick={() => openForEdit(scene)} style={cardButtonStyle}>
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>
              {scene.title || 'Untitled scene'}
            </div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
              {excerptText(scene.summary || '', 'Tap to add scene notes.', 180)}
            </div>
          </button>
        ))}
      </div>

      <button type="button" onClick={openForNew} style={fabStyle}>+</button>

      {open ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Title"
                style={fieldStyle}
              />
              <textarea
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                placeholder="Summary"
                style={areaStyle}
              />
              <div>
                <div style={{ color: C.ink, fontWeight: 600, marginBottom: 10 }}>Characters involved</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {characters.map((character) => {
                    const name = character.name || 'Unnamed character';
                    const selected = (form.charactersInvolved ?? []).includes(name);
                    return (
                      <label key={character.id} style={{ display: 'flex', gap: 10, color: C.inkSoft }}>
                        <input type="checkbox" checked={selected} onChange={() => toggleCharacter(name)} />
                        <span>{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <select
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                style={fieldStyle}
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name || ''}>
                    {location.name || 'Unnamed location'}
                  </option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                style={fieldStyle}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <button type="button" onClick={() => void handleSave()} disabled={saving} style={saveButtonStyle}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={cancelButtonStyle}>Cancel</button>
              {status ? <div style={{ color: C.coral, fontSize: 13 }}>{status}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </ProjectGate>
  );
}

const cardButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: C.card,
  border: 0,
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
};

const fabStyle = {
  position: 'fixed' as const,
  right: 'max(calc((100vw - 520px) / 2 + 16px), 16px)',
  bottom: '24px',
  width: 56,
  height: 56,
  borderRadius: '50%',
  border: 0,
  background: C.ink,
  color: 'white',
  fontSize: '1.7rem',
  boxShadow: '0 10px 24px rgba(47,53,69,0.2)',
};

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(47,53,69,0.22)',
  display: 'flex',
  alignItems: 'flex-end',
  zIndex: 10,
};

const sheetStyle = {
  width: '100%',
  maxWidth: 520,
  margin: '0 auto',
  background: 'white',
  borderRadius: '20px 20px 0 0',
  padding: 24,
  maxHeight: '90dvh',
  overflowY: 'auto' as const,
};

const saveButtonStyle = {
  width: '100%',
  border: 0,
  borderRadius: 10,
  padding: 14,
  background: C.ink,
  color: 'white',
  fontWeight: 600,
};

const cancelButtonStyle = {
  border: 0,
  background: 'transparent',
  color: C.inkMuted,
  padding: 6,
};
