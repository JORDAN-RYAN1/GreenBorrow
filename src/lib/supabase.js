import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const auth = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback)
}

export const db = {
  // Profile operations
  getProfile: (userId) => 
    supabase.from('profiles').select('*').eq('id', userId).single(),
  
  updateProfile: (userId, updates) =>
    supabase.from('profiles').update(updates).eq('id', userId),

  // Item operations
  getItems: () => 
    supabase.from('items').select(`
      *,
      profiles:owner_id (full_name, neighborhood, rating)
    `).eq('status', 'available'),
  
  getItemsByCategory: (category) =>
    supabase.from('items').select(`
      *,
      profiles:owner_id (full_name, neighborhood, rating)
    `).eq('category', category).eq('status', 'available'),

  getUserItems: (userId) =>
    supabase.from('items').select('*').eq('owner_id', userId),

  createItem: (item) =>
    supabase.from('items').insert([item]),

  deleteItem: (itemId) =>
    supabase.from('items').delete().eq('id', itemId),

  updateItem: (itemId, updates) =>
    supabase.from('items').update(updates).eq('id', itemId),

  // Borrow request operations
  createBorrowRequest: (request) =>
    supabase.from('borrow_requests').insert([request]),

  getUserBorrowRequests: (userId) =>
    supabase.from('borrow_requests').select(`
      *,
      items (title, category),
      lender:lender_id (full_name),
      borrower:borrower_id (full_name)
    `).or(`borrower_id.eq.${userId},lender_id.eq.${userId}`),

  updateBorrowRequest: (id, updates) =>
    supabase.from('borrow_requests').update(updates).eq('id', id),

  // Challenge operations
  getChallenges: () =>
    supabase.from('challenges').select('*').eq('is_active', true),

  getUserChallenges: (userId) =>
    supabase.from('user_challenges').select(`
      *,
      challenges (*)
    `).eq('user_id', userId),

  joinChallenge: (userId, challengeId) =>
    supabase.from('user_challenges').insert([{ user_id: userId, challenge_id: challengeId }]),

  updateChallengeProgress: (userChallengeId, newProgress) =>
    supabase.from('user_challenges').update({ progress: newProgress }).eq('id', userChallengeId),

  completeChallengeIfReady: async (userId, challengeId) => {
    // Get the challenge and user progress
    const { data: userChallenge } = await supabase
      .from('user_challenges')
      .select('*, challenges(*)')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    if (userChallenge && userChallenge.progress >= userChallenge.challenges.target_count && !userChallenge.completed_at) {
      // Mark as completed and award points
      await supabase
        .from('user_challenges')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', userChallenge.id)

      // Award points to user
      const { data: profile } = await supabase
        .from('profiles')
        .select('eco_points')
        .eq('id', userId)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ eco_points: profile.eco_points + userChallenge.challenges.points_reward })
          .eq('id', userId)
      }

      return true // Challenge completed
    }
    return false // Not ready to complete
  },

  // Leaderboard operations
  getTopUsers: (limit = 10) =>
    supabase.from('user_leaderboard').select('*').limit(limit),

  getNeighborhoodStats: () =>
    supabase.from('neighborhood_stats').select('*'),

  // Review operations
  createReview: (review) =>
    supabase.from('reviews').insert([review]),

  getReviewsForUser: (userId) =>
    supabase.from('reviews').select(`
      *,
      reviewer:reviewer_id (full_name)
    `).eq('reviewee_id', userId)
}