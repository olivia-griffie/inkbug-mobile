import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link } from 'react-router-dom'
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

export function RegisterPage() {
  const { signUp } = useAuthStore()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setSuccess('')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await signUp({ username, email, password })
      setSuccess('Account created. Check your email to confirm your account if prompted.')
      setUsername('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
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
            Inkbug Beta
          </div>
        </div>

        <h1
          style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.6rem',
            color: C.ink,
            fontWeight: 400,
          }}
        >
          Create your account
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            style={inputStyle}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle} disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
          {error ? <div style={{ color: C.coral, fontSize: '0.92rem' }}>{error}</div> : null}
          {success ? <div style={{ color: C.inkSoft, fontSize: '0.92rem' }}>{success}</div> : null}
        </form>

        <div style={{ color: C.inkSoft, fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: C.ink, fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
