import { useParams } from 'react-router-dom';
import { EmptyState, ListCard } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';

export function PlotPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  return (
    <ProjectGate title="Plot">
      {!project?.plotSections.length ? (
        <EmptyState
          title="No section targets yet"
          description="Section targets from your synced project will appear here."
        />
      ) : null}

      {project?.plotSections.map((section, index) => (
        <ListCard
          key={section.id}
          title={section.title}
          subtitle={`Section Target ${index + 1}${section.status ? ` • ${section.status}` : ''}`}
          body={section.summary || 'No summary provided.'}
        />
      ))}
    </ProjectGate>
  );
}
