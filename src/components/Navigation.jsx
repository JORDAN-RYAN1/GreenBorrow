import { useApp } from '../contexts/AppContext'

const navigation = [
  { name: 'Dashboard', page: 'dashboard', icon: '📊' },
  { name: 'Browse Items', page: 'browse', icon: '🔍' },
  { name: 'My Items', page: 'my-items', icon: '📦' },
  { name: 'Challenges', page: 'challenges', icon: '🏆' },
  { name: 'Community', page: 'community', icon: '👥' },
  { name: 'Profile', page: 'profile', icon: '👤' }
]

export default function Navigation({ currentPage, setCurrentPage }) {
  const { profile, demoLogin } = useApp()

  return (
    <div className="navigation">
      {/* Logo */}
      <div className="logo">
        🌱 GreenBorrow
      </div>

      {/* Navigation */}
      <nav>
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentPage(item.page)}
            className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Demo login for hackathon */}
      {!profile && (
        <button onClick={demoLogin} className="demo-button">
          Demo Login
        </button>
      )}

      {/* User profile */}
      {profile && (
        <div className="user-profile">
          <div className="user-avatar">
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <h4>{profile.full_name}</h4>
            <p>{profile.eco_points} eco points</p>
          </div>
        </div>
      )}
    </div>
  )
}