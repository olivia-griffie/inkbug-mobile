import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { updateProfile } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import { C } from '../styles/tokens'

export function AccountPage() {
  const navigate = useNavigate()
  const { session, profile, signOut, refreshProfile } = useAuthStore()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDisplayName(profile?.display_name ?? '')
    setUsername(profile?.username ?? '')
  }, [profile?.display_name, profile?.username])

  async function handleSave() {
    const userId = session?.user.id
    if (!userId) return

    setSaving(true)
    await updateProfile(userId, {
      display_name: displayName,
      username,
    })
    await refreshProfile()
    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, padding: '20px 16px 96px' }}>
      <div style={{ fontFamily: 'Lora, serif', fontSize: '1.5rem', color: C.ink, marginBottom: 16 }}>
        Account
      </div>

      <div
        style={{
          background: C.card,
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
          marginBottom: 16,
        }}
      >
        <div style={{ color: C.ink, fontWeight: 600, marginBottom: 8 }}>
          {profile?.display_name || profile?.username || 'Book Buddy writer'}
        </div>
        <div style={{ color: C.inkSoft, marginBottom: 12 }}>{session?.user.email || 'No email found'}</div>
        <span
          style={{
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: 999,
            background: '#f1eadf',
            color: C.inkSoft,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
          }}
        >
          {profile?.tier || 'beta'}
        </span>
      </div>

      <div
        style={{
          background: C.card,
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 6px 16px rgba(47,53,69,0.07)',
          display: 'grid',
          gap: 14,
        }}
      >
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name"
          style={fieldStyle}
        />
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          style={fieldStyle}
        />
        <input value={session?.user.email || ''} disabled style={{ ...fieldStyle, color: C.inkMuted }} />
        <button
          type="button"
          onClick={() => void handleSave()}
          style={{
            width: '100%',
            border: 0,
            borderRadius: 12,
            background: C.ink,
            color: C.cream,
            padding: 14,
            fontWeight: 600,
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => void handleSignOut()}
        style={{
          width: '100%',
          marginTop: 18,
          border: 0,
          borderRadius: 12,
          background: C.coral,
          color: 'white',
          padding: 14,
          fontWeight: 600,
        }}
      >
        Sign Out
      </button>

      <BottomNav />
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: C.soft,
  color: C.ink,
}
