import { useEffect, useState } from 'react';
import { AppFrame, EmptyState, ListCard } from '../components/AppFrame';
import { supabase } from '../lib/supabase';
import { useAuth } from '../state/AuthContext';

type Conversation = {
  id: string;
  title: string | null;
};

type DirectMessage = {
  id: string;
  content: string | null;
};

export function InboxPage() {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = session?.user.id;

    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadInbox() {
      const { data: participantRows } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId)
        .limit(20);

      const conversationIds = (participantRows ?? []).map((row) => row.conversation_id);

      const [conversationResult, messageResult] = await Promise.all([
        conversationIds.length
          ? supabase.from('conversations').select('id, title').in('id', conversationIds)
          : Promise.resolve({ data: [] as Conversation[] }),
        supabase
          .from('direct_messages')
          .select('id, content')
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .limit(12),
      ]);

      if (cancelled) {
        return;
      }

      setConversations(conversationResult.data ?? []);
      setMessages(messageResult.data ?? []);
      setLoading(false);
    }

    void loadInbox();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  return (
    <AppFrame title="Inbox" eyebrow="Messages">
      {loading ? <p>Loading conversations...</p> : null}

      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 22 }}>Conversations</h2>
        {!conversations.length ? (
          <EmptyState
            title="No conversations yet"
            description="Your conversation threads will appear here."
          />
        ) : null}
        {conversations.map((conversation) => (
          <ListCard
            key={conversation.id}
            title={conversation.title || 'Untitled conversation'}
            body="Open Book Buddy on desktop to reply and manage threads."
          />
        ))}
      </div>

      <div>
        <h2 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 22 }}>Recent messages</h2>
        {!messages.length ? (
          <EmptyState
            title="No recent messages"
            description="Direct messages will show up here when available."
          />
        ) : null}
        {messages.map((message) => (
          <ListCard
            key={message.id}
            title="Direct message"
            body={message.content || 'No message body available.'}
          />
        ))}
      </div>
    </AppFrame>
  );
}
