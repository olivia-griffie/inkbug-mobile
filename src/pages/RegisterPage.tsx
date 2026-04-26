import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { buttonStyle, cardStyle, contentStyle, inputStyle, shellStyle } from '../lib/ui';
import { C } from '../styles/tokens';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (!signUpError && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName,
        username: email.split('@')[0],
      });
    }

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    navigate('/home');
  }

  return (
    <div style={shellStyle}>
      <div style={{ ...contentStyle, paddingTop: 40 }}>
        <div style={{ ...cardStyle, padding: 24 }}>
          <h1 style={{ margin: '0 0 12px', fontFamily: 'Lora, serif', fontSize: 32 }}>
            Start writing on mobile.
          </h1>
          <p style={{ margin: '0 0 24px', lineHeight: 1.6, color: C.inkSoft }}>
            Create an account and your projects will stay synced with Inkbug across devices.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
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
              minLength={6}
              required
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {error ? <p style={{ color: C.coral, marginTop: 14 }}>{error}</p> : null}

          <p style={{ margin: '18px 0 0', color: C.inkMuted }}>
            Already have an account? <Link to="/login" style={{ color: C.coral }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
