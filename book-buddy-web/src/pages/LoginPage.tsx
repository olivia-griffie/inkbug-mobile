import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { C } from '../styles/tokens'

const pageStyle: CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
}

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 390,
  display: 'grid',
  gap: 16,
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: '#ffffff',
  color: C.ink,
  outlineColor: C.coral,
}

const buttonStyle: CSSProperties = {
  width: '100%',
  background: C.ink,
  color: C.cream,
  border: 0,
  borderRadius: 10,
  padding: 14,
  fontWeight: 600,
  fontSize: '0.95rem',
}

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signIn(email, password)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '1.8rem',
              color: C.ink,
            }}
          >
            Book Buddy
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <h1
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '1.6rem',
              color: C.ink,
              fontWeight: 400,
            }}
          >
            Welcome back
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle} disabled={submitting}>
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
          {error ? <div style={{ color: C.coral, fontSize: '0.92rem' }}>{error}</div> : null}
        </form>

        <div style={{ color: C.inkSoft, fontSize: '0.95rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: C.ink, fontWeight: 600 }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
