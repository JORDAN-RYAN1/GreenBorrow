import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { db } from '../lib/supabase'
import { getCategoryIcon, formatCO2, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

export default function MyItems() {
  const { profile, fetchItems } = useApp()
  const [myItems, setMyItems] = useState([])
  const [borrowRequests, setBorrowRequests] = useState([])
  const [activeTab, setActiveTab] = useState('my-items')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'Tools',
    condition: 'Good',
    co2_saved_per_borrow: 5
  })

  const categories = ['Tools', 'Appliances', 'Camping Gear', 'Books', 'Other']
  const conditions = ['Like New', 'Good', 'Fair', 'Poor']

  useEffect(() => {
    if (profile) {
      fetchMyItems()
      fetchBorrowRequests()
    }
  }, [profile])

  const fetchMyItems = async () => {
    if (!profile) return
    try {
      const { data, error } = await db.getUserItems(profile.id)
      if (error) throw error
      console.log('My items fetched:', data?.length || 0)
      setMyItems(data || [])
    } catch (error) {
      console.error('Error fetching my items:', error)
      toast.error('Failed to load your items')
    }
  }

  const fetchBorrowRequests = async () => {
    if (!profile) return
    try {
      console.log('Fetching borrow requests for user:', profile.id)
      const { data, error } = await db.getUserBorrowRequests(profile.id)
      if (error) throw error
      console.log('Borrow requests fetched:', data)
      setBorrowRequests(data || [])
    } catch (error) {
      console.error('Error fetching borrow requests:', error)
      toast.error('Failed to load borrow requests')
    }
  }

  const handleAddItem = async () => {
    if (!profile) {
      toast.error('Please login to add items')
      return
    }

    if (!newItem.title || !newItem.description) {
      toast.error('Please fill in title and description')
      return
    }

    try {
      const { error } = await db.createItem({
        ...newItem,
        owner_id: profile.id,
        status: 'available'
      })

      if (error) throw error

      toast.success('Item added successfully!')
      setShowAddForm(false)
      setNewItem({
        title: '',
        description: '',
        category: 'Tools',
        condition: 'Good',
        co2_saved_per_borrow: 5
      })
      
      // Refresh both my items and global items list
      fetchMyItems()
      fetchItems() // This will update Browse Items too!
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const { error } = await db.deleteItem(itemId)
      if (error) throw error
      
      toast.success('Item deleted successfully!')
      fetchMyItems()
      fetchItems() // Refresh browse items too
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleEditItem = (item) => {
    // For now, just open the edit form with the item data
    setNewItem({
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      co2_saved_per_borrow: item.co2_saved_per_borrow
    })
    setShowAddForm(true)
    // You could add an editingItemId state to track which item is being edited
  }

  const handleUpdateRequest = async (requestId, newStatus) => {
    try {
      const { error } = await db.updateBorrowRequest(requestId, { status: newStatus })
      if (error) throw error
      
      toast.success(`Request ${newStatus}!`)
      fetchBorrowRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Failed to update request')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'approved': '#22c55e',
      'picked_up': '#3b82f6',
      'returned': '#6b7280',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getConditionColor = (condition) => {
    const colors = {
      'Like New': '#22c55e',
      'Good': '#3b82f6',
      'Fair': '#f59e0b',
      'Poor': '#ef4444'
    }
    return colors[condition] || '#6b7280'
  }

  if (!profile) {
    return (
      <div className="main-content">
        <div className="no-items">
          <div className="no-items-icon">🔐</div>
          <h3>Please Login</h3>
          <p>You need to login to manage your items</p>
        </div>
      </div>
    )
  }

  // Filter requests - incoming requests for my items
  const incomingRequests = borrowRequests.filter(req => req.lender_id === profile.id)
  // Outgoing requests - requests I've made to borrow others' items
  const outgoingRequests = borrowRequests.filter(req => req.borrower_id === profile.id)

  console.log('All borrow requests:', borrowRequests)
  console.log('Incoming requests:', incomingRequests)
  console.log('Outgoing requests:', outgoingRequests)
  console.log('Current profile ID:', profile.id)

  return (
    <div className="main-content">
      {/* Header */}
      <div className="my-items-header">
        <div>
          <h1 className="page-title">My Items 📦</h1>
          <p className="page-subtitle">Manage your shared items and borrow requests</p>
        </div>
        
        <button 
          className="add-item-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Item
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'my-items' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-items')}
        >
          My Items ({myItems.length})
        </button>
        <button 
          className={`tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Requests ({incomingRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          My Requests ({outgoingRequests.length})
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {/* My Items Tab */}
        {activeTab === 'my-items' && (
          <div className="items-grid">
            {myItems.map((item) => (
              <div key={item.id} className="my-item-card">
                <div className="item-image">
                  <div className="item-placeholder">
                    <span className="item-icon">{getCategoryIcon(item.category)}</span>
                  </div>
                  <div className="item-status-badge" style={{ backgroundColor: item.status === 'available' ? '#22c55e' : '#f59e0b' }}>
                    {item.status}
                  </div>
                </div>

                <div className="item-content">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.description}</p>

                  <div className="item-meta">
                    <div className="item-condition">
                      <span 
                        className="condition-dot"
                        style={{ backgroundColor: getConditionColor(item.condition) }}
                      ></span>
                      {item.condition}
                    </div>
                    <div className="item-category">
                      {item.category}
                    </div>
                  </div>

                  <div className="item-stats">
                    <span>🌍 {formatCO2(item.co2_saved_per_borrow)} per borrow</span>
                  </div>
                </div>

                <div className="item-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {myItems.length === 0 && (
              <div className="no-items">
                <div className="no-items-icon">📦</div>
                <h3>No items yet</h3>
                <p>Add your first item to start sharing with the community</p>
              </div>
            )}
          </div>
        )}

        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && (
          <div className="requests-list">
            {incomingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-item">
                    <span className="item-icon">{getCategoryIcon(request.items?.category)}</span>
                    <div>
                      <h4>{request.items?.title}</h4>
                      <p>{request.items?.category}</p>
                    </div>
                  </div>
                  <div 
                    className="request-status"
                    style={{ color: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </div>
                </div>

                <div className="request-details">
                  <div className="requester-info">
                    <div className="user-avatar">
                      {request.borrower?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <strong>{request.borrower?.full_name}</strong>
                      <p>wants to borrow from {formatDate(request.start_date)} to {formatDate(request.end_date)}</p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="request-message">
                      <strong>Message:</strong>
                      <p>"{request.message}"</p>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleUpdateRequest(request.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button 
                      className="decline-btn"
                      onClick={() => handleUpdateRequest(request.id, 'cancelled')}
                    >
                      Decline
                    </button>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="request-actions">
                    <button 
                      className="mark-btn"
                      onClick={() => handleUpdateRequest(request.id, 'picked_up')}
                    >
                      Mark as Picked Up
                    </button>
                  </div>
                )}

                {request.status === 'picked_up' && (
                  <div className="request-actions">
                    <button 
                      className="mark-btn"
                      onClick={() => handleUpdateRequest(request.id, 'returned')}
                    >
                      Mark as Returned
                    </button>
                  </div>
                )}
              </div>
            ))}

            {incomingRequests.length === 0 && (
              <div className="no-items">
                <div className="no-items-icon">📨</div>
                <h3>No incoming requests</h3>
                <p>When people want to borrow your items, they'll appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Outgoing Requests Tab */}
        {activeTab === 'outgoing' && (
          <div className="requests-list">
            {outgoingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-item">
                    <span className="item-icon">{getCategoryIcon(request.items?.category)}</span>
                    <div>
                      <h4>{request.items?.title}</h4>
                      <p>Owner: {request.lender?.full_name}</p>
                    </div>
                  </div>
                  <div 
                    className="request-status"
                    style={{ color: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </div>
                </div>

                <div className="request-details">
                  <p>Requested for {formatDate(request.start_date)} to {formatDate(request.end_date)}</p>
                  
                  {request.message && (
                    <div className="request-message">
                      <strong>Your message:</strong>
                      <p>"{request.message}"</p>
                    </div>
                  )}
                </div>

                <div className="request-info">
                  {request.status === 'pending' && <p>⏳ Waiting for owner's response</p>}
                  {request.status === 'approved' && <p>✅ Approved! You can pick it up</p>}
                  {request.status === 'picked_up' && <p>📦 You have this item</p>}
                  {request.status === 'returned' && <p>🎉 Successfully returned</p>}
                  {request.status === 'cancelled' && <p>❌ Request declined</p>}
                </div>
              </div>
            ))}

            {outgoingRequests.length === 0 && (
              <div className="no-items">
                <div className="no-items-icon">📤</div>
                <h3>No outgoing requests</h3>
                <p>Browse items and make requests to borrow from neighbors</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="add-form">
                <div className="form-field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="e.g., Power Drill, Camping Tent..."
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Describe your item, any special instructions..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Condition</label>
                    <select
                      value={newItem.condition}
                      onChange={(e) => setNewItem({...newItem, condition: e.target.value})}
                    >
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>CO₂ Saved per Borrow (kg)</label>
                  <input
                    type="number"
                    value={newItem.co2_saved_per_borrow}
                    onChange={(e) => setNewItem({...newItem, co2_saved_per_borrow: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                  <small>Estimated CO₂ savings when someone borrows instead of buying new</small>
                </div>

                <button className="submit-btn" onClick={handleAddItem}>
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}