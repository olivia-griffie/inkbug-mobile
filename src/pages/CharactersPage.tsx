import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { Character } from '../types/bookBuddy';

const characterTypes = [
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

function blankCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    appearance: '',
    background: '',
    secrets: '',
    desires: '',
    other: '',
    typeTags: [],
  };
}

function characterExcerpt(c: Character) {
  return (
    c.background ||
    c.appearance ||
    c.desires ||
    c.secrets ||
    c.other ||
    c.backstory ||
    c.physicalDescription ||
    c.motivations ||
    ''
  );
}

function resolveTypeTags(c: Character): string[] {
  if (c.typeTags && c.typeTags.length > 0) return c.typeTags;
  if (c.role) return [c.role];
  return [];
}

export function CharactersPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<Character>(blankCharacter());

  const characters = useMemo(() => project?.characters ?? [], [project]);

  function openForNew() {
    setEditingId(null);
    setStatus('');
    setForm(blankCharacter());
    setOpen(true);
  }

  function openForEdit(character: Character) {
    setEditingId(character.id);
    setStatus('');
    setForm({
      ...blankCharacter(),
      ...character,
      typeTags: resolveTypeTags(character),
    });
    setOpen(true);
  }

  function toggleType(type: string) {
    const current = form.typeTags ?? [];
    setForm({
      ...form,
      typeTags: current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    });
  }

  async function handleSave() {
    if (!project || !session?.user.id) return;

    setSaving(true);
    setStatus('');
    try {
      const nextCharacters = editingId
        ? characters.map((item) => (item.id === editingId ? form : item))
        : [...characters, form];

      await saveNormalizedProject(
        { ...project, characters: nextCharacters },
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

  async function handleDelete() {
    if (!project || !session?.user.id || !editingId) return;

    setSaving(true);
    setStatus('');
    try {
      await saveNormalizedProject(
        { ...project, characters: characters.filter((c) => c.id !== editingId) },
        session.user.id,
      );
      await reload();
      setOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not delete character.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProjectGate title="Characters">
      <button type="button" onClick={openForNew} style={addButtonStyle}>
        + Add character
      </button>

      <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
        {!characters.length ? (
          <div style={{ color: C.inkMuted, fontSize: 14, padding: '12px 4px' }}>
            No characters yet. Add one above.
          </div>
        ) : null}
        {characters.map((character) => (
          <button
            key={character.id}
            type="button"
            onClick={() => openForEdit(character)}
            style={cardButtonStyle}
          >
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 4 }}>
              {character.name || 'Untitled character'}
            </div>
            {resolveTypeTags(character).length > 0 ? (
              <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {resolveTypeTags(character).join(', ')}
              </div>
            ) : null}
            <div style={{ color: C.inkSoft, lineHeight: 1.5, fontSize: 14 }}>
              {excerptText(characterExcerpt(character), 'Tap to add details.', 180)}
            </div>
          </button>
        ))}
      </div>

      {open ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {editingId ? 'Edit character' : 'New character'}
                </div>
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={saving}
                    style={{ border: 0, background: 'transparent', color: C.coral, fontWeight: 700, fontSize: 13 }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                style={fieldStyle}
              />

              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 8 }}>Character type</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {characterTypes.map((type) => {
                    const active = (form.typeTags ?? []).includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        style={{
                          border: `1px solid ${active ? C.coral : C.border}`,
                          borderRadius: 999,
                          padding: '8px 12px',
                          background: active ? 'rgba(255,106,90,0.12)' : 'white',
                          color: active ? C.coral : C.inkSoft,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Appearance</div>
                <textarea
                  value={form.appearance ?? ''}
                  onChange={(e) => setForm({ ...form, appearance: e.target.value })}
                  placeholder="Physical appearance"
                  style={areaStyle}
                />
              </div>

              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Background</div>
                <textarea
                  value={form.background ?? ''}
                  onChange={(e) => setForm({ ...form, background: e.target.value })}
                  placeholder="Backstory and history"
                  style={areaStyle}
                />
              </div>

              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Secrets</div>
                <textarea
                  value={form.secrets ?? ''}
                  onChange={(e) => setForm({ ...form, secrets: e.target.value })}
                  placeholder="What are they hiding?"
                  style={areaStyle}
                />
              </div>

              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Desires</div>
                <textarea
                  value={form.desires ?? ''}
                  onChange={(e) => setForm({ ...form, desires: e.target.value })}
                  placeholder="What do they want?"
                  style={areaStyle}
                />
              </div>

              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Other notes</div>
                <textarea
                  value={form.other ?? ''}
                  onChange={(e) => setForm({ ...form, other: e.target.value })}
                  placeholder="Anything else"
                  style={areaStyle}
                />
              </div>

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

const addButtonStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: '14px 18px',
  background: 'white',
  color: C.ink,
  fontWeight: 700,
  textAlign: 'left' as const,
};

const cardButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: C.card,
  border: 0,
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
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
