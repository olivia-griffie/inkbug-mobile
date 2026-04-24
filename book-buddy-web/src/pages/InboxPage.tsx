import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { C } from '../styles/tokens'

type NotificationItem = {
  id: string
  type: 'comment' | 'like'
  author: string
  message: string
  createdAt: string
}

type ConversationItem = {
  id: string
  lastMessagePreview: string
  lastMessageAt: string
  unreadCount: number
  otherDisplayName: string
}

export function InboxPage() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const [tab, setTab] = useState<'notifications' | 'messages'>('notifications')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function loadNotifications() {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, content')
        .eq('owner_id', userId)

      const projectIds = (projects ?? []).map((project) => project.id)
      const projectMap = Object.fromEntries(
        (projects ?? []).map((project) => [project.id, project.content?.title || 'Untitled'])
      )

      const { data: publishedChapters } = projectIds.length
        ? await supabase
            .from('published_chapters')
            .select('chapter_id, chapter_title, project_id')
            .in('project_id', projectIds)
        : { data: [] as { chapter_id: string; chapter_title: string | null; project_id: string }[] }

      const chapterMap = Object.fromEntries(
        (publishedChapters ?? []).map((chapter) => [
          `${chapter.project_id}:${chapter.chapter_id}`,
          chapter.chapter_title || 'Chapter',
        ])
      )

      const [commentsResult, likesResult] = await Promise.all([
        projectIds.length
          ? supabase
              .from('comments')
              .select('id, content, chapter_ref, created_at, project_id, profiles!user_id(username, display_name)')
              .in('project_id', projectIds)
              .order('created_at', { ascending: false })
              .limit(40)
          : Promise.resolve({ data: [] as never[] }),
        projectIds.length
          ? supabase
              .from('likes')
              .select('id, chapter_ref, created_at, project_id, profiles!user_id(username, display_name)')
              .in('project_id', projectIds)
              .order('created_at', { ascending: false })
              .limit(40)
          : Promise.resolve({ data: [] as never[] }),
      ])

      const items: NotificationItem[] = [
        ...((commentsResult.data ?? []) as Array<{
          id: string
          content: string
          chapter_ref: string
          created_at: string
          project_id: string
          profiles?: { username?: string | null; display_name?: string | null } | null
        }>).map((comment) => ({
          id: `comment-${comment.id}`,
          type: 'comment' as const,
          author: comment.profiles?.display_name || comment.profiles?.username || 'Anonymous',
          message: `commented on ${chapterMap[`${comment.project_id}:${comment.chapter_ref}`] || 'your chapter'} in ${projectMap[comment.project_id] || 'your project'}: ${comment.content}`,
          createdAt: comment.created_at,
        })),
        ...((likesResult.data ?? []) as Array<{
          id: string
          chapter_ref: string
          created_at: string
          project_id: string
          profiles?: { username?: string | null; display_name?: string | null } | null
        }>).map((like) => ({
          id: `like-${like.id}`,
          type: 'like' as const,
          author: like.profiles?.display_name || like.profiles?.username || 'Anonymous',
          message: `liked ${chapterMap[`${like.project_id}:${like.chapter_ref}`] || 'your chapter'} in ${projectMap[like.project_id] || 'your project'}`,
          createdAt: like.created_at,
        })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

      if (!cancelled) {
        setNotifications(items)
      }
    }

    async function loadMessages() {
      const { data: memberships } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId)

      const conversationIds = [...new Set((memberships ?? []).map((row) => row.conversation_id).filter(Boolean))]
      if (!conversationIds.length) {
        if (!cancelled) setConversations([])
        return
      }

      const [conversationsResult, participantsResult, unreadResult] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, created_at, updated_at, last_message_at, last_message_preview')
          .in('id', conversationIds),
        supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', conversationIds),
        supabase
          .from('direct_messages')
          .select('id, conversation_id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', userId)
          .is('read_at', null),
      ])

      const participantUserIds = [...new Set((participantsResult.data ?? []).map((row) => row.user_id).filter(Boolean))]
      const { data: profileRows } = participantUserIds.length
        ? await supabase
            .from('profiles')
            .select('id, username, display_name')
            .in('id', participantUserIds)
        : { data: [] as { id: string; username: string | null; display_name: string | null }[] }

      const profileMap = Object.fromEntries((profileRows ?? []).map((profile) => [profile.id, profile]))
      const participantsByConversation: Record<string, Array<{ user_id: string }>> = {}
      for (const participant of participantsResult.data ?? []) {
        ;(participantsByConversation[participant.conversation_id] ||= []).push(participant)
      }

      const unreadByConversation: Record<string, number> = {}
      for (const message of unreadResult.data ?? []) {
        unreadByConversation[message.conversation_id] =
          (unreadByConversation[message.conversation_id] || 0) + 1
      }

      const nextConversations: ConversationItem[] = (conversationsResult.data ?? [])
        .map((conversation) => {
          const threadParticipants = participantsByConversation[conversation.id] || []
          const other = threadParticipants.find((participant) => participant.user_id !== userId) || threadParticipants[0]
          const otherProfile = other ? profileMap[other.user_id] : null
          return {
            id: conversation.id,
            lastMessagePreview: conversation.last_message_preview || '',
            lastMessageAt: conversation.last_message_at || conversation.updated_at || conversation.created_at,
            unreadCount: unreadByConversation[conversation.id] || 0,
            otherDisplayName:
              otherProfile?.display_name || otherProfile?.username || 'Unknown writer',
          }
        })
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))

      if (!cancelled) {
        setConversations(nextConversations)
      }
    }

    void loadNotifications()
    void loadMessages()

    return () => {
      cancelled = true
    }
  }, [userId])

  const visibleTabTitle = useMemo(
    () => (tab === 'notifications' ? 'Notifications' : 'Messages'),
    [tab]
  )

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      <div style={{ fontFamily: 'Lora, serif', fontSize: '1.5rem', color: C.ink, marginBottom: 16 }}>
        Inbox
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          background: C.soft,
          borderRadius: 14,
          padding: 6,
          marginBottom: 16,
        }}
      >
        {(['notifications', 'messages'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            style={{
              border: 0,
              borderRadius: 10,
              padding: '12px 10px',
              background: tab === value ? C.card : 'transparent',
              color: tab === value ? C.ink : C.inkMuted,
              fontWeight: 600,
            }}
          >
            {value === 'notifications' ? 'Notifications' : 'Messages'}
          </button>
        ))}
      </div>

      <div style={{ color: C.inkMuted, marginBottom: 12 }}>{visibleTabTitle}</div>

      {tab === 'notifications' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr',
                gap: 12,
                background: C.card,
                borderRadius: 14,
                padding: 14,
                boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: C.borderSoft,
                  display: 'grid',
                  placeItems: 'center',
                  color: C.ink,
                  fontWeight: 700,
                }}
              >
                {item.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: item.type === 'comment' ? '#f1eadf' : 'rgba(255,106,90,0.12)',
                      color: item.type === 'comment' ? C.inkSoft : C.coral,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.type}
                  </span>
                  <span style={{ color: C.inkMuted, fontSize: '0.78rem' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: C.inkSoft, lineHeight: 1.5 }}>{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => navigate(`/inbox/${conversation.id}`)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: C.card,
                border: 0,
                borderRadius: 14,
                padding: 14,
                boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <div style={{ color: C.ink, fontWeight: 600 }}>{conversation.otherDisplayName}</div>
                {conversation.unreadCount ? (
                  <span
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 999,
                      background: C.coral,
                      color: 'white',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '0.72rem',
                    }}
                  >
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </div>
              <div style={{ color: C.inkSoft, lineHeight: 1.5, marginBottom: 6 }}>
                {conversation.lastMessagePreview || 'No messages yet.'}
              </div>
              <div style={{ color: C.inkMuted, fontSize: '0.78rem' }}>
                {new Date(conversation.lastMessageAt).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
