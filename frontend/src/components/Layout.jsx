import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNavbar from './BottomNavbar';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="main-content">
          {children}
        </main>
      </div>
      <BottomNavbar />
    </div>
  );
}
