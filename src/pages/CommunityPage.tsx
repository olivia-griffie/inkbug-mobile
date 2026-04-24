import { useEffect, useMemo, useState } from 'react';
import { AppFrame, EmptyState } from '../components/AppFrame';
import { loadCommunityProjects, getFavoriteProjectIds, toggleFavoriteProjectId } from '../lib/community';
import { excerptText } from '../lib/richText';
import { C } from '../styles/tokens';
import { CommunityProject } from '../types/bookBuddy';

function authorName(project: CommunityProject) {
  return project.profiles?.display_name || project.profiles?.username || 'Anonymous writer';
}

function projectTitle(project: CommunityProject) {
  return typeof project.content?.title === 'string' ? project.content.title : 'Untitled project';
}

function projectDescription(project: CommunityProject) {
  return excerptText(
    project.content?.description || project.content?.logline || '',
    'Published chapters from this story are now available in the community reader.',
    170,
  );
}

export function CommunityPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      const [communityProjects, favorites] = await Promise.all([
        loadCommunityProjects().catch(() => []),
        Promise.resolve(getFavoriteProjectIds()),
      ]);

      if (cancelled) {
        return;
      }

      setProjects(communityProjects);
      setFavoriteIds(favorites);
      setLoading(false);
    }

    void loadFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  function handleFavoriteToggle(projectId: string) {
    const result = toggleFavoriteProjectId(projectId);
    setFavoriteIds(result.favorites);
  }

  return (
    <AppFrame title="Community" eyebrow="Discover writers">
      <div style={{ color: C.inkSoft, lineHeight: 1.6, marginBottom: 18 }}>
        Browse shared projects and published chapters from the wider Book Buddy community.
      </div>

      {loading ? <p>Loading community feed...</p> : null}

      {!loading && !projects.length ? (
        <EmptyState
          title="Nothing public yet"
          description="Be the first - publish a chapter from your project to appear here."
        />
      ) : null}

      {projects.map((project) => {
        const isFavorited = favorites.has(project.id);
        const chapters = project.published_chapters || [];

        return (
          <div
            key={project.id}
            style={{
              padding: 18,
              borderRadius: 22,
              border: `1px solid ${C.borderSoft}`,
              background: 'rgba(255,255,255,0.95)',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'start',
                marginBottom: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{projectTitle(project)}</div>
                <div style={{ color: C.coral, fontSize: 13, marginBottom: 8 }}>
                  {authorName(project)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleFavoriteToggle(project.id)}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 999,
                  background: isFavorited ? 'rgba(255,126,184,0.14)' : 'white',
                  color: isFavorited ? C.coral : C.ink,
                  padding: '9px 12px',
                  fontWeight: 700,
                }}
              >
                {isFavorited ? 'Saved' : 'Save'}
              </button>
            </div>

            <div style={{ color: C.inkMuted, lineHeight: 1.55, marginBottom: 12 }}>
              {projectDescription(project)}
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {chapters.length ? chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: 'rgba(255,247,243,0.95)',
                    border: `1px solid ${C.borderSoft}`,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {chapter.chapter_title || 'Untitled chapter'}
                  </div>
                  <div style={{ color: C.inkSoft, lineHeight: 1.55 }}>
                    {excerptText(chapter.content || '', 'No excerpt available.', 180)}
                  </div>
                  <div style={{ color: C.inkMuted, fontSize: 12, marginTop: 8 }}>
                    Published {new Date(chapter.published_at).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div style={{ color: C.inkMuted, fontSize: 13 }}>
                  No published chapters yet.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </AppFrame>
  );
}
