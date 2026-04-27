import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { unpublishChapterWorkflow, publishChapterWorkflow, saveNormalizedProject } from '../lib/community';
import { findChapter } from '../lib/projectData';
import { cardStyle } from '../lib/ui';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
  boxSizing: 'border-box' as const,
};

export function ChapterEditorPage() {
  const { id, cid } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const chapter = project && cid ? findChapter(project, cid) : null;
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title ?? '');
      setBody(chapter.body || chapter.content || '');
      setDirty(false);
    }
  }, [chapter?.id]);

  const isPublished = chapter ? project?.publishedChapterIds.includes(chapter.id) : false;

  async function handlePublishToggle() {
    if (!project || !chapter || !session) return;

    setBusy(true);
    setMessage('');
    try {
      if (isPublished) {
        await unpublishChapterWorkflow(project, chapter.id, session);
        setMessage(`"${chapter.title || 'Chapter'}" unpublished.`);
      } else {
        await publishChapterWorkflow(project, chapter.id, session);
        setMessage(`"${chapter.title || 'Chapter'}" published.`);
      }
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update publish state.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!project || !chapter || !session?.user.id) return;

    setSaving(true);
    setMessage('');
    try {
      const updatedChapter = {
        ...chapter,
        title,
        body,
        content: body,
      };
      await saveNormalizedProject(
        {
          ...project,
          chapters: project.chapters.map((c) => (c.id === chapter.id ? updatedChapter : c)),
        },
        session.user.id,
      );
      await reload();
      setDirty(false);
      setMessage('Chapter saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save chapter.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProjectGate title={title || chapter?.title || 'Chapter'}>
      {!chapter ? (
        <div style={{ ...cardStyle, padding: 20 }}>This chapter could not be found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ color: C.coral, fontWeight: 700, fontSize: 13 }}>
                {isPublished ? 'Published' : 'Draft'}
              </div>
              <button
                type="button"
                onClick={() => void handlePublishToggle()}
                disabled={busy}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 999,
                  background: 'white',
                  color: C.ink,
                  padding: '10px 14px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {busy
                  ? isPublished ? 'Unpublishing...' : 'Publishing...'
                  : isPublished ? 'Unpublish Chapter' : 'Publish Chapter'}
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
              placeholder="Chapter title"
              style={{ ...fieldStyle, fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 700, marginBottom: 14 }}
            />

            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setDirty(true); }}
              placeholder="Write your chapter here..."
              style={{
                ...fieldStyle,
                minHeight: 360,
                lineHeight: 1.75,
                fontSize: 16,
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || !dirty}
                style={{
                  flex: 1,
                  border: 0,
                  borderRadius: 10,
                  padding: 14,
                  background: dirty ? C.ink : C.border,
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                {saving ? 'Saving...' : 'Save chapter'}
              </button>
            </div>

            {message ? (
              <div style={{ color: C.coral, marginTop: 10, fontSize: 13 }}>{message}</div>
            ) : null}
          </div>
        </div>
      )}
    </ProjectGate>
  );
}
