import { useParams } from 'react-router-dom';
import { EmptyState, ListCard } from '../components/AppFrame';
import { ProjectGate } from '../components/ProjectGate';
import { useProject } from '../hooks/useProject';
import { excerptText } from '../lib/richText';

export function ChaptersPage() {
  const { id } = useParams();
  const { project } = useProject(id);

  return (
    <ProjectGate title="Chapters">
      {!project?.chapters.length ? (
        <EmptyState
          title="No chapters yet"
          description="Chapters saved in your cloud project will appear here."
        />
      ) : null}

      {project?.chapters.map((chapter, index) => (
        <ListCard
          key={chapter.id}
          href={`/project/${project.id}/chapters/${chapter.id}`}
          title={chapter.title}
          subtitle={`Chapter ${index + 1}${chapter.status ? ` • ${chapter.status}` : ''}`}
          body={excerptText(chapter.summary || chapter.body || '', 'Open chapter', 140)}
        />
      ))}
    </ProjectGate>
  );
}
