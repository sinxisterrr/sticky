import { useEffect } from 'react';
import { api } from '../lib/api';
import type { User } from '../lib/types';

interface Props {
  onLogin: (user: User, token: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
        };
      };
    };
  }
}

export default function LoginScreen({ onLogin }: Props) {
  useEffect(() => {
    const el = document.getElementById('google-btn');
    if (!el || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async ({ credential }: { credential: string }) => {
        try {
          const { token, user } = await api.auth.google(credential);
          localStorage.setItem('sticky_token', token);
          onLogin(user, token);
        } catch (e) {
          console.error('Login failed', e);
        }
      },
    });

    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'sign_in_with',
    });
  }, [onLogin]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: 'Montserrat, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        borderRadius: 24, padding: '48px 40px', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🗒️</div>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 600, margin: '0 0 8px', letterSpacing: -0.5 }}>
          sticky
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 32px' }}>
          cozy notes, everywhere
        </p>
        <div id="google-btn" style={{ display: 'flex', justifyContent: 'center' }} />
      </div>
    </div>
  );
}
