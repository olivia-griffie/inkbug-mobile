import { useParams } from 'react-router-dom';
import { EmptyState, ListCard } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';

export function ScenesPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  return (
    <ProjectGate title="Scenes">
      {!project?.scenes.length ? (
        <EmptyState
          title="No scenes yet"
          description="Scene cards saved in your project will show up here."
        />
      ) : null}

      {project?.scenes.map((scene) => (
        <ListCard
          key={scene.id}
          title={scene.title}
          subtitle={scene.chapterId ? `Linked to ${scene.chapterId}` : undefined}
          body={scene.summary || 'No scene summary provided.'}
        />
      ))}
    </ProjectGate>
  );
}
