import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { PlotSection } from '../types/bookBuddy';

const types = ['Act', 'Chapter', 'Scene'];
const statuses = ['Draft', 'In Progress', 'Complete'];

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

export function PlotPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<PlotSection>({
    id: '',
    title: '',
    name: '',
    type: 'Act',
    summary: '',
    targetWords: 0,
    status: 'Draft',
  });

  const plotSections = useMemo(() => project?.plotSections ?? [], [project]);

  function openForNew() {
    setEditingId(null);
    setStatus('');
    setForm({
      id: crypto.randomUUID(),
      title: '',
      name: '',
      type: 'Act',
      summary: '',
      targetWords: 0,
      status: 'Draft',
    });
    setOpen(true);
  }

  function openForEdit(section: PlotSection) {
    setEditingId(section.id);
    setStatus('');
    setForm({
      id: section.id,
      title: section.title ?? section.name ?? '',
      name: section.name ?? section.title ?? '',
      type: section.type ?? 'Act',
      summary: section.summary ?? '',
      targetWords: section.targetWords ?? 0,
      status: section.status ?? 'Draft',
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
      const nextSection = {
        ...form,
        title: form.title || form.name || '',
        name: form.name || form.title || '',
        label: form.name || form.title || '',
      };

      const nextSections = editingId
        ? plotSections.map((item) => (item.id === editingId ? nextSection : item))
        : [...plotSections, nextSection];

      await saveNormalizedProject(
        {
          ...project,
          plotSections: nextSections,
        },
        session.user.id,
      );
      await reload();
      setOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save section target.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProjectGate title="Plot">
      <div style={{ display: 'grid', gap: 12 }}>
        {plotSections.map((section, index) => (
          <button key={section.id} type="button" onClick={() => openForEdit(section)} style={cardButtonStyle}>
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>
              {section.title || section.name || `Section Target ${index + 1}`}
            </div>
            <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
              {excerptText(section.summary || section.description || section.notes || '', 'Tap to add a summary.', 180)}
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
                value={form.name || form.title || ''}
                onChange={(event) => setForm({ ...form, name: event.target.value, title: event.target.value })}
                placeholder="Section name"
                style={fieldStyle}
              />
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                style={fieldStyle}
              >
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <textarea
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                placeholder="Summary"
                style={areaStyle}
              />
              <input
                type="number"
                value={form.targetWords ?? 0}
                onChange={(event) => setForm({ ...form, targetWords: Number(event.target.value) || 0 })}
                placeholder="Target words"
                style={fieldStyle}
              />
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
