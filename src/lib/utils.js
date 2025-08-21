export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatCO2(kg) {
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`
  return `${kg.toFixed(1)}kg`
}

export function getCategoryIcon(category) {
  const icons = {
    'Tools': '🔧',
    'Appliances': '🏠', 
    'Camping Gear': '⛺',
    'Books': '📚',
    'Other': '📦'
  }
  return icons[category] || '📦'
}

export function getStatusColor(status) {
  const colors = {
    'available': 'bg-green-100 text-green-800',
    'borrowed': 'bg-yellow-100 text-yellow-800',
    'unavailable': 'bg-gray-100 text-gray-800',
    'pending': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'returned': 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function generateGradient(index) {
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500', 
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500'
  ]
  return gradients[index % gradients.length]
}