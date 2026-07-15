import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 26, 46, 0.4)',
            zIndex: 40,
          }}
        />
      )}
      <div
        className="mobile-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: mobileMenuOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          zIndex: 50,
          transition: 'left 0.3s',
        }}
      >
        <div className="mobile-sidebar-inner">
          <Sidebar />
        </div>
      </div>
      <div className="main-area">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
