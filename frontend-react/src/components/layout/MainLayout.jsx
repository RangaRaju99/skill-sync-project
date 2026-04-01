import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './MainLayout.scss';

/**
 * MainLayout Component
 * Replaces Angular's main layout component
 * Contains navigation and outlet for page content
 */
function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-content">
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="app-title">SkillSync</h1>
          <div className="header-actions">
            <span className="user-name">{user?.name || 'User'}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        {/* Sidebar Navigation */}
        {isSidebarOpen && (
          <nav className="layout-sidebar">
            <div className="nav-section">
              <h3>Main</h3>
              <NavLink to="/dashboard" label="Dashboard" icon="📊" />
              <NavLink to="/skills" label="Skills" icon="🎯" />
              <NavLink to="/mentors" label="Find Mentors" icon="👨‍🏫" />
              <NavLink to="/profile" label="My Profile" icon="👤" />
            </div>
            <div className="nav-section">
              <h3>Settings</h3>
              <NavLink to="/settings" label="Preferences" icon="⚙️" />
              <NavLink to="/help" label="Help & Support" icon="❓" />
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="layout-footer">
        <p>&copy; 2024 SkillSync. All rights reserved.</p>
      </footer>
    </div>
  );
}

/**
 * NavLink Component
 * Reusable navigation link
 */
function NavLink({ to, label, icon }) {
  const navigate = useNavigate();

  return (
    <button className="nav-link" onClick={() => navigate(to)}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );
}

export default MainLayout;
