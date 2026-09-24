import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import AppSidebar from './AppSidebar';

const Layout = () => {
  return (
    <div className="app-layout">
      <AppSidebar />
      <div className="app-main-content">
        <AppNavbar />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
