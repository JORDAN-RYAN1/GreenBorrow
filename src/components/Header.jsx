import { useApp } from '../contexts/AppContext'

export default function Header() {
  const { profile } = useApp()

  return (
    <header className="header">
      {/* Left side - Logo or title */}
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}></h2>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notifications */}
        <button style={{ position: 'relative', padding: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
        </button>

        {/* User menu */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
            <div className="user-avatar">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ display: 'block' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{profile.full_name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{profile.neighborhood}</div>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <button style={{ padding: '8px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 818.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </header>
  )
}