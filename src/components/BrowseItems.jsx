import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { db } from '../lib/supabase'
import { getCategoryIcon, formatCO2 } from '../lib/utils'
import toast from 'react-hot-toast'

export default function BrowseItems() {
  const { items, profile } = useApp()
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [borrowRequest, setBorrowRequest] = useState({
    startDate: '',
    endDate: '',
    message: ''
  })

  const categories = ['All', 'Tools', 'Appliances', 'Camping Gear', 'Books', 'Other']

  useEffect(() => {
    filterItems()
    console.log('Browse Items - Total items:', items.length) // Debug log
    console.log('Browse Items - Items:', items) // Debug log
  }, [items, selectedCategory, searchQuery])

  const filterItems = () => {
    let filtered = items

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }

  const handleBorrowRequest = async () => {
    if (!profile) {
      toast.error('Please login to borrow items')
      return
    }

    if (!borrowRequest.startDate || !borrowRequest.endDate) {
      toast.error('Please select start and end dates')
      return
    }

    console.log('=== BORROW REQUEST DEBUG ===')
    console.log('Profile:', profile)
    console.log('Selected Item:', selectedItem)
    console.log('Borrow Request Data:', {
      item_id: selectedItem.id,
      borrower_id: profile.id,
      lender_id: selectedItem.owner_id,
      start_date: borrowRequest.startDate,
      end_date: borrowRequest.endDate,
      message: borrowRequest.message,
      status: 'pending'
    })

    try {
      const { data, error } = await db.createBorrowRequest({
        item_id: selectedItem.id,
        borrower_id: profile.id,
        lender_id: selectedItem.owner_id,
        start_date: borrowRequest.startDate,
        end_date: borrowRequest.endDate,
        message: borrowRequest.message,
        status: 'pending'
      })

      console.log('Borrow request response:', { data, error })

      if (error) throw error

      toast.success('Borrow request sent successfully!')
      setSelectedItem(null)
      setBorrowRequest({ startDate: '', endDate: '', message: '' })
    } catch (error) {
      console.error('Error creating borrow request:', error)
      toast.error('Failed to send borrow request: ' + error.message)
    }
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

  return (
    <div className="main-content">
      {/* Header */}
      <div className="browse-header">
        <h1 className="page-title">Browse Items 🔍</h1>
        <p className="page-subtitle">Discover tools, gear, and items shared by your neighbors</p>
      </div>

      {/* Search & Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="search-input-browse"
          />
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category !== 'All' && <span>{getCategoryIcon(category)}</span>}
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card" onClick={() => setSelectedItem(item)}>
            <div className="item-image">
              <div className="item-placeholder">
                <span className="item-icon">{getCategoryIcon(item.category)}</span>
              </div>
              <div className="item-category-badge">
                {item.category}
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
                <div className="item-co2">
                  🌍 {formatCO2(item.co2_saved_per_borrow)} saved
                </div>
              </div>

              <div className="item-owner">
                <div className="owner-avatar">
                  {item.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="owner-info">
                  <span className="owner-name">{item.profiles?.full_name}</span>
                  <span className="owner-location">{item.profiles?.neighborhood}</span>
                </div>
                <div className="owner-rating">
                  ⭐ {item.profiles?.rating || 0}
                </div>
              </div>
            </div>

            <div className="item-footer">
              <button className="borrow-btn">
                Request to Borrow
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No items found */}
      {filteredItems.length === 0 && (
        <div className="no-items">
          <div className="no-items-icon">📭</div>
          <h3>No items found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedItem.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="item-detail-image">
                <div className="item-placeholder large">
                  <span className="item-icon large">{getCategoryIcon(selectedItem.category)}</span>
                </div>
              </div>

              <div className="item-details">
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedItem.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Condition:</span>
                  <span 
                    className="detail-value"
                    style={{ color: getConditionColor(selectedItem.condition) }}
                  >
                    {selectedItem.condition}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">CO₂ Impact:</span>
                  <span className="detail-value">🌍 {formatCO2(selectedItem.co2_saved_per_borrow)} saved per borrow</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Owner:</span>
                  <span className="detail-value">{selectedItem.profiles?.full_name} ({selectedItem.profiles?.neighborhood})</span>
                </div>
              </div>

              <div className="description">
                <h4>Description</h4>
                <p>{selectedItem.description}</p>
              </div>

              {profile && profile.id !== selectedItem.owner_id && (
                <div className="borrow-form">
                  <h4>Request to Borrow</h4>
                  
                  <div className="date-inputs">
                    <div className="date-field">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={borrowRequest.startDate}
                        onChange={(e) => setBorrowRequest({...borrowRequest, startDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="date-field">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={borrowRequest.endDate}
                        onChange={(e) => setBorrowRequest({...borrowRequest, endDate: e.target.value})}
                        min={borrowRequest.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="message-field">
                    <label>Message (optional)</label>
                    <textarea
                      value={borrowRequest.message}
                      onChange={(e) => setBorrowRequest({...borrowRequest, message: e.target.value})}
                      placeholder="Tell the owner why you need this item..."
                      rows="3"
                    />
                  </div>

                  <button className="submit-request-btn" onClick={handleBorrowRequest}>
                    Send Borrow Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}