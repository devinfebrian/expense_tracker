import { useAuthStore } from '../store/useAuthStore';

export default function Topbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="topbar">
      <h2 className="topbar-title-mobile">Duidku</h2>
      <div className="topbar-actions">
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="topbar-avatar">
          <img src={user?.avatar || '/avatars/avatar1.svg'} alt="Profile" />
        </div>
      </div>
    </header>
  );
}
