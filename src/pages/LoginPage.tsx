import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { buttonStyle, cardStyle, contentStyle, inputStyle, shellStyle } from '../lib/ui';
import { C } from '../styles/tokens';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    navigate('/home');
  }

  return (
    <div style={shellStyle}>
      <div style={{ ...contentStyle, paddingTop: 40 }}>
        <div
          style={{
            ...cardStyle,
            padding: 24,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,247,243,0.96) 100%)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(255, 106, 90, 0.12)',
              color: C.coral,
              fontWeight: 700,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            Book Buddy Mobile
          </div>
          <h1 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 34 }}>
            Your story, exactly where you left it.
          </h1>
          <p style={{ margin: '0 0 24px', lineHeight: 1.6, color: C.inkSoft }}>
            Sign in with the same email and password you already use in Book Buddy.
          </p>

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
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {error ? <p style={{ color: C.coral, marginTop: 14 }}>{error}</p> : null}

          <p style={{ margin: '18px 0 0', color: C.inkMuted }}>
            New here? <Link to="/register" style={{ color: C.coral }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
