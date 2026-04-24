import { useEffect, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { C } from '../styles/tokens'

type CommunityProject = {
  id: string
  owner_id: string
  content: {
    title?: string
    genre?: string
    genres?: string[]
  } | null
  profiles?: {
    username?: string | null
    display_name?: string | null
  } | null
  published_chapters?: PublishedChapter[]
}

type PublishedChapter = {
  id: string
  project_id: string
  chapter_id: string
  chapter_title: string | null
  content: string | null
}

export function CommunityPage() {
  const { session } = useAuthStore()
  const [projects, setProjects] = useState<CommunityProject[]>([])
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({})
  const [chapterStats, setChapterStats] = useState<Record<string, { likes: number; comments: number; likedByMe: boolean }>>({})

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      const { data } = await supabase
        .from('projects')
        .select('id, content, owner_id, profiles(username, display_name), published_chapters(*)')
        .eq('is_public', true)
        .order('updated_at', { ascending: false })

      const projectsData = (data ?? []) as CommunityProject[]
      const chapters = projectsData.flatMap((project) => project.published_chapters ?? [])

      const [likesResult, commentsResult] = await Promise.all([
        chapters.length
          ? supabase
              .from('likes')
              .select('id, project_id, chapter_ref, user_id')
              .in('project_id', [...new Set(chapters.map((chapter) => chapter.project_id))])
          : Promise.resolve({ data: [] as { id: string; project_id: string; chapter_ref: string; user_id: string }[] }),
        chapters.length
          ? supabase
              .from('comments')
              .select('id, project_id, chapter_ref')
              .in('project_id', [...new Set(chapters.map((chapter) => chapter.project_id))])
          : Promise.resolve({ data: [] as { id: string; project_id: string; chapter_ref: string }[] }),
      ])

      const stats: Record<string, { likes: number; comments: number; likedByMe: boolean }> = {}
      for (const chapter of chapters) {
        const key = `${chapter.project_id}:${chapter.chapter_id}`
        const likes = (likesResult.data ?? []).filter(
          (like) => like.project_id === chapter.project_id && like.chapter_ref === chapter.chapter_id
        )
        const comments = (commentsResult.data ?? []).filter(
          (comment) => comment.project_id === chapter.project_id && comment.chapter_ref === chapter.chapter_id
        )
        stats[key] = {
          likes: likes.length,
          comments: comments.length,
          likedByMe: likes.some((like) => like.user_id === session?.user.id),
        }
      }

      if (cancelled) return
      setProjects(projectsData)
      setChapterStats(stats)
    }

    void loadCommunity()
    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  async function handleToggleLike(projectId: string, chapterId: string) {
    const userId = session?.user.id
    if (!userId) return

    const key = `${projectId}:${chapterId}`
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('project_id', projectId)
      .eq('chapter_ref', chapterId)
      .eq('user_id', userId)
      .limit(1)

    if (existing?.length) {
      await supabase.from('likes').delete().eq('id', existing[0].id)
      setChapterStats((current) => ({
        ...current,
        [key]: {
          likes: Math.max((current[key]?.likes ?? 1) - 1, 0),
          comments: current[key]?.comments ?? 0,
          likedByMe: false,
        },
      }))
      return
    }

    await supabase.from('likes').insert({
      user_id: userId,
      project_id: projectId,
      chapter_ref: chapterId,
    })

    setChapterStats((current) => ({
      ...current,
      [key]: {
        likes: (current[key]?.likes ?? 0) + 1,
        comments: current[key]?.comments ?? 0,
        likedByMe: true,
      },
    }))
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      <div style={{ fontFamily: 'Lora, serif', fontSize: '1.5rem', color: C.ink, marginBottom: 16 }}>
        Community
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {projects.map((project) => {
          const title = project.content?.title || 'Untitled project'
          const genres = Array.isArray(project.content?.genres)
            ? project.content?.genres
            : project.content?.genre
              ? [project.content.genre]
              : []
          const author =
            project.profiles?.display_name || project.profiles?.username || 'Unknown writer'

          return (
            <div
              key={project.id}
              style={{
                background: C.card,
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
              }}
            >
              <div style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: C.ink, marginBottom: 6 }}>
                {title}
              </div>
              <div style={{ color: C.inkSoft, marginBottom: 10 }}>by {author}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {genres.map((genre) => (
                  <span
                    key={genre}
                    style={{
                      background: '#f1eadf',
                      color: C.inkSoft,
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {(project.published_chapters ?? []).map((chapter) => {
                  const key = `${project.id}:${chapter.chapter_id}`
                  const expanded = Boolean(expandedChapterIds[key])
                  const stats = chapterStats[key] ?? { likes: 0, comments: 0, likedByMe: false }

                  return (
                    <div
                      key={chapter.id}
                      style={{
                        border: `1px solid ${C.borderSoft}`,
                        borderRadius: 14,
                        padding: 14,
                        background: C.soft,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: C.ink, marginBottom: 8 }}>
                        {chapter.chapter_title || 'Untitled chapter'}
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                        <button
                          type="button"
                          onClick={() => void handleToggleLike(project.id, chapter.chapter_id)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            color: stats.likedByMe ? C.coral : C.inkSoft,
                            padding: 0,
                            fontWeight: 600,
                          }}
                        >
                          ♥ {stats.likes}
                        </button>
                        <span style={{ color: C.inkMuted, fontSize: '0.85rem' }}>
                          {stats.comments} comments
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedChapterIds((current) => ({
                            ...current,
                            [key]: !current[key],
                          }))
                        }
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: C.inkMuted,
                          padding: 0,
                          marginBottom: expanded ? 10 : 0,
                        }}
                      >
                        {expanded ? 'Hide Chapter' : 'View Chapter'}
                      </button>
                      {expanded ? (
                        <div style={{ color: C.inkSoft, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                          {chapter.content || 'No chapter content available.'}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
