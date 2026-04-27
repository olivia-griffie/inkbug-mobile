import { useEffect, useMemo, useState } from 'react';
import { AppFrame, EmptyState } from '../components/AppFrame';
import { loadCommunityProjects, getFavoriteProjectIds, toggleFavoriteProjectId } from '../lib/community';
import { excerptText, toDisplayText } from '../lib/richText';
import { C } from '../styles/tokens';
import { CommunityProject, PublishedChapterRow } from '../types/bookBuddy';

function authorName(project: CommunityProject) {
  return project.profiles?.display_name || project.profiles?.username || 'Anonymous writer';
}

function projectTitle(project: CommunityProject) {
  return typeof project.content?.title === 'string' ? project.content.title : 'Untitled project';
}

function projectDescription(project: CommunityProject) {
  return excerptText(
    String(project.content?.description || project.content?.logline || ''),
    'Published chapters from this story are now available in the community reader.',
    170,
  );
}

function ChapterReader({
  chapter,
  onClose,
}: {
  chapter: PublishedChapterRow;
  onClose: () => void;
}) {
  const body = toDisplayText(chapter.content || '');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(47,53,69,0.32)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px 20px 0 0',
          padding: 24,
          maxHeight: '90dvh',
          overflowY: 'auto',
          display: 'grid',
          gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: 22 }}>
            {chapter.chapter_title || 'Untitled chapter'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: C.inkMuted,
              fontSize: 22,
              lineHeight: 1,
              padding: 4,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ color: C.inkMuted, fontSize: 12 }}>
          Published {new Date(chapter.published_at).toLocaleDateString()}
        </div>
        <div style={{ color: C.ink, lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>
          {body || 'No content available.'}
        </div>
      </div>
    </div>
  );
}

export function CommunityPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingChapter, setReadingChapter] = useState<PublishedChapterRow | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      const [communityProjects, favorites] = await Promise.all([
        loadCommunityProjects().catch(() => []),
        Promise.resolve(getFavoriteProjectIds()),
      ]);

      if (cancelled) return;

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
        Browse shared projects and published chapters from the wider Inkbug community.
      </div>

      {loading ? <p>Loading community feed...</p> : null}

      {!loading && !projects.length ? (
        <EmptyState
          title="Nothing public yet"
          description="Be the first — publish a chapter from your project to appear here."
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
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setReadingChapter(chapter)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 14,
                    borderRadius: 18,
                    background: 'rgba(255,247,243,0.95)',
                    border: `1px solid ${C.borderSoft}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {chapter.chapter_title || 'Untitled chapter'}
                  </div>
                  <div style={{ color: C.inkSoft, lineHeight: 1.55 }}>
                    {excerptText(toDisplayText(chapter.content || ''), 'Tap to read.', 180)}
                  </div>
                  <div style={{ color: C.coral, fontSize: 12, marginTop: 8, fontWeight: 700 }}>
                    Tap to read →
                  </div>
                </button>
              )) : (
                <div style={{ color: C.inkMuted, fontSize: 13 }}>
                  No published chapters yet.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {readingChapter ? (
        <ChapterReader
          chapter={readingChapter}
          onClose={() => setReadingChapter(null)}
        />
      ) : null}
    </AppFrame>
  );
}
