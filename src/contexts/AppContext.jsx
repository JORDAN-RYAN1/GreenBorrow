import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../lib/supabase'
import toast from 'react-hot-toast'

const AppContext = createContext({})

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [challenges, setChallenges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  // Auth functions
  const signIn = async (email, password) => {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, fullName, neighborhood) => {
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      
      // Create profile
      if (data.user) {
        await db.updateProfile(data.user.id, {
          full_name: fullName,
          neighborhood,
          email
        })
      }
      
      toast.success('Account created successfully!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setProfile(null)
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Data fetching functions
  const fetchItems = async () => {
    try {
      const { data, error } = await db.getItems()
      if (error) throw error
      setItems(data || [])
      console.log('Fetched items:', data?.length || 0) // Debug log
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to load items')
    }
  }

  const fetchChallenges = async () => {
    try {
      const { data, error } = await db.getChallenges()
      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await db.getTopUsers()
      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing session
        const { data: { user } } = await auth.getUser()
        if (user) {
          setUser(user)
          const { data: profileData } = await db.getProfile(user.id)
          if (profileData) setProfile(profileData)
        }
        
        // Load initial data
        await Promise.all([
          fetchItems(),
          fetchChallenges(), 
          fetchLeaderboard()
        ])
      } catch (error) {
        console.error('Error initializing app:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const { data: profileData } = await db.getProfile(session.user.id)
        if (profileData) setProfile(profileData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const value = {
    // Auth state
    user,
    profile,
    loading,
    
    // Auth functions
    signIn,
    signUp,
    signOut,
    
    // App data
    items,
    challenges,
    leaderboard,
    
    // Refresh functions
    fetchItems,
    fetchChallenges,
    fetchLeaderboard,
    
    // Quick demo login for hackathon - using Alice's real ID
    demoLogin: async () => {
      // Use Alice's actual ID from the database
      const aliceId = '550e8400-e29b-41d4-a716-446655440001'
      
      setUser({ 
        id: aliceId, 
        email: 'alice@example.com',
        aud: 'authenticated',
        role: 'authenticated'
      })
      
      // Fetch Alice's real profile from database
      try {
        const { data: profileData } = await db.getProfile(aliceId)
        if (profileData) {
          setProfile(profileData)
        } else {
          // Fallback profile if not found
          setProfile({
            id: aliceId,
            full_name: 'Alice Johnson',
            neighborhood: 'Charlotte',
            eco_points: 240,
            rating: 4.8,
            email: 'alice@example.com'
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        // Use fallback profile
        setProfile({
          id: aliceId,
          full_name: 'Alice Johnson',
          neighborhood: 'Charlotte',
          eco_points: 240,
          rating: 4.8,
          email: 'alice@example.com'
        })
      }
      
      toast.success('Demo mode activated as Alice!')
    }
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}