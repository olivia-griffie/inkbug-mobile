import { useEffect, useState } from 'react';
import { AppFrame, EmptyState, ListCard } from '../components/AppFrame';
import { supabase } from '../lib/supabase';
import { C } from '../styles/tokens';

type CommunityProject = {
  id: string;
  title: string | null;
  description: string | null;
};

type PublishedChapter = {
  id: string;
  title: string | null;
  excerpt: string | null;
};

export function CommunityPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [chapters, setChapters] = useState<PublishedChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      const [projectsResult, chaptersResult] = await Promise.all([
        supabase.from('projects').select('id, title, description').limit(8),
        supabase.from('published_chapters').select('id, title, excerpt').limit(8),
      ]);

      if (cancelled) {
        return;
      }

      setProjects(projectsResult.data ?? []);
      setChapters(chaptersResult.data ?? []);
      setLoading(false);
    }

    void loadFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppFrame title="Community" eyebrow="Discover writers">
      <div style={{ color: C.inkSoft, lineHeight: 1.6, marginBottom: 18 }}>
        Browse shared projects, published chapters, and writing momentum from the wider Book Buddy community.
      </div>

      {loading ? <p>Loading community feed...</p> : null}

      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 22 }}>Public projects</h2>
        {!projects.length ? (
          <EmptyState
            title="Nothing public yet"
            description="Shared community projects will appear here."
          />
        ) : null}
        {projects.map((project) => (
          <ListCard
            key={project.id}
            title={project.title || 'Untitled project'}
            body={project.description || 'No description provided.'}
          />
        ))}
      </div>

      <div>
        <h2 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 22 }}>Published chapters</h2>
        {!chapters.length ? (
          <EmptyState
            title="No chapters published yet"
            description="Community-published chapters will show up here."
          />
        ) : null}
        {chapters.map((chapter) => (
          <ListCard
            key={chapter.id}
            title={chapter.title || 'Untitled chapter'}
            body={chapter.excerpt || 'No excerpt available.'}
          />
        ))}
      </div>
    </AppFrame>
  );
}
