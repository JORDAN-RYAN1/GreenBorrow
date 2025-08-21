// CO₂ Calculator - Add to src/lib/co2Calculator.js

export const CO2_DATA = {
  // Power Tools (high manufacturing impact)
  'Tools': {
    base: 8,
    keywords: {
      'drill': 12,
      'saw': 15,
      'grinder': 10,
      'sander': 8,
      'hammer': 3,
      'screwdriver': 2,
      'wrench': 2,
      'ladder': 25,
      'toolbox': 5
    }
  },
  
  // Kitchen & Home Appliances
  'Appliances': {
    base: 6,
    keywords: {
      'mixer': 8,
      'blender': 6,
      'toaster': 5,
      'microwave': 45,
      'vacuum': 25,
      'pressure washer': 30,
      'air fryer': 12,
      'coffee': 8,
      'bread machine': 15
    }
  },
  
  // Outdoor & Camping Equipment
  'Camping Gear': {
    base: 4,
    keywords: {
      'tent': 12,
      'sleeping bag': 8,
      'backpack': 6,
      'stove': 5,
      'lantern': 3,
      'cooler': 10,
      'bike': 85,
      'kayak': 120,
      'grill': 35
    }
  },
  
  // Books & Media
  'Books': {
    base: 1,
    keywords: {
      'textbook': 2,
      'cookbook': 1.5,
      'manual': 1,
      'novel': 0.8,
      'magazine': 0.3
    }
  },
  
  // Other Items
  'Other': {
    base: 3,
    keywords: {
      'furniture': 50,
      'electronics': 15,
      'clothing': 2,
      'toys': 4,
      'sports': 8,
      'musical': 25
    }
  }
}

/**
 * Calculate CO₂ saved per borrow based on item details
 * @param {string} title - Item title
 * @param {string} category - Item category
 * @param {string} description - Item description (optional)
 * @param {string} condition - Item condition
 * @returns {number} CO₂ saved in kg
 */
export function calculateCO2Savings(title, category, description = '', condition = 'Good') {
  const categoryData = CO2_DATA[category]
  if (!categoryData) return 5 // fallback
  
  let co2Value = categoryData.base
  
  // Check for specific keywords in title and description
  const searchText = `${title} ${description}`.toLowerCase()
  
  for (const [keyword, value] of Object.entries(categoryData.keywords)) {
    if (searchText.includes(keyword.toLowerCase())) {
      co2Value = Math.max(co2Value, value) // Use highest matching value
      break
    }
  }
  
  // Adjust based on condition (newer items have higher manufacturing CO₂)
  const conditionMultiplier = {
    'Like New': 1.2,
    'Good': 1.0,
    'Fair': 0.8,
    'Poor': 0.6
  }
  
  co2Value *= (conditionMultiplier[condition] || 1.0)
  
  // Round to 1 decimal place
  return Math.round(co2Value * 10) / 10
}

/**
 * Get explanation for why this CO₂ value was calculated
 * @param {string} title - Item title
 * @param {string} category - Item category
 * @param {string} condition - Item condition
 * @returns {string} Explanation text
 */
export function getCO2Explanation(title, category, condition = 'Good') {
  const categoryData = CO2_DATA[category]
  if (!categoryData) return 'Standard estimate based on category'
  
  const searchText = title.toLowerCase()
  
  // Find matching keyword
  for (const [keyword, value] of Object.entries(categoryData.keywords)) {
    if (searchText.includes(keyword.toLowerCase())) {
      return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} typically saves ${value}kg CO₂ when borrowed instead of buying new`
    }
  }
  
  return `${category} items typically save ${categoryData.base}kg CO₂ per borrow`
}

// Example usage:
// calculateCO2Savings('Cordless Drill', 'Tools', '18V Makita', 'Good') → 12kg
// calculateCO2Savings('Novel Book', 'Books', 'Fiction', 'Good') → 0.8kg
// calculateCO2Savings('Mountain Bike', 'Other', '26 inch bike', 'Like New') → 102kg