import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import BrowseItems from './components/BrowseItems'
import MyItems from './components/MyItems'
import Challenges from './components/Challenges'
import Community from './components/Community'
import Profile from './components/Profile'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'browse':
        return <BrowseItems />
      case 'my-items':
        return <MyItems />
      case 'challenges':
        return <Challenges />
      case 'community':
        return <Community />
      case 'profile':
        return <Profile />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppProvider>
      <div style={{ '--current-page': `"${currentPage}"` }}>
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
          {renderPage()}
        </Layout>
      </div>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AppProvider>
  )
}

export default App