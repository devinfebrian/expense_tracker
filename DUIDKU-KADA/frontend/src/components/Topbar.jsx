export default function Topbar() {
  return (
    <header className="topbar">
      <h2 className="topbar-title-mobile">WealthFlow</h2>
      <div className="topbar-search">
        <span className="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search transactions..." className="topbar-search-input" />
      </div>
      <div className="topbar-actions">
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="topbar-avatar">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJFhBfqA9PUwyURg3ntS0_eG7AluQGT5cLnFpi0ZO28YanLpt261uwboIB2uXmVfabZMvBEzZgUqi35Lq6Yb3jUyWqZF7ohTLINg76OEnC8kRQQi1kpvd5PCA62h4JkG2lOIgBeyftOHXaPTR1nthibQRJLpnMU2EWcE4YyeI1dohyMS0APasVi5yGX5D1Htvyg2tDrL7XM-oTU2KXV-rdwXUaucDLlna9lRzsD2-UYPPlpSfjIgmgz1T4AjWowYkMLVQni82bFP8" alt="Profile" />
        </div>
      </div>
    </header>
  )
}
