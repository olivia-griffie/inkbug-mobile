import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { Character } from '../types/bookBuddy';

const roles = [
  'Protagonist',
  'Antagonist',
  'Love Interest',
  'Confidant',
  'Deuteragonist',
  'Tertiary Character',
  'Foil',
];

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
  minHeight: 100,
  resize: 'vertical' as const,
};

export function CharactersPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<Character>({
    id: '',
    name: '',
    role: 'Supporting',
    age: '',
    physicalDescription: '',
    backstory: '',
    motivations: '',
  });

  const characters = useMemo(() => project?.characters ?? [], [project]);

  function openForNew() {
    setEditingId(null);
    setStatus('');
    setForm({
      id: crypto.randomUUID(),
      name: '',
      role: 'Supporting',
      age: '',
      physicalDescription: '',
      backstory: '',
      motivations: '',
    });
    setOpen(true);
  }

  function openForEdit(character: Character) {
    setEditingId(character.id);
    setStatus('');
    setForm({
      id: character.id,
      name: character.name ?? '',
      role: character.role ?? 'Supporting',
      age: character.age ?? '',
      physicalDescription: character.physicalDescription ?? '',
      backstory: character.backstory ?? '',
      motivations: character.motivations ?? '',
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
      const nextCharacters = editingId
        ? characters.map((item) => (item.id === editingId ? form : item))
        : [...characters, form];

      await saveNormalizedProject(
        {
          ...project,
          characters: nextCharacters,
        },
        session.user.id,
      );
      await reload();
      setOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save character.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProjectGate title="Characters">
      <div style={{ display: 'grid', gap: 12 }}>
        {characters.map((character) => (
          <button
            key={character.id}
            type="button"
            onClick={() => openForEdit(character)}
            style={cardButtonStyle}
          >
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>
              {character.name || 'Untitled character'}
            </div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
              {excerptText(
                character.motivations || character.backstory || character.physicalDescription || '',
                'Tap to add details.',
                180,
              )}
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
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Name"
                style={fieldStyle}
              />
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                style={fieldStyle}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <input
                value={form.age}
                onChange={(event) => setForm({ ...form, age: event.target.value })}
                placeholder="Age"
                style={fieldStyle}
              />
              <textarea
                value={form.physicalDescription}
                onChange={(event) => setForm({ ...form, physicalDescription: event.target.value })}
                placeholder="Physical description"
                style={areaStyle}
              />
              <textarea
                value={form.backstory}
                onChange={(event) => setForm({ ...form, backstory: event.target.value })}
                placeholder="Backstory"
                style={areaStyle}
              />
              <textarea
                value={form.motivations}
                onChange={(event) => setForm({ ...form, motivations: event.target.value })}
                placeholder="Motivations"
                style={areaStyle}
              />
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
