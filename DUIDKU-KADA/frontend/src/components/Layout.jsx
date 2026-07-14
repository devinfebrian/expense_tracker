import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-area">
        <Topbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
