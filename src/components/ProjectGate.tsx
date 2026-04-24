import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { AppFrame, EmptyState, ProjectTabs } from './AppFrame';

export function ProjectGate({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) {
  const { id } = useParams();
  const { project, loading, error } = useProject(id);

  if (loading) {
    return <AppFrame title="Loading project">Syncing your latest draft...</AppFrame>;
  }

  if (error || !project) {
    return (
      <AppFrame title="Project not found">
        <EmptyState
          title="We couldn't load that project"
          description={error ?? 'It may have been removed or is still syncing.'}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame title={title ?? project.title} eyebrow="Project workspace">
      <ProjectTabs projectId={project.id} />
      {children}
    </AppFrame>
  );
}
