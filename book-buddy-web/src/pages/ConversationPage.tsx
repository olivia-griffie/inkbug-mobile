import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { C } from '../styles/tokens'

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

export function ConversationPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const { session } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({})
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = session?.user.id
    if (!conversationId || !userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadConversation() {
      const participantCheck = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .limit(1)

      if (participantCheck.error || !participantCheck.data?.length) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data: messageRows } = await supabase
        .from('direct_messages')
        .select('id, conversation_id, sender_id, body, created_at, read_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      const senderIds = [...new Set((messageRows ?? []).map((row) => row.sender_id).filter(Boolean))]
      const { data: profileRows } = senderIds.length
        ? await supabase
            .from('profiles')
            .select('id, username, display_name')
            .in('id', senderIds)
        : { data: [] as ProfileRow[] }

      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (cancelled) return

      setMessages((messageRows ?? []) as Message[])
      setProfiles(
        Object.fromEntries(
          (profileRows ?? []).map((profile) => [profile.id, profile as ProfileRow])
        )
      )
      setLoading(false)
    }

    void loadConversation()

    return () => {
      cancelled = true
    }
  }, [conversationId, session?.user.id])

  const otherName = useMemo(() => {
    const userId = session?.user.id
    const other = messages.find((message) => message.sender_id !== userId)
    if (!other) return 'Conversation'
    const profile = profiles[other.sender_id]
    return profile?.display_name || profile?.username || 'Conversation'
  }, [messages, profiles, session?.user.id])

  async function handleSend() {
    const userId = session?.user.id
    const body = draft.trim()
    if (!conversationId || !userId || !body) return

    const timestamp = new Date().toISOString()

    const { data: inserted, error } = await supabase
      .from('direct_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body,
        created_at: timestamp,
      })
      .select('id, conversation_id, sender_id, body, created_at, read_at')
      .single()

    if (error || !inserted) return

    await supabase
      .from('conversations')
      .update({
        updated_at: timestamp,
        last_message_at: timestamp,
        last_message_preview: body.slice(0, 180),
      })
      .eq('id', conversationId)

    setMessages((current) => [...current, inserted as Message])
    setDraft('')
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: C.cream,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 16px',
          borderBottom: `1px solid ${C.borderSoft}`,
          background: C.card,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/inbox')}
          style={{ border: 0, background: 'transparent', fontSize: '1.2rem', color: C.ink }}
        >
          ←
        </button>
        <div style={{ fontFamily: 'Lora, serif', fontSize: '1.25rem', color: C.ink }}>
          {otherName}
        </div>
      </div>

      <div style={{ flex: 1, padding: 16, display: 'grid', gap: 10, alignContent: 'start' }}>
        {loading ? <div style={{ color: C.inkMuted }}>Loading messages...</div> : null}
        {!loading &&
          messages.map((message) => {
            const mine = message.sender_id === session?.user.id
            return (
              <div
                key={message.id}
                style={{
                  justifySelf: mine ? 'end' : 'start',
                  maxWidth: '82%',
                  padding: '12px 14px',
                  borderRadius: 16,
                  background: mine ? C.ink : C.card,
                  color: mine ? C.cream : C.ink,
                  boxShadow: '0 6px 16px rgba(47,53,69,0.06)',
                }}
              >
                <div style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{message.body}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: '0.72rem',
                    color: mine ? 'rgba(255,247,243,0.75)' : C.inkMuted,
                  }}
                >
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            )
          })}
      </div>

      <div
        style={{
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          borderTop: `1px solid ${C.borderSoft}`,
          background: C.card,
          display: 'flex',
          gap: 10,
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message..."
          style={{
            flex: 1,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '12px 14px',
            background: C.soft,
            color: C.ink,
          }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          style={{
            border: 0,
            borderRadius: 12,
            background: C.ink,
            color: C.cream,
            padding: '0 16px',
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
