import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
