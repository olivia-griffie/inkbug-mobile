import { useParams } from 'react-router-dom';
import { EmptyState, ListCard } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';

export function CharactersPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  return (
    <ProjectGate title="Characters">
      {!project?.characters.length ? (
        <EmptyState
          title="No characters yet"
          description="Character profiles from the project JSON will show up here."
        />
      ) : null}

      {project?.characters.map((character) => (
        <ListCard
          key={character.id}
          title={character.name}
          subtitle={character.role}
          body={character.description || 'No description provided.'}
        />
      ))}
    </ProjectGate>
  );
}
