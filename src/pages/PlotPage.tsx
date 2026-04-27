import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { saveNormalizedProject } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';
import { PlotSection } from '../types/bookBuddy';

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
  boxSizing: 'border-box' as const,
};

const areaStyle = {
  ...fieldStyle,
  minHeight: 110,
  resize: 'vertical' as const,
};

const sectionLabelStyle = {
  color: C.inkMuted,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
};

export function PlotPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);

  // --- Workbook state ---
  const [outline, setOutline] = useState('');
  const [premise, setPremise] = useState('');
  const [stakes, setStakes] = useState('');
  const [notes, setNotes] = useState('');
  const [savingWorkbook, setSavingWorkbook] = useState(false);
  const [workbookStatus, setWorkbookStatus] = useState('');

  // --- Tags state ---
  const [tagInput, setTagInput] = useState('');
  const [savingTags, setSavingTags] = useState(false);
  const [tagsStatus, setTagsStatus] = useState('');

  // --- Section editor state ---
  const [sectionOpen, setSectionOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState(false);
  const [sectionStatus, setSectionStatus] = useState('');
  const [form, setForm] = useState<PlotSection & { linkedChapterIds: string[] }>({
    id: '',
    title: '',
    name: '',
    description: '',
    notes: '',
    targetWords: 0,
    linkedChapterIds: [],
  });

  // Sync workbook fields when project loads
  useEffect(() => {
    if (project) {
      setOutline(project.plotWorkbook?.outline ?? '');
      setPremise(project.plotWorkbook?.premise ?? '');
      setStakes(project.plotWorkbook?.stakes ?? '');
      setNotes(project.plotWorkbook?.notes ?? '');
      setTagInput((project.tags ?? []).join(', '));
    }
  }, [project?.id]);

  const plotSections = useMemo(() => project?.plotSections ?? [], [project]);
  const chapters = useMemo(() => project?.chapters ?? [], [project]);

  // Derive linked chapters per section using chapter.sectionId (desktop format) + section.chapterIds (mobile fallback)
  function getLinkedChapterIds(section: PlotSection): string[] {
    const fromSectionId = chapters
      .filter((c) => c.sectionId === section.id)
      .map((c) => c.id);
    const fromChapterIds = section.chapterIds ?? [];
    return [...new Set([...fromSectionId, ...fromChapterIds])];
  }

  function getLinkedWordCount(linkedIds: string[]): number {
    return chapters
      .filter((c) => linkedIds.includes(c.id))
      .reduce((sum, c) => {
        const text = (c.body || c.content || '').replace(/<[^>]+>/g, ' ');
        return sum + text.split(/\s+/).filter(Boolean).length;
      }, 0);
  }

  async function handleWorkbookSave() {
    if (!project || !session?.user.id) return;
    setSavingWorkbook(true);
    setWorkbookStatus('');
    try {
      await saveNormalizedProject(
        { ...project, plotWorkbook: { outline, premise, stakes, notes } },
        session.user.id,
      );
      await reload();
      setWorkbookStatus('Workbook saved.');
    } catch (error) {
      setWorkbookStatus(error instanceof Error ? error.message : 'Could not save workbook.');
    } finally {
      setSavingWorkbook(false);
    }
  }

  function handleGenerateOutline() {
    const lines: string[] = [];
    for (const section of plotSections) {
      const label = section.title || section.name || section.label || 'Untitled section';
      lines.push(`**${label}**`);
      if (section.description || section.summary) {
        lines.push(section.description || section.summary || '');
      }
      if (section.targetWords) {
        lines.push(`Target: ${section.targetWords.toLocaleString()} words`);
      }
      const linked = getLinkedChapterIds(section);
      if (linked.length) {
        const chapterTitles = linked
          .map((cid) => chapters.find((c) => c.id === cid)?.title)
          .filter(Boolean)
          .join(', ');
        lines.push(`Chapters: ${chapterTitles}`);
      }
      lines.push('');
    }
    setOutline(lines.join('\n'));
    setWorkbookStatus('Outline generated — save to keep it.');
  }

  async function handleTagsSave() {
    if (!project || !session?.user.id) return;
    setSavingTags(true);
    setTagsStatus('');
    try {
      const nextTags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await saveNormalizedProject({ ...project, tags: nextTags }, session.user.id);
      await reload();
      setTagsStatus('Tags saved.');
    } catch (error) {
      setTagsStatus(error instanceof Error ? error.message : 'Could not save tags.');
    } finally {
      setSavingTags(false);
    }
  }

  function openForNew() {
    setEditingId(null);
    setSectionStatus('');
    setForm({
      id: crypto.randomUUID(),
      title: '',
      name: '',
      description: '',
      notes: '',
      targetWords: 0,
      linkedChapterIds: [],
    });
    setSectionOpen(true);
  }

  function openForEdit(section: PlotSection) {
    setEditingId(section.id);
    setSectionStatus('');
    setForm({
      ...section,
      title: section.title || section.name || section.label || '',
      name: section.name || section.title || '',
      description: section.description || section.summary || '',
      notes: section.notes || '',
      targetWords: section.targetWords ?? 0,
      linkedChapterIds: getLinkedChapterIds(section),
    });
    setSectionOpen(true);
  }

  function toggleChapterLink(chapterId: string) {
    const current = form.linkedChapterIds;
    setForm({
      ...form,
      linkedChapterIds: current.includes(chapterId)
        ? current.filter((c) => c !== chapterId)
        : [...current, chapterId],
    });
  }

  async function handleSaveSection() {
    if (!project || !session?.user.id) return;
    setSavingSection(true);
    setSectionStatus('');
    try {
      const label = form.title || form.name || '';
      const nextSection: PlotSection = {
        ...form,
        title: label,
        name: label,
        label,
        description: form.description,
        notes: form.notes,
        summary: form.description,
        chapterIds: form.linkedChapterIds,
      };

      const nextSections = editingId
        ? plotSections.map((s) => (s.id === editingId ? nextSection : s))
        : [...plotSections, nextSection];

      // Update chapter.sectionId to match the desktop's linking format
      const nextChapters = chapters.map((chapter) => {
        if (form.linkedChapterIds.includes(chapter.id)) {
          return { ...chapter, sectionId: nextSection.id };
        }
        // Unlink if it was previously linked to this section but no longer
        if (editingId && chapter.sectionId === editingId && !form.linkedChapterIds.includes(chapter.id)) {
          return { ...chapter, sectionId: '' };
        }
        return chapter;
      });

      await saveNormalizedProject(
        { ...project, plotSections: nextSections, chapters: nextChapters },
        session.user.id,
      );
      await reload();
      setSectionOpen(false);
    } catch (error) {
      setSectionStatus(error instanceof Error ? error.message : 'Could not save section.');
    } finally {
      setSavingSection(false);
    }
  }

  async function handleDeleteSection() {
    if (!project || !session?.user.id || !editingId) return;
    setSavingSection(true);
    setSectionStatus('');
    try {
      // Unlink any chapters linked to this section
      const nextChapters = chapters.map((chapter) =>
        chapter.sectionId === editingId ? { ...chapter, sectionId: '' } : chapter,
      );
      await saveNormalizedProject(
        {
          ...project,
          plotSections: plotSections.filter((s) => s.id !== editingId),
          chapters: nextChapters,
        },
        session.user.id,
      );
      await reload();
      setSectionOpen(false);
    } catch (error) {
      setSectionStatus(error instanceof Error ? error.message : 'Could not delete section.');
    } finally {
      setSavingSection(false);
    }
  }

  if (!project) return <ProjectGate />;

  return (
    <ProjectGate title="Plot">
      {/* Workbook */}
      <div style={{ ...cardStyle, marginBottom: 14 }}>
        <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Plot workbook</div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={sectionLabelStyle}>Outline</div>
            <textarea
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="High-level story outline"
              style={areaStyle}
            />
          </div>
          <div>
            <div style={sectionLabelStyle}>Premise</div>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="What is this story about?"
              style={areaStyle}
            />
          </div>
          <div>
            <div style={sectionLabelStyle}>Stakes</div>
            <textarea
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              placeholder="What does the protagonist stand to lose?"
              style={areaStyle}
            />
          </div>
          <div>
            <div style={sectionLabelStyle}>Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other plot notes"
              style={areaStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button type="button" onClick={() => void handleWorkbookSave()} disabled={savingWorkbook} style={primaryButtonStyle}>
            {savingWorkbook ? 'Saving...' : 'Save workbook'}
          </button>
          <button type="button" onClick={handleGenerateOutline} style={ghostButtonStyle}>
            Generate outline
          </button>
        </div>
        {workbookStatus ? <div style={{ color: C.coral, fontSize: 13, marginTop: 8 }}>{workbookStatus}</div> : null}
      </div>

      {/* Tags */}
      <div style={{ ...cardStyle, marginBottom: 14 }}>
        <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Community tags</div>
        <div style={{ color: C.inkMuted, fontSize: 13, marginBottom: 10 }}>
          Tags help readers find your story in the community feed.
        </div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="fantasy, romance, enemies-to-lovers..."
          style={{ ...fieldStyle, marginBottom: 10 }}
        />
        <button type="button" onClick={() => void handleTagsSave()} disabled={savingTags} style={primaryButtonStyle}>
          {savingTags ? 'Saving...' : 'Save tags'}
        </button>
        {tagsStatus ? <div style={{ color: C.coral, fontSize: 13, marginTop: 8 }}>{tagsStatus}</div> : null}
      </div>

      {/* Section targets */}
      <div style={{ color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Section targets</div>
      <div style={{ display: 'grid', gap: 12, marginBottom: 80 }}>
        {!plotSections.length ? (
          <div style={{ color: C.inkMuted, fontSize: 14 }}>
            No section targets yet. Add one with the + button.
          </div>
        ) : null}
        {plotSections.map((section, index) => {
          const linkedIds = getLinkedChapterIds(section);
          const wordCount = getLinkedWordCount(linkedIds);
          return (
            <button key={section.id} type="button" onClick={() => openForEdit(section)} style={cardButtonStyle}>
              <div style={{ color: C.ink, fontWeight: 600, marginBottom: 4 }}>
                {section.title || section.name || section.label || `Section ${index + 1}`}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                {linkedIds.length > 0 ? (
                  <span style={{ color: C.coral, fontSize: 12, fontWeight: 700 }}>
                    {linkedIds.length} chapter{linkedIds.length !== 1 ? 's' : ''} linked
                  </span>
                ) : null}
                {section.targetWords ? (
                  <span style={{ color: C.inkMuted, fontSize: 12 }}>
                    {wordCount.toLocaleString()} / {section.targetWords.toLocaleString()} words
                  </span>
                ) : null}
              </div>
              <div style={{ color: C.inkSoft, lineHeight: 1.5, fontSize: 14 }}>
                {excerptText(section.description || section.summary || section.notes || '', 'Tap to add details.', 180)}
              </div>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={openForNew} style={fabStyle}>+</button>

      {/* Section editor sheet */}
      {sectionOpen ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {editingId ? 'Edit section' : 'New section'}
                </div>
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => void handleDeleteSection()}
                    disabled={savingSection}
                    style={{ border: 0, background: 'transparent', color: C.coral, fontWeight: 700, fontSize: 13 }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>

              <input
                value={form.title || form.name || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value, name: e.target.value })}
                placeholder="Section name (e.g. Act 1, Rising Action)"
                style={fieldStyle}
              />

              <div>
                <div style={sectionLabelStyle}>Guidance / description</div>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What happens in this section?"
                  style={areaStyle}
                />
              </div>

              <div>
                <div style={sectionLabelStyle}>Notes</div>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
                  style={{ ...areaStyle, minHeight: 80 }}
                />
              </div>

              <div>
                <div style={sectionLabelStyle}>Target word count</div>
                <input
                  type="number"
                  value={form.targetWords ?? 0}
                  onChange={(e) => setForm({ ...form, targetWords: Number(e.target.value) || 0 })}
                  placeholder="0"
                  step={100}
                  style={fieldStyle}
                />
              </div>

              {chapters.length > 0 ? (
                <div>
                  <div style={sectionLabelStyle}>Linked chapters</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {chapters.map((chapter, index) => {
                      const label = chapter.title || `Chapter ${index + 1}`;
                      const selected = form.linkedChapterIds.includes(chapter.id);
                      return (
                        <label key={chapter.id} style={{ display: 'flex', gap: 10, color: C.inkSoft, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleChapterLink(chapter.id)}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleSaveSection()}
                disabled={savingSection}
                style={saveButtonStyle}
              >
                {savingSection ? 'Saving...' : 'Save section'}
              </button>
              <button type="button" onClick={() => setSectionOpen(false)} style={cancelButtonStyle}>Cancel</button>
              {sectionStatus ? <div style={{ color: C.coral, fontSize: 13 }}>{sectionStatus}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </ProjectGate>
  );
}

const cardStyle = {
  padding: 18,
  borderRadius: 22,
  border: `1px solid rgba(47,53,69,0.08)`,
  background: 'rgba(255,255,255,0.95)',
  boxShadow: '0 4px 12px rgba(47,53,69,0.05)',
};

const cardButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: 'rgba(255,255,255,0.95)',
  border: `1px solid rgba(47,53,69,0.08)`,
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 4px 12px rgba(47,53,69,0.05)',
};

const primaryButtonStyle = {
  border: 0,
  borderRadius: 10,
  padding: '12px 18px',
  background: C.ink,
  color: 'white',
  fontWeight: 700,
  fontSize: 14,
};

const ghostButtonStyle = {
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 18px',
  background: 'white',
  color: C.ink,
  fontWeight: 700,
  fontSize: 14,
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
