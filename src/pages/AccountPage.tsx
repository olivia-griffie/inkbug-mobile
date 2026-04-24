import { useNavigate } from 'react-router-dom';
import { AppFrame, ListCard } from '../components/AppFrame';
import { buttonStyle, cardStyle } from '../lib/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../state/AuthContext';
import { C } from '../styles/tokens';

export function AccountPage() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <AppFrame title="Account" eyebrow="Profile">
      <div style={{ ...cardStyle, padding: 20, marginBottom: 18 }}>
        <div style={{ color: C.inkMuted, fontSize: 13, marginBottom: 8 }}>Signed in as</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 28, marginBottom: 8 }}>
          {profile?.display_name || profile?.username || 'Book Buddy writer'}
        </div>
        <div style={{ color: C.inkSoft }}>{session?.user.email}</div>
      </div>

      <ListCard
        title="Sync status"
        body="This mobile app reads from the same Supabase backend as your desktop workspace."
      />
      <ListCard
        title="Profile"
        body={`Username: ${profile?.username ?? 'Not set'}${profile?.display_name ? ` • Display name: ${profile.display_name}` : ''}`}
      />

      <button type="button" onClick={handleSignOut} style={{ ...buttonStyle, marginTop: 12 }}>
        Sign out
      </button>
    </AppFrame>
  );
}
