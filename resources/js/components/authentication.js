import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthenticationError({ loginPath = '/login' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#e5e7eb',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: 12,
        padding: '28px 24px',
        boxShadow: '0 20px 50px rgba(2,6,23,0.4)'
      }}>
        <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: 0.3 }}>
          Authentication ERROR
        </div>
        <p style={{ marginBottom: 18, color: '#cbd5e1' }}>
          You must log in to access the dashboard.
        </p>
        <Link
          to={loginPath}
          className="btn"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #0ea5e9, #2563eb)',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: 10,
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(37,99,235,0.35)'
          }}
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}