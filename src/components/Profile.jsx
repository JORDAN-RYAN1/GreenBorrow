import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { db } from '../lib/supabase'
import { formatCO2, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, signOut } = useApp()
  const [userStats, setUserStats] = useState({
    totalItemsShared: 0,
    totalBorrows: 0,
    totalLends: 0,
    co2Impact: 0,
    challengesCompleted: 0,
    memberSince: null
  })
  const [userItems, setUserItems] = useState([])
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [userReviews, setUserReviews] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    neighborhood: ''
  })

  useEffect(() => {
    if (profile) {
      fetchUserData()
      setEditForm({
        full_name: profile.full_name || '',
        neighborhood: profile.neighborhood || ''
      })
    }
  }, [profile])

  const fetchUserData = async () => {
    if (!profile) return

    try {
      // Fetch user's items
      const { data: items } = await db.getUserItems(profile.id)
      setUserItems(items || [])

      // Fetch borrow requests to calculate stats
      const { data: requests } = await db.getUserBorrowRequests(profile.id)
      const borrowRequests = requests?.filter(r => r.borrower_id === profile.id) || []
      const lendRequests = requests?.filter(r => r.lender_id === profile.id) || []

      // Fetch completed challenges
      const { data: challenges } = await db.getUserChallenges(profile.id)
      const completed = challenges?.filter(c => c.completed_at) || []
      setCompletedChallenges(completed)

      // Fetch reviews
      const { data: reviews } = await db.getReviewsForUser(profile.id)
      setUserReviews(reviews || [])

      // Calculate CO2 impact
      const itemsCO2 = (items || []).reduce((sum, item) => sum + (item.co2_saved_per_borrow || 0), 0)
      const challengesCO2 = completed.reduce((sum, c) => sum + (c.challenges?.co2_impact || 0), 0)

      setUserStats({
        totalItemsShared: items?.length || 0,
        totalBorrows: borrowRequests.length,
        totalLends: lendRequests.filter(r => r.status === 'returned').length,
        co2Impact: itemsCO2 + challengesCO2,
        challengesCompleted: completed.length,
        memberSince: profile.created_at || new Date().toISOString()
      })

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load profile data')
    }
  }

  const handleEditProfile = async () => {
    try {
      const { error } = await db.updateProfile(profile.id, editForm)
      if (error) throw error

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      // Refresh the page to get updated profile
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const getBadgeEmoji = (badgeName) => {
    const badges = {
      'Sharing Champion': '🏆',
      'Community Helper': '🤝',
      'Plastic Warrior': '♻️',
      'Repair Hero': '🔧',
      'First Steps': '👶'
    }
    return badges[badgeName] || '🏅'
  }

  const getAchievementLevel = (points) => {
    if (points >= 500) return { level: 'Eco Master', icon: '🌟', color: '#8b5cf6' }
    if (points >= 300) return { level: 'Green Hero', icon: '🦸', color: '#22c55e' }
    if (points >= 150) return { level: 'Planet Helper', icon: '🌍', color: '#3b82f6' }
    if (points >= 50) return { level: 'Eco Warrior', icon: '⚡', color: '#f59e0b' }
    return { level: 'Beginner', icon: '🌱', color: '#6b7280' }
  }

  if (!profile) {
    return (
      <div className="main-content">
        <div className="no-items">
          <div className="no-items-icon">🔐</div>
          <h3>Please Login</h3>
          <p>You need to login to view your profile</p>
        </div>
      </div>
    )
  }

  const achievement = getAchievementLevel(profile.eco_points || 0)

  return (
    <div className="main-content">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-main">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <div className="achievement-badge" style={{ backgroundColor: achievement.color }}>
              {achievement.icon}
            </div>
          </div>
          
          <div className="profile-info">
            {!isEditing ? (
              <>
                <h1 className="profile-name">{profile.full_name}</h1>
                <p className="profile-location">📍 {profile.neighborhood}</p>
                <div className="profile-level">
                  <span style={{ color: achievement.color }}>
                    {achievement.icon} {achievement.level}
                  </span>
                </div>
              </>
            ) : (
              <div className="edit-form">
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  placeholder="Full Name"
                  className="edit-input"
                />
                <input
                  type="text"
                  value={editForm.neighborhood}
                  onChange={(e) => setEditForm({...editForm, neighborhood: e.target.value})}
                  placeholder="Neighborhood"
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button onClick={handleEditProfile} className="save-btn">Save</button>
                  <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
              ✏️ Edit Profile
            </button>
          )}
          <button onClick={signOut} className="signout-btn">
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{profile.eco_points || 0}</div>
            <div className="stat-label">Eco Points</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{profile.rating || 0}</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-number">{userStats.totalItemsShared}</div>
            <div className="stat-label">Items Shared</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-number">{formatCO2(userStats.co2Impact)}</div>
            <div className="stat-label">CO₂ Impact</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-number">{userStats.challengesCompleted}</div>
            <div className="stat-label">Challenges</div>
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
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              {/* Impact Summary */}
              <div className="overview-card">
                <h3>🌱 Your Environmental Impact</h3>
                <div className="impact-metrics">
                  <div className="impact-item">
                    <span className="impact-value">{formatCO2(userStats.co2Impact)}</span>
                    <span className="impact-label">Total CO₂ Saved</span>
                  </div>
                  <div className="impact-item">
                    <span className="impact-value">{userStats.totalLends}</span>
                    <span className="impact-label">Successful Lends</span>
                  </div>
                  <div className="impact-item">
                    <span className="impact-value">{userStats.totalBorrows}</span>
                    <span className="impact-label">Items Borrowed</span>
                  </div>
                </div>
              </div>

              {/* Recent Items */}
              <div className="overview-card">
                <h3>📦 Recent Items</h3>
                <div className="recent-items">
                  {userItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="recent-item">
                      <span className="item-title">{item.title}</span>
                      <span className="item-category">{item.category}</span>
                    </div>
                  ))}
                  {userItems.length === 0 && (
                    <p className="no-data">No items shared yet</p>
                  )}
                </div>
              </div>

              {/* Member Info */}
              <div className="overview-card">
                <h3>👤 Member Info</h3>
                <div className="member-info">
                  <div className="info-item">
                    <span className="info-label">Member Since:</span>
                    <span className="info-value">
                      {formatDate(userStats.memberSince)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Reviews:</span>
                    <span className="info-value">{profile.total_reviews || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Achievement Level:</span>
                    <span className="info-value" style={{ color: achievement.color }}>
                      {achievement.icon} {achievement.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-content">
            <div className="activity-summary">
              <h3>📊 Activity Summary</h3>
              <div className="activity-stats">
                <div className="activity-stat">
                  <div className="activity-number">{userStats.totalItemsShared}</div>
                  <div className="activity-label">Items Shared</div>
                </div>
                <div className="activity-stat">
                  <div className="activity-number">{userStats.totalBorrows}</div>
                  <div className="activity-label">Borrows Made</div>
                </div>
                <div className="activity-stat">
                  <div className="activity-number">{userStats.totalLends}</div>
                  <div className="activity-label">Successful Lends</div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            {userReviews.length > 0 && (
              <div className="reviews-section">
                <h3>⭐ Recent Reviews</h3>
                <div className="reviews-list">
                  {userReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
                        <div className="review-date">
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                      <div className="review-comment">
                        "{review.comment}"
                      </div>
                      <div className="review-author">
                        - {review.reviewer?.full_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="achievements-content">
            <div className="achievements-header">
              <h3>🏆 Your Achievements</h3>
              <p>Badges earned from completing challenges</p>
            </div>

            <div className="badges-grid">
              {completedChallenges.map((challenge) => (
                <div key={challenge.id} className="badge-card">
                  <div className="badge-icon">
                    {getBadgeEmoji(challenge.challenges?.badge_name)}
                  </div>
                  <div className="badge-content">
                    <div className="badge-name">{challenge.challenges?.badge_name}</div>
                    <div className="badge-description">{challenge.challenges?.title}</div>
                    <div className="badge-date">
                      Earned {formatDate(challenge.completed_at)}
                    </div>
                    <div className="badge-points">
                      +{challenge.challenges?.points_reward} points
                    </div>
                  </div>
                </div>
              ))}

              {completedChallenges.length === 0 && (
                <div className="no-badges">
                  <div className="no-badges-icon">🏅</div>
                  <h4>No badges yet</h4>
                  <p>Complete challenges to earn your first badge!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="settings-section">
              <h3>⚙️ Account Settings</h3>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">Email Notifications</div>
                    <div className="setting-description">Receive updates about borrow requests</div>
                  </div>
                  <button className="setting-toggle enabled">ON</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">Challenge Notifications</div>
                    <div className="setting-description">Get notified about new challenges</div>
                  </div>
                  <button className="setting-toggle enabled">ON</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-title">Profile Visibility</div>
                    <div className="setting-description">Show your profile to other community members</div>
                  </div>
                  <button className="setting-toggle enabled">PUBLIC</button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>🔒 Privacy & Data</h3>
              <div className="privacy-info">
                <p>Your data is securely stored and only used to provide GreenBorrow services. We never share your personal information with third parties.</p>
                <div className="privacy-actions">
                  <button className="privacy-btn">Download My Data</button>
                  <button className="privacy-btn danger">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}