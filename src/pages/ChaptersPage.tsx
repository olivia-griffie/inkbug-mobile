import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { publishChapterWorkflow, unpublishChapterWorkflow } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';

export function ChaptersPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [busyChapterId, setBusyChapterId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

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

  return (
    <ProjectGate title="Chapters">
      {!project?.chapters.length ? (
        <EmptyState
          title="No chapters yet"
          description="Chapters saved in your cloud project will appear here."
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
    </ProjectGate>
  );
}
