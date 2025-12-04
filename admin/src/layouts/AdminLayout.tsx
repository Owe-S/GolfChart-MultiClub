import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../ski-gk-theme.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/booking', label: 'Ny Booking', icon: '➕' },
  { path: '/bookings', label: 'Bookinger', icon: '📋' },
  { path: '/carts', label: 'Golfbiler', icon: '🚗' },
  { path: '/reports', label: 'Rapporter', icon: '📈' },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Top Header Bar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="admin-logo">
            <span className="logo-text">SKI GOLFKLUBB</span>
            <span className="logo-subtitle">Admin Panel</span>
          </div>
        </div>
        <div className="admin-header-right">
          <button type="button" className="header-icon-btn" aria-label="Notifications">
            🔔
          </button>
          <button type="button" className="header-icon-btn" aria-label="Settings">
            ⚙️
          </button>
          <div className="user-menu">
            <button type="button" className="user-avatar">
              👤
            </button>
          </div>
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            ☰
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar Navigation */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button type="button" onClick={toggleMobileMenu}>✕</button>
            </div>
            <nav className="mobile-menu-nav">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={toggleMobileMenu}
                >
                  <span className="mobile-menu-icon">{item.icon}</span>
                  <span className="mobile-menu-label">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
