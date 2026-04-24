import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { findChapter } from '../lib/projectData';
import { cardStyle } from '../lib/ui';
import { C } from '../styles/tokens';

export function ChapterEditorPage() {
  const { id, cid } = useParams();
  const { project } = useProject(id);
  const chapter = project && cid ? findChapter(project, cid) : null;

  return (
    <ProjectGate title={chapter?.title ?? 'Chapter'}>
      {!chapter ? (
        <div style={{ ...cardStyle, padding: 20 }}>This chapter could not be found.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ color: C.coral, fontWeight: 700, marginBottom: 8 }}>
              {chapter.status || 'Draft'}
            </div>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 28 }}>
              {chapter.title}
            </h2>
            {chapter.summary ? (
              <p style={{ margin: 0, color: C.inkSoft, lineHeight: 1.6 }}>{chapter.summary}</p>
            ) : null}
          </div>

          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ whiteSpace: 'pre-wrap', color: C.inkSoft, lineHeight: 1.7 }}>
              {chapter.body || 'No chapter body was found in the synced project JSON.'}
            </div>
          </div>
        </div>
      )}
    </ProjectGate>
  );
}
