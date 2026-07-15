export default function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-logo">
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
        <h2 className="topbar-title-mobile">Duidku</h2>
      </div>
    </header>
  );
}
