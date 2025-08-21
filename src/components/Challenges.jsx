import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { db } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Challenges() {
  const { profile, challenges } = useApp()
  const [userChallenges, setUserChallenges] = useState([])
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [activeTab, setActiveTab] = useState('available')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      fetchUserChallenges()
    }
  }, [profile])

  const fetchUserChallenges = async () => {
    if (!profile) return
    try {
      const { data, error } = await db.getUserChallenges(profile.id)
      if (error) throw error
      
      const active = data?.filter(uc => !uc.completed_at) || []
      const completed = data?.filter(uc => uc.completed_at) || []
      
      setUserChallenges(active)
      setCompletedChallenges(completed)
    } catch (error) {
      console.error('Error fetching user challenges:', error)
      toast.error('Failed to load your challenges')
    }
  }

  const handleJoinChallenge = async (challengeId) => {
    if (!profile) {
      toast.error('Please login to join challenges')
      return
    }

    setLoading(true)
    try {
      const { error } = await db.joinChallenge(profile.id, challengeId)
      if (error) throw error
      
      toast.success('Challenge joined successfully! 🎯')
      fetchUserChallenges()
    } catch (error) {
      console.error('Error joining challenge:', error)
      if (error.message?.includes('duplicate')) {
        toast.error('You have already joined this challenge!')
      } else {
        toast.error('Failed to join challenge')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (userChallengeId, challengeId, challengeType) => {
    try {
      let newProgress = 0
      
      if (challengeType === 'lend') {
        // Count user's total items as lending progress
        const { data: userItems } = await db.getUserItems(profile.id)
        newProgress = userItems?.length || 0
      }
      
      // Update progress in database
      await db.updateChallengeProgress(userChallengeId, newProgress)
      
      toast.success(`Progress updated to ${newProgress}!`)
      fetchUserChallenges()
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  const handleTestProgress = async (userChallengeId, challengeId) => {
    try {
      // Simulate completing the challenge
      const completed = await db.completeChallengeIfReady(profile.id, challengeId)
      if (completed) {
        toast.success('🎉 Challenge completed! Points awarded!')
        fetchUserChallenges()
        // Refresh profile to get new points
        window.location.reload()
      } else {
        toast.error('Challenge not ready to complete yet')
      }
    } catch (error) {
      console.error('Error completing challenge:', error)
      toast.error('Failed to complete challenge')
    }
  }

  const getChallengeProgress = (challenge, userChallenge) => {
    if (!userChallenge) return 0
    return Math.min((userChallenge.progress / challenge.target_count) * 100, 100)
  }

  const getChallengeIcon = (type) => {
    const icons = {
      'borrow': '📦',
      'lend': '🤝',
      'repair': '🔧',
      'custom': '⭐'
    }
    return icons[type] || '🎯'
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

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#22c55e'
    if (progress >= 70) return '#3b82f6'
    if (progress >= 40) return '#f59e0b'
    return '#e5e7eb'
  }

  const availableChallenges = challenges.filter(challenge => 
    !userChallenges.some(uc => uc.challenge_id === challenge.id) &&
    !completedChallenges.some(cc => cc.challenge_id === challenge.id)
  )

  const activeChallenges = userChallenges.map(uc => ({
    ...uc,
    challenge: challenges.find(c => c.id === uc.challenge_id)
  })).filter(uc => uc.challenge)

  const finishedChallenges = completedChallenges.map(cc => ({
    ...cc,
    challenge: challenges.find(c => c.id === cc.challenge_id)
  })).filter(cc => cc.challenge)

  if (!profile) {
    return (
      <div className="main-content">
        <div className="no-items">
          <div className="no-items-icon">🔐</div>
          <h3>Please Login</h3>
          <p>You need to login to view and join challenges</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="challenges-header">
        <h1 className="page-title">Challenges 🏆</h1>
        <p className="page-subtitle">Join challenges, earn points, and make a difference!</p>
        
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{profile.eco_points || 0}</span>
            <span className="stat-label">Eco Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedChallenges.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{userChallenges.length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available ({availableChallenges.length})
        </button>
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          My Challenges ({activeChallenges.length})
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({finishedChallenges.length})
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {/* Available Challenges */}
        {activeTab === 'available' && (
          <div className="challenges-grid">
            {availableChallenges.map((challenge) => (
              <div key={challenge.id} className="challenge-card available">
                <div className="challenge-icon">
                  {getChallengeIcon(challenge.type)}
                </div>
                
                <div className="challenge-content">
                  <h3 className="challenge-title">{challenge.title}</h3>
                  <p className="challenge-description">{challenge.description}</p>
                  
                  <div className="challenge-meta">
                    <div className="challenge-target">
                      🎯 Target: {challenge.target_count}
                    </div>
                    <div className="challenge-reward">
                      ⭐ {challenge.points_reward} points
                    </div>
                  </div>

                  {challenge.co2_impact > 0 && (
                    <div className="challenge-impact">
                      🌍 +{challenge.co2_impact}kg CO₂ impact
                    </div>
                  )}

                  {challenge.badge_name && (
                    <div className="challenge-badge">
                      {getBadgeEmoji(challenge.badge_name)} {challenge.badge_name}
                    </div>
                  )}
                </div>

                <button 
                  className="join-btn"
                  onClick={() => handleJoinChallenge(challenge.id)}
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Challenge'}
                </button>
              </div>
            ))}

            {availableChallenges.length === 0 && (
              <div className="no-items">
                <div className="no-items-icon">🎯</div>
                <h3>All challenges joined!</h3>
                <p>You've joined all available challenges. Great job!</p>
              </div>
            )}
          </div>
        )}

        {/* Active Challenges */}
        {activeTab === 'active' && (
          <div className="challenges-grid">
            {activeChallenges.map((userChallenge) => {
              const challenge = userChallenge.challenge
              const progress = getChallengeProgress(challenge, userChallenge)
              
              return (
                <div key={userChallenge.id} className="challenge-card active">
                  <div className="challenge-icon">
                    {getChallengeIcon(challenge.type)}
                  </div>
                  
                  <div className="challenge-content">
                    <h3 className="challenge-title">{challenge.title}</h3>
                    <p className="challenge-description">{challenge.description}</p>
                    
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Progress: {userChallenge.progress} / {challenge.target_count}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: getProgressColor(progress)
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="challenge-meta">
                      <div className="challenge-reward">
                        ⭐ {challenge.points_reward} points
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="update-progress-btn"
                          onClick={() => handleUpdateProgress(userChallenge.id, challenge.id, challenge.type)}
                        >
                          📊 Update Progress
                        </button>
                        {progress >= 100 && (
                          <button 
                            className="complete-btn"
                            onClick={() => handleTestProgress(userChallenge.id, challenge.id)}
                          >
                            🎉 Complete!
                          </button>
                        )}
                      </div>
                    </div>

                    {challenge.badge_name && (
                      <div className="challenge-badge">
                        {getBadgeEmoji(challenge.badge_name)} {challenge.badge_name}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {activeChallenges.length === 0 && (
              <div className="no-items">
                <div className="no-items-icon">📋</div>
                <h3>No active challenges</h3>
                <p>Join some challenges from the Available tab to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Completed Challenges */}
        {activeTab === 'completed' && (
          <div className="challenges-grid">
            {finishedChallenges.map((userChallenge) => {
              const challenge = userChallenge.challenge
              
              return (
                <div key={userChallenge.id} className="challenge-card completed">
                  <div className="challenge-icon">
                    {getChallengeIcon(challenge.type)}
                  </div>
                  
                  <div className="challenge-content">
                    <h3 className="challenge-title">{challenge.title}</h3>
                    <p className="challenge-description">{challenge.description}</p>
                    
                    <div className="completion-info">
                      <div className="completed-date">
                        ✅ Completed on {new Date(userChallenge.completed_at).toLocaleDateString()}
                      </div>
                      <div className="points-earned">
                        ⭐ +{challenge.points_reward} points earned
                      </div>
                    </div>

                    {challenge.badge_name && (
                      <div className="challenge-badge earned">
                        {getBadgeEmoji(challenge.badge_name)} {challenge.badge_name} - EARNED!
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {finishedChallenges.length === 0 && (
              <div className="no-items">
                <div className="no-items-icon">🏅</div>
                <h3>No completed challenges yet</h3>
                <p>Complete some challenges to earn badges and points!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Challenge Tips */}
      <div className="challenge-tips">
        <h3>💡 Challenge Tips</h3>
        <div className="tips-grid">
          <div className="tip">
            <span className="tip-icon">📦</span>
            <span>Borrow items instead of buying to complete "borrow" challenges</span>
          </div>
          <div className="tip">
            <span className="tip-icon">🤝</span>
            <span>Share your items to help others and complete "lend" challenges</span>
          </div>
          <div className="tip">
            <span className="tip-icon">♻️</span>
            <span>Choose sustainable options to maximize your environmental impact</span>
          </div>
          <div className="tip">
            <span className="tip-icon">🏆</span>
            <span>Complete challenges to climb the community leaderboard</span>
          </div>
        </div>
      </div>
    </div>
  )
}