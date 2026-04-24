import { useParams } from 'react-router-dom';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { summarizeWordCount } from '../lib/projectData';
import { cardStyle } from '../lib/ui';
import { C } from '../styles/tokens';

export function ProjectDashboardPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  if (!project) {
    return <ProjectGate />;
  }

  return (
    <ProjectGate title={project.title}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ color: C.coral, fontWeight: 700, marginBottom: 10 }}>Overview</div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 28, marginBottom: 10 }}>{project.title}</div>
          <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>{project.description}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            ['Genre', project.genre],
            ['Chapters', project.chapters.length.toString()],
            ['Characters', project.characters.length.toString()],
            ['Words', summarizeWordCount(project).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} style={{ ...cardStyle, padding: 18 }}>
              <div style={{ color: C.inkMuted, fontSize: 12, marginBottom: 6 }}>{label}</div>
              <div style={{ fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Story snapshot</div>
          <div style={{ color: C.inkSoft, lineHeight: 1.6 }}>
            {project.plotSections[0]?.summary ??
              project.raw.synopsis?.toString() ??
              'Your synced plot beats, scenes, and prompts are ready in the tabs above.'}
          </div>
        </div>
      </div>
    </ProjectGate>
  );
}
