import { useParams } from 'react-router-dom';
import { EmptyState, ListCard } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';

export function PromptsPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  return (
    <ProjectGate title="Daily prompts">
      {!project?.prompts.length ? (
        <EmptyState
          title="No prompts yet"
          description="Prompts attached to this project will appear here when available."
        />
      ) : null}

      {project?.prompts.map((prompt) => (
        <ListCard
          key={prompt.id}
          title={prompt.title}
          subtitle={prompt.completed ? 'Completed' : 'Open prompt'}
          body={prompt.content || 'No prompt text was stored for this entry.'}
        />
      ))}
    </ProjectGate>
  );
}
