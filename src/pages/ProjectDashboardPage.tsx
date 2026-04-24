import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { summarizeWordCount } from '../lib/projectData';
import { syncProjectVisibility } from '../lib/community';
import { toDisplayText } from '../lib/richText';
import { cardStyle } from '../lib/ui';
import { C } from '../styles/tokens';
import { useAuth } from '../state/AuthContext';

export function ProjectDashboardPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const { project, reload } = useProject(id);
  const [statusMessage, setStatusMessage] = useState('');
  const [visibilityBusy, setVisibilityBusy] = useState(false);

  if (!project) {
    return <ProjectGate />;
  }

  const storySnapshot =
    project.plotSections[0]?.summary ||
    toDisplayText(project.raw.synopsis) ||
    'Your synced section targets, scenes, and prompts are ready in the tabs above.';

  async function handleVisibilityToggle() {
    if (!session || !project) {
      return;
    }

    setVisibilityBusy(true);
    try {
      const nextPublic = !project.isPublic;
      await syncProjectVisibility(project, session, nextPublic);
      await reload();
      setStatusMessage(nextPublic ? 'Project is now Public' : 'Project is now Private');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to update visibility.');
    } finally {
      setVisibilityBusy(false);
    }
  }

  return (
    <ProjectGate title={project.title}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ color: C.coral, fontWeight: 700, marginBottom: 10 }}>Overview</div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 28, marginBottom: 10 }}>
            {project.title}
          </div>
          <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>{toDisplayText(project.description)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            ['Genre', project.genre],
            ['Chapters', project.chapters.length.toString()],
            ['Published', project.publishedChapterIds.length.toString()],
            ['Words', summarizeWordCount(project).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} style={{ ...cardStyle, padding: 18 }}>
              <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>{label}</div>
              <div style={{ fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Sharing</div>
              <div style={{ color: C.inkMuted, fontSize: 13 }}>
                {project.isPublic ? 'Public' : 'Private'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleVisibilityToggle()}
              disabled={visibilityBusy}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 999,
                background: 'white',
                color: C.ink,
                padding: '10px 14px',
                fontWeight: 700,
              }}
            >
              {visibilityBusy
                ? 'Updating...'
                : project.isPublic
                  ? 'Make Private'
                  : 'Make Public'}
            </button>
          </div>
          <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>
            {project.isPublic
              ? 'This project is visible in the community. Only published chapters appear to readers.'
              : 'This project is private. Publishing a chapter will ask to make the project public first.'}
          </div>
          {statusMessage ? (
            <div style={{ color: C.coral, marginTop: 10, fontSize: 13 }}>{statusMessage}</div>
          ) : null}
        </div>

        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Story Snapshot</div>
          <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>{storySnapshot}</div>
        </div>
      </div>
    </ProjectGate>
  );
}
