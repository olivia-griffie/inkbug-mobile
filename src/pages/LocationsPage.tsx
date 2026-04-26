import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { LocationItem } from '../types/bookBuddy';

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

export function LocationsPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<LocationItem>({
    id: '',
    name: '',
    description: '',
    associatedChapters: [],
  });

  const locations = useMemo(() => project?.locations ?? [], [project]);
  const chapters = useMemo(() => project?.chapters ?? [], [project]);

  function openForNew() {
    setEditingId(null);
    setStatus('');
    setForm({ id: crypto.randomUUID(), name: '', description: '', associatedChapters: [] });
    setOpen(true);
  }

  function openForEdit(location: LocationItem) {
    setEditingId(location.id);
    setStatus('');
    setForm({
      id: location.id,
      name: location.name ?? '',
      description: location.description ?? '',
      associatedChapters: location.associatedChapters ?? [],
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
      const nextLocations = editingId
        ? locations.map((item) => (item.id === editingId ? form : item))
        : [...locations, form];

      await saveNormalizedProject(
        {
          ...project,
          locations: nextLocations,
        },
        session.user.id,
      );
      await reload();
      setOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save location.');
    } finally {
      setSaving(false);
    }
  }

  function toggleChapter(title: string) {
    const current = form.associatedChapters ?? [];
    setForm({
      ...form,
      associatedChapters: current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title],
    });
  }

  return (
    <ProjectGate title="Locations">
      <div style={{ display: 'grid', gap: 12 }}>
        {locations.map((location) => (
          <button key={location.id} type="button" onClick={() => openForEdit(location)} style={cardButtonStyle}>
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>
              {location.name || 'Untitled location'}
            </div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
              {excerptText(location.description || '', 'Tap to add details.', 180)}
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
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Description"
                style={areaStyle}
              />
              <div>
                <div style={{ color: C.ink, fontWeight: 600, marginBottom: 10 }}>Associated chapters</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {chapters.map((chapter, index) => {
                    const title = chapter.title || `Chapter ${index + 1}`;
                    const selected = (form.associatedChapters ?? []).includes(title);
                    return (
                      <label key={chapter.id} style={{ display: 'flex', gap: 10, color: C.inkSoft }}>
                        <input type="checkbox" checked={selected} onChange={() => toggleChapter(title)} />
                        <span>{title}</span>
                      </label>
                    );
                  })}
                </div>
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
