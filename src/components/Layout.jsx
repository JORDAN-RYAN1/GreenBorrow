import Navigation from './Navigation'
import Header from './Header'

export default function Layout({ children, currentPage, setCurrentPage }) {
  return (
    <div>
      {/* Sidebar */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  )
}