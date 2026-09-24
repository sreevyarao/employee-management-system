import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from 'react-bootstrap';
import { LogOut, Key, UserCheck, Shield } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <nav className="app-navbar">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0 text-slate-800 fw-bold">Enterprise Management System</h5>
        </div>

        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="fw-semibold fs-7 lh-1 text-dark">{user.name}</div>
                  <div className="text-muted fs-8 lh-1 mt-1">{user.email}</div>
                </div>
                <Badge
                  bg={user.role === 'admin' ? 'indigo' : 'secondary'}
                  className={`ms-2 ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}
                >
                  {user.role === 'admin' ? (
                    <><Shield size={12} className="me-1" /> Admin</>
                  ) : (
                    <><UserCheck size={12} className="me-1" /> Employee</>
                  )}
                </Badge>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center gap-1 rounded-pill px-3"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key size={14} />
                <span className="d-none d-sm-inline">Password</span>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="d-flex align-items-center gap-1 rounded-pill px-3"
                onClick={logout}
              >
                <LogOut size={14} />
                <span className="d-none d-sm-inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </nav>

      {showPasswordModal && (
        <ChangePasswordModal
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
};

export default AppNavbar;
