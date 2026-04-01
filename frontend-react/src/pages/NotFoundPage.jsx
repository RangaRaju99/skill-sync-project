import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>Page not found</p>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '12px 24px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default NotFoundPage;
