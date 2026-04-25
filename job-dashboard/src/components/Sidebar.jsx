import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Bookmark, 
  LogOut, 
  Briefcase,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../supabaseClient'

const Sidebar = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Jobs' },
    { to: '/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-secondary-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-secondary-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-secondary-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-secondary-800">JobHub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-secondary-100">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-danger-600 font-medium hover:bg-danger-50 transition-all duration-200 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar