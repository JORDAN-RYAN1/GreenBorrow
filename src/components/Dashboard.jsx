import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useApp } from '../contexts/AppContext'
import { db, supabase } from '../lib/supabase'
import { formatCO2 } from '../lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const { profile, leaderboard, items } = useApp()
  const [neighborhoodStats, setNeighborhoodStats] = useState([])
  const [totalCO2Saved, setTotalCO2Saved] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Calculate real neighborhood stats from current data
      const { data: allProfiles } = await supabase.from('profiles').select('*')
      const { data: allBorrowRequests } = await supabase.from('borrow_requests').select('*, items(*)')
      
      // Group by neighborhood and calculate real stats
      const neighborhoodMap = {}
      
      allProfiles?.forEach(profile => {
        if (!neighborhoodMap[profile.neighborhood]) {
          neighborhoodMap[profile.neighborhood] = {
            neighborhood: profile.neighborhood,
            user_count: 0,
            total_points: 0,
            co2_saved: 0
          }
        }
        neighborhoodMap[profile.neighborhood].user_count++
        neighborhoodMap[profile.neighborhood].total_points += profile.eco_points || 0
      })

      // Calculate CO2 from actual borrow requests
      allBorrowRequests?.forEach(request => {
        if (request.status === 'returned' && request.items) {
          const borrowerProfile = allProfiles?.find(p => p.id === request.borrower_id)
          if (borrowerProfile && neighborhoodMap[borrowerProfile.neighborhood]) {
            neighborhoodMap[borrowerProfile.neighborhood].co2_saved += request.items.co2_saved_per_borrow || 0
          }
        }
      })

      const stats = Object.values(neighborhoodMap)
      setNeighborhoodStats(stats)
      
      // Calculate total CO2 saved
      const total = stats.reduce((sum, stat) => sum + (stat.co2_saved || 0), 0)
      setTotalCO2Saved(total)
      
      console.log('Real neighborhood stats:', stats) // Debug
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const chartData = {
    labels: neighborhoodStats.map(stat => stat.neighborhood),
    datasets: [
      {
        label: 'CO₂ Saved (kg)',
        data: neighborhoodStats.map(stat => stat.co2_saved || 0),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const categoryData = {
    labels: ['Tools', 'Appliances', 'Camping Gear', 'Books', 'Other'],
    datasets: [
      {
        data: [
          items.filter(item => item.category === 'Tools').length,
          items.filter(item => item.category === 'Appliances').length,
          items.filter(item => item.category === 'Camping Gear').length,
          items.filter(item => item.category === 'Books').length,
          items.filter(item => item.category === 'Other').length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const getRankClass = (index) => {
    return `rank-${index + 1}`
  }

  return (
    <div className="main-content">
      {/* Welcome Section */}
      <div className="welcome-section animate-fade-in">
        <h1 className="welcome-title">
          Welcome back, {profile?.full_name || 'Green Hero'}! 🌱
        </h1>
        <p className="welcome-subtitle">
          Your community has saved {formatCO2(totalCO2Saved)} of CO₂ this month
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Items Available</span>
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{items.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">CO₂ Saved</span>
            <span className="stat-icon">🌍</span>
          </div>
          <div className="stat-value">{formatCO2(totalCO2Saved)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Community Members</span>
            <span className="stat-icon">👥</span>
          </div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{leaderboard.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Your Eco Points</span>
            <span className="stat-icon">⭐</span>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{profile?.eco_points || 0}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* CO₂ Savings by Neighborhood */}
        <div className="chart-card">
          <h3 className="chart-title">CO₂ Savings by Neighborhood</h3>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Items by Category */}
        <div className="chart-card">
          <h3 className="chart-title">Items by Category</h3>
          <div className="chart-container">
            <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-card">
        <h3 className="leaderboard-title">🏆 Community Leaderboard</h3>
        <div>
          {leaderboard.slice(0, 5).map((user, index) => (
            <div key={user.full_name} className="leaderboard-item">
              <div className="leaderboard-left">
                <div className={`rank-badge ${getRankClass(index)}`}>
                  {index + 1}
                </div>
                <div className="user-info">
                  <h4>{user.full_name}</h4>
                  <p>{user.neighborhood}</p>
                </div>
              </div>
              <div className="user-stats">
                <p className="points">{user.eco_points} pts</p>
                <p className="rating">⭐ {user.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}