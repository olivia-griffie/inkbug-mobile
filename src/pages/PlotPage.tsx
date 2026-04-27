import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { PlotSection, PlotWorkbook } from '../types/bookBuddy';

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
  const [savingWorkbook, setSavingWorkbook] = useState(false);
  const [status, setStatus] = useState('');
  const [workbookStatus, setWorkbookStatus] = useState('');
  const [form, setForm] = useState<PlotSection>({
    id: '',
    title: '',
    name: '',
    type: 'Act',
    summary: '',
    targetWords: 0,
    status: 'Draft',
  });
  const [workbook, setWorkbook] = useState<PlotWorkbook>({
    outline: '',
    premise: '',
    stakes: '',
    notes: '',
  });
  const [workbookOpen, setWorkbookOpen] = useState(false);

  const plotSections = useMemo(() => project?.plotSections ?? [], [project]);
  const chapters = useMemo(() => project?.chapters ?? [], [project]);

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
      chapterIds: [],
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
      chapterIds: section.chapterIds ?? [],
    });
    setOpen(true);
  }

  function openWorkbook() {
    setWorkbook({
      outline: project?.plotWorkbook?.outline ?? '',
      premise: project?.plotWorkbook?.premise ?? '',
      stakes: project?.plotWorkbook?.stakes ?? '',
      notes: project?.plotWorkbook?.notes ?? '',
    });
    setWorkbookStatus('');
    setWorkbookOpen(true);
  }

  function toggleChapterInSection(chapterId: string) {
    const current = form.chapterIds ?? [];
    setForm({
      ...form,
      chapterIds: current.includes(chapterId)
        ? current.filter((item) => item !== chapterId)
        : [...current, chapterId],
    });
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

  async function handleWorkbookSave() {
    if (!project || !session?.user.id) {
      return;
    }

    setSavingWorkbook(true);
    setWorkbookStatus('');
    try {
      await saveNormalizedProject(
        {
          ...project,
          plotWorkbook: workbook,
        },
        session.user.id,
      );
      await reload();
      setWorkbookOpen(false);
    } catch (error) {
      setWorkbookStatus(error instanceof Error ? error.message : 'Could not save workbook.');
    } finally {
      setSavingWorkbook(false);
    }
  }

  const wb = project?.plotWorkbook;
  const workbookHasContent = wb?.outline || wb?.premise || wb?.stakes || wb?.notes;

  return (
    <ProjectGate title="Plot">
      <button
        type="button"
        onClick={openWorkbook}
        style={{
          width: '100%',
          textAlign: 'left' as const,
          background: C.card,
          border: 0,
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
          marginBottom: 12,
        }}
      >
        <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Plot workbook</div>
        <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>Outline, Premise & Stakes</div>
        <div style={{ color: C.inkSoft, lineHeight: 1.5, fontSize: 14 }}>
          {workbookHasContent
            ? excerptText(wb?.premise || wb?.outline || wb?.stakes || wb?.notes || '', '', 160)
            : 'Tap to add your story outline, premise, stakes, and notes.'}
        </div>
      </button>

      <div style={{ display: 'grid', gap: 12 }}>
        {plotSections.map((section, index) => {
          const linkedChapterCount = section.chapterIds?.length ?? 0;
          return (
            <button key={section.id} type="button" onClick={() => openForEdit(section)} style={cardButtonStyle}>
              <div style={{ color: C.ink, fontWeight: 600, marginBottom: 6 }}>
                {section.title || section.name || `Section Target ${index + 1}`}
              </div>
              {linkedChapterCount > 0 ? (
                <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {linkedChapterCount} chapter{linkedChapterCount !== 1 ? 's' : ''} linked
                </div>
              ) : null}
              <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>
                {excerptText(section.summary || section.description || section.notes || '', 'Tap to add a summary.', 180)}
              </div>
            </button>
          );
        })}
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
              {chapters.length > 0 ? (
                <div>
                  <div style={{ color: C.ink, fontWeight: 600, marginBottom: 10 }}>Linked chapters</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {chapters.map((chapter, index) => {
                      const label = chapter.title || `Chapter ${index + 1}`;
                      const selected = (form.chapterIds ?? []).includes(chapter.id);
                      return (
                        <label key={chapter.id} style={{ display: 'flex', gap: 10, color: C.inkSoft }}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleChapterInSection(chapter.id)}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <button type="button" onClick={() => void handleSave()} disabled={saving} style={saveButtonStyle}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={cancelButtonStyle}>Cancel</button>
              {status ? <div style={{ color: C.coral, fontSize: 13 }}>{status}</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {workbookOpen ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ color: C.ink, fontWeight: 700, fontSize: 16 }}>Plot workbook</div>
              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Outline</div>
                <textarea
                  value={workbook.outline ?? ''}
                  onChange={(event) => setWorkbook({ ...workbook, outline: event.target.value })}
                  placeholder="High-level story outline"
                  style={areaStyle}
                />
              </div>
              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Premise</div>
                <textarea
                  value={workbook.premise ?? ''}
                  onChange={(event) => setWorkbook({ ...workbook, premise: event.target.value })}
                  placeholder="What is this story about?"
                  style={areaStyle}
                />
              </div>
              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Stakes</div>
                <textarea
                  value={workbook.stakes ?? ''}
                  onChange={(event) => setWorkbook({ ...workbook, stakes: event.target.value })}
                  placeholder="What does the protagonist stand to lose?"
                  style={areaStyle}
                />
              </div>
              <div>
                <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>Notes</div>
                <textarea
                  value={workbook.notes ?? ''}
                  onChange={(event) => setWorkbook({ ...workbook, notes: event.target.value })}
                  placeholder="Any other plot notes"
                  style={areaStyle}
                />
              </div>
              <button type="button" onClick={() => void handleWorkbookSave()} disabled={savingWorkbook} style={saveButtonStyle}>
                {savingWorkbook ? 'Saving...' : 'Save workbook'}
              </button>
              <button type="button" onClick={() => setWorkbookOpen(false)} style={cancelButtonStyle}>Cancel</button>
              {workbookStatus ? <div style={{ color: C.coral, fontSize: 13 }}>{workbookStatus}</div> : null}
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
