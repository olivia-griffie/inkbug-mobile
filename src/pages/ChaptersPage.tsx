import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { publishChapterWorkflow, saveNormalizedProject, unpublishChapterWorkflow } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: `rgba(249,248,246,0.9)`,
  color: C.ink,
};

export function ChaptersPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [busyChapterId, setBusyChapterId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  async function handlePublishToggle(chapterId: string) {
    if (!project || !session) {
      return;
    }

    setBusyChapterId(chapterId);
    setMessage('');
    try {
      const isPublished = project.publishedChapterIds.includes(chapterId);
      const chapter = project.chapters.find((entry) => entry.id === chapterId);
      if (isPublished) {
        await unpublishChapterWorkflow(project, chapterId, session);
        setMessage(`"${chapter?.title || 'Chapter'}" unpublished.`);
      } else {
        await publishChapterWorkflow(project, chapterId, session);
        setMessage(`"${chapter?.title || 'Chapter'}" published.`);
      }
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update publish state.');
    } finally {
      setBusyChapterId(null);
    }
  }

  async function handleAddChapter() {
    if (!project || !session?.user.id) {
      return;
    }

    setAdding(true);
    setMessage('');
    try {
      const chapterNumber = project.chapters.length + 1;
      const title = newTitle.trim() || `Chapter ${chapterNumber}`;
      const newChapter = {
        id: crypto.randomUUID(),
        title,
        body: '',
        content: '',
        status: 'Draft',
        sectionId: null,
        targetWords: 0,
      };

      await saveNormalizedProject(
        {
          ...project,
          chapters: [...project.chapters, newChapter],
        },
        session.user.id,
      );
      await reload();
      setAddOpen(false);
      setNewTitle('');
      setMessage(`"${title}" created.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create chapter.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <ProjectGate title="Chapters">
      {!project?.chapters.length ? (
        <EmptyState
          title="No chapters yet"
          description="Create your first chapter below, or start one in the desktop app and it will sync here."
        />
      ) : null}

      {message ? (
        <div style={{ color: C.coral, marginBottom: 12, fontSize: 13 }}>{message}</div>
      ) : null}

      {project?.chapters.map((chapter, index) => {
        const isPublished = project.publishedChapterIds.includes(chapter.id);
        const isBusy = busyChapterId === chapter.id;

        return (
          <div
            key={chapter.id}
            style={{
              padding: 18,
              borderRadius: 22,
              border: `1px solid ${C.borderSoft}`,
              background: 'rgba(255,255,255,0.95)',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <Link
                to={`/project/${project.id}/chapters/${chapter.id}`}
                style={{ flex: 1, minWidth: 0 }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{chapter.title}</div>
                <div style={{ color: C.coral, fontSize: 13, marginBottom: 8 }}>
                  {`Chapter ${index + 1}${chapter.status ? ` • ${chapter.status}` : ''}`}
                </div>
                <div style={{ color: C.inkMuted, lineHeight: 1.55 }}>
                  {excerptText(chapter.summary || chapter.body || '', 'Open chapter', 140)}
                </div>
              </Link>
              <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: isPublished ? 'rgba(79,242,201,0.18)' : 'rgba(255,106,90,0.1)',
                    color: isPublished ? '#1a7a66' : C.coral,
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </span>
                <button
                  type="button"
                  onClick={() => void handlePublishToggle(chapter.id)}
                  disabled={isBusy}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 999,
                    background: 'white',
                    color: C.ink,
                    padding: '9px 12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isBusy
                    ? isPublished
                      ? 'Unpublishing...'
                      : 'Publishing...'
                    : isPublished
                      ? 'Unpublish'
                      : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => { setNewTitle(''); setAddOpen(true); }}
        style={fabStyle}
      >
        +
      </button>

      {addOpen ? (
        <div style={overlayStyle}>
          <div style={sheetStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ color: C.ink, fontWeight: 700, fontSize: 16 }}>New chapter</div>
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder={`Chapter ${(project?.chapters.length ?? 0) + 1}`}
                style={fieldStyle}
                autoFocus
              />
              <button
                type="button"
                onClick={() => void handleAddChapter()}
                disabled={adding}
                style={saveButtonStyle}
              >
                {adding ? 'Creating...' : 'Create chapter'}
              </button>
              <button type="button" onClick={() => setAddOpen(false)} style={cancelButtonStyle}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </ProjectGate>
  );
}

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
