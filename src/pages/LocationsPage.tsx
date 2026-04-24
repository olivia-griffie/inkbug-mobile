import { useParams } from 'react-router-dom';
import { EmptyState, ListCard } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';

export function LocationsPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  return (
    <ProjectGate title="Locations">
      {!project?.locations.length ? (
        <EmptyState
          title="No saved locations"
          description="Locations from your story bible will appear here."
        />
      ) : null}

      {project?.locations.map((location) => (
        <ListCard
          key={location.id}
          title={location.name}
          body={location.description || 'No notes provided yet.'}
        />
      ))}
    </ProjectGate>
  );
}
