import { CSSProperties } from 'react';
import { C } from '../styles/tokens';

export const shellStyle: CSSProperties = {
  minHeight: '100vh',
  padding: '20px 16px 28px',
};

export const contentStyle: CSSProperties = {
  maxWidth: 520,
  margin: '0 auto',
};

export const cardStyle: CSSProperties = {
  background: C.card,
  border: `1px solid ${C.borderSoft}`,
  borderRadius: 24,
  boxShadow: '0 18px 50px rgba(255, 106, 90, 0.12)',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  outline: 'none',
  color: C.ink,
  background: C.soft,
};

export const buttonStyle: CSSProperties = {
  width: '100%',
  border: 0,
  borderRadius: 18,
  padding: '14px 18px',
  background: `linear-gradient(135deg, ${C.coral} 0%, ${C.orange} 100%)`,
  color: 'white',
  fontWeight: 700,
  boxShadow: '0 14px 30px rgba(255, 106, 90, 0.28)',
};

export const mutedTextStyle: CSSProperties = {
  color: C.inkMuted,
  lineHeight: 1.5,
};
