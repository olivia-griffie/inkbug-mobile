import { useMemo } from 'react';
import { useProjects } from './useProjects';

export function useProject(projectId?: string) {
  const { projects, loading, error } = useProjects();

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? null,
    [projectId, projects],
  );

  return { project, loading, error };
}
