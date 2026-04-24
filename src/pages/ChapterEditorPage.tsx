import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { RichTextBlock } from '../components/RichTextBlock';
import { useProject } from '../hooks/useProject';
import { unpublishChapterWorkflow, publishChapterWorkflow } from '../lib/community';
import { findChapter } from '../lib/projectData';
import { cardStyle } from '../lib/ui';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';

export function ChapterEditorPage() {
  const { id, cid } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const chapter = project && cid ? findChapter(project, cid) : null;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const isPublished = chapter ? project?.publishedChapterIds.includes(chapter.id) : false;

  async function handlePublishToggle() {
    if (!project || !chapter || !session) {
      return;
    }

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

  return (
    <ProjectGate title={chapter?.title ?? 'Chapter'}>
      {!chapter ? (
        <div style={{ ...cardStyle, padding: 20 }}>This chapter could not be found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ color: C.coral, fontWeight: 700, marginBottom: 8 }}>
                  {chapter.status || 'Draft'}
                </div>
                <h2 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 28 }}>
                  {chapter.title}
                </h2>
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
                {busy ? (isPublished ? 'Unpublishing...' : 'Publishing...') : isPublished ? 'Unpublish Chapter' : 'Publish Chapter'}
              </button>
            </div>

            {chapter.summary ? (
              <div style={{ margin: 0, color: C.inkSoft, lineHeight: 1.6 }}>{chapter.summary}</div>
            ) : null}

            {message ? (
              <div style={{ marginTop: 12, color: C.coral, fontSize: 13 }}>{message}</div>
            ) : null}
          </div>

          <div style={{ ...cardStyle, padding: 20 }}>
            <RichTextBlock
              value={chapter.body || ''}
              style={{
                color: C.inkSoft,
                lineHeight: 1.7,
                whiteSpace: 'normal',
              }}
            />
            {!chapter.body ? (
              <div style={{ color: C.inkMuted }}>
                No chapter body was found in the synced project JSON.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </ProjectGate>
  );
}
