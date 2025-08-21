import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { db } from '../lib/supabase'
import { formatCO2, formatDate } from '../lib/utils'

export default function Community() {
  const { profile, leaderboard } = useApp()
  const [neighborhoodStats, setNeighborhoodStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [communityMetrics, setCommunityMetrics] = useState({
    totalCO2Saved: 0,
    totalItems: 0,
    totalMembers: 0,
    totalBorrows: 0
  })
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    try {
      // Fetch neighborhood stats
      const { data: stats } = await db.getNeighborhoodStats()
      setNeighborhoodStats(stats || [])

      // Calculate community metrics
      const totalCO2 = stats?.reduce((sum, stat) => sum + (stat.co2_saved || 0), 0) || 0
      const totalMembers = stats?.reduce((sum, stat) => sum + (stat.user_count || 0), 0) || 0
      
      // Fetch total items and borrows
      const { data: allItems } = await db.getItems()
      const { data: allRequests, error: requestsError } = await db.supabase
        .from('borrow_requests')
        .select('*')
        .eq('status', 'returned')

      setCommunityMetrics({
        totalCO2Saved: totalCO2,
        totalItems: allItems?.length || 0,
        totalMembers: totalMembers,
        totalBorrows: allRequests?.length || 0
      })

      // Generate recent activity (mock for demo)
      generateRecentActivity()
    } catch (error) {
      console.error('Error fetching community data:', error)
    }
  }

  const generateRecentActivity = () => {
    // Mock recent activity for demo
    const activities = [
      {
        id: 1,
        type: 'borrow',
        user: 'Alice Johnson',
        item: 'Power Drill',
        neighborhood: 'Charlotte',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        co2Impact: 5
      },
      {
        id: 2,
        type: 'challenge',
        user: 'Bob Smith',
        challenge: 'Borrow 3 Items',
        neighborhood: 'Charlotte',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        points: 60
      },
      {
        id: 3,
        type: 'lend',
        user: 'Carol Williams',
        item: 'Camping Tent',
        neighborhood: 'Charlotte',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        co2Impact: 3
      },
      {
        id: 4,
        type: 'join',
        user: 'David Brown',
        neighborhood: 'Raleigh',
        time: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: 5,
        type: 'challenge',
        user: 'Emma Davis',
        challenge: 'Go Plastic-Free Week',
        neighborhood: 'Raleigh',
        time: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        points: 50
      }
    ]
    setRecentActivity(activities)
  }

  const getActivityIcon = (type) => {
    const icons = {
      'borrow': '📦',
      'lend': '🤝',
      'challenge': '🏆',
      'join': '👋'
    }
    return icons[type] || '📍'
  }

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'borrow':
        return `borrowed ${activity.item} and saved ${formatCO2(activity.co2Impact)} CO₂`
      case 'lend':
        return `shared ${activity.item} with the community`
      case 'challenge':
        return `completed "${activity.challenge}" and earned ${activity.points} points`
      case 'join':
        return `joined the GreenBorrow community`
      default:
        return 'had some activity'
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

  const getNeighborhoodRank = (neighborhood) => {
    const sorted = [...neighborhoodStats].sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    return sorted.findIndex(stat => stat.neighborhood === neighborhood) + 1
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="community-header">
        <h1 className="page-title">Community 👥</h1>
        <p className="page-subtitle">See how your neighborhood is making a difference together</p>
      </div>

      {/* Community Impact Stats */}
      <div className="impact-stats">
        <div className="impact-card">
          <div className="impact-icon">🌍</div>
          <div className="impact-content">
            <div className="impact-number">{formatCO2(communityMetrics.totalCO2Saved)}</div>
            <div className="impact-label">Total CO₂ Saved</div>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-icon">📦</div>
          <div className="impact-content">
            <div className="impact-number">{communityMetrics.totalItems}</div>
            <div className="impact-label">Items Shared</div>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-icon">👥</div>
          <div className="impact-content">
            <div className="impact-number">{communityMetrics.totalMembers}</div>
            <div className="impact-label">Community Members</div>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-icon">🤝</div>
          <div className="impact-content">
            <div className="impact-number">{communityMetrics.totalBorrows}</div>
            <div className="impact-label">Successful Borrows</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'neighborhoods' ? 'active' : ''}`}
          onClick={() => setActiveTab('neighborhoods')}
        >
          Neighborhoods
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Recent Activity
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Your Neighborhood Card */}
            {profile && (
              <div className="neighborhood-highlight">
                <h3>🏘️ Your Neighborhood: {profile.neighborhood}</h3>
                <div className="neighborhood-stats">
                  <div className="stat">
                    <span className="stat-value">#{getNeighborhoodRank(profile.neighborhood)}</span>
                    <span className="stat-label">Community Rank</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {neighborhoodStats.find(stat => stat.neighborhood === profile.neighborhood)?.co2_saved || 0}kg
                    </span>
                    <span className="stat-label">CO₂ Saved</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {neighborhoodStats.find(stat => stat.neighborhood === profile.neighborhood)?.user_count || 0}
                    </span>
                    <span className="stat-label">Members</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Contributors */}
            <div className="section">
              <h3>🌟 Top Contributors</h3>
              <div className="contributors-list">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div key={user.full_name} className="contributor-card">
                    <div className="contributor-rank">#{index + 1}</div>
                    <div className="contributor-avatar">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="contributor-info">
                      <div className="contributor-name">{user.full_name}</div>
                      <div className="contributor-location">{user.neighborhood}</div>
                    </div>
                    <div className="contributor-stats">
                      <div className="contributor-points">{user.eco_points} pts</div>
                      <div className="contributor-rating">⭐ {user.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Goals */}
            <div className="section">
              <h3>🎯 Community Goals</h3>
              <div className="goals-grid">
                <div className="goal-card">
                  <div className="goal-icon">🌱</div>
                  <div className="goal-content">
                    <div className="goal-title">Save 100kg CO₂</div>
                    <div className="goal-progress">
                      <div className="goal-bar">
                        <div 
                          className="goal-fill"
                          style={{ width: `${Math.min((communityMetrics.totalCO2Saved / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="goal-text">
                        {Math.round(communityMetrics.totalCO2Saved)}/100 kg
                      </div>
                    </div>
                  </div>
                </div>
                <div className="goal-card">
                  <div className="goal-icon">👥</div>
                  <div className="goal-content">
                    <div className="goal-title">Reach 50 Members</div>
                    <div className="goal-progress">
                      <div className="goal-bar">
                        <div 
                          className="goal-fill"
                          style={{ width: `${Math.min((communityMetrics.totalMembers / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="goal-text">
                        {communityMetrics.totalMembers}/50 members
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Neighborhoods Tab */}
        {activeTab === 'neighborhoods' && (
          <div className="neighborhoods-content">
            <div className="neighborhoods-grid">
              {neighborhoodStats.map((stat, index) => (
                <div key={stat.neighborhood} className="neighborhood-card">
                  <div className="neighborhood-header">
                    <div className="neighborhood-rank">#{index + 1}</div>
                    <div className="neighborhood-name">{stat.neighborhood}</div>
                  </div>
                  <div className="neighborhood-metrics">
                    <div className="metric">
                      <span className="metric-icon">🌍</span>
                      <span className="metric-value">{formatCO2(stat.co2_saved || 0)}</span>
                      <span className="metric-label">CO₂ Saved</span>
                    </div>
                    <div className="metric">
                      <span className="metric-icon">👥</span>
                      <span className="metric-value">{stat.user_count || 0}</span>
                      <span className="metric-label">Members</span>
                    </div>
                    <div className="metric">
                      <span className="metric-icon">⭐</span>
                      <span className="metric-value">{stat.total_points || 0}</span>
                      <span className="metric-label">Total Points</span>
                    </div>
                  </div>
                  {profile?.neighborhood === stat.neighborhood && (
                    <div className="your-neighborhood">Your Neighborhood 🏠</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-content">
            <div className="activity-feed">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <strong>{activity.user}</strong> {getActivityMessage(activity)}
                    </div>
                    <div className="activity-meta">
                      <span className="activity-location">{activity.neighborhood}</span>
                      <span className="activity-time">{getTimeAgo(activity.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}