import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, User, ClipboardList } from 'lucide-react';

const AppSidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">EMS</div>
        <div>
          <div className="sidebar-brand-text">WorkSpace</div>
          <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Management Portal</small>
        </div>
      </div>

      <div className="sidebar-nav">
        {isAdmin ? (
          <>
            <div className="nav-label">Admin Management</div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/employees"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Employees</span>
            </NavLink>

            <NavLink
              to="/admin/assignments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>Assignments</span>
            </NavLink>

            <NavLink
              to="/admin/projects"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Briefcase size={18} />
              <span>Projects</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-label">Employee Portal</div>
            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <User size={18} />
              <span>My Dashboard</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-truncate">
            <div className="text-white fw-semibold text-truncate" style={{ fontSize: '0.8rem' }}>{user?.name}</div>
            <div className="text-capitalize" style={{ color: '#64748b', fontSize: '0.7rem' }}>
              {user?.role} • {user?.department || 'General'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
