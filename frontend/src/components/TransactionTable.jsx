import { useState, useEffect } from 'react';

export default function TransactionTable({ 
  transactions, 
  showActions = true, 
  onEdit, 
  onDelete, 
  limit 
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.action-dropdown')) setOpenDropdownId(null);
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const getCategoryIcon = (cat) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('food') || c.includes('drinks') || c.includes('meals')) return 'restaurant';
    if (c.includes('transport') || c.includes('taxi') || c.includes('bus') || c.includes('car')) return 'directions_car';
    if (c.includes('education') || c.includes('books') || c.includes('school')) return 'school';
    if (c.includes('living') || c.includes('rent') || c.includes('dorm') || c.includes('housing')) return 'home';
    if (c.includes('personal') || c.includes('entertainment') || c.includes('shopping') || c.includes('movie') || c.includes('games')) return 'celebration';
    return 'account_balance_wallet';
  };

  const getCategoryClass = (cat) => {
    return 'surface-container-highest text-primary';
  };

  const displayList = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>MERCHANT</th>
            <th>CATEGORY</th>
            <th>DATE</th>
            <th className={showActions ? 'text-center' : 'text-right'}>AMOUNT</th>
            {showActions && <th className="text-center">ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {displayList.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 5 : 4} style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px 0' }}>
                No expenses logged yet.
              </td>
            </tr>
          ) : (
            displayList.map(txn => (
              <tr key={txn.transaction_id || txn.id}>
                <td>
                  <div className="merchant-cell">
                    <div className="merchant-icon">
                      <span className="material-symbols-outlined">{txn.icon || getCategoryIcon(txn.category)}</span>
                    </div>
                    <div>
                      <span>{txn.merchant}</span>
                      {txn.notes && <p className="merchant-notes">{txn.notes}</p>}
                    </div>
                  </div>
                </td>
                <td data-label="Category">
                  <span className={`category-chip ${txn.categoryClass || getCategoryClass(txn.category)}`}>
                    {txn.category}
                  </span>
                </td>
                <td data-label="Date" className="text-on-surface-variant">{txn.date}</td>
                <td data-label="Amount" className={showActions ? 'text-center text-tertiary' : 'text-right text-tertiary'}>
                  -Rp{txn.amount.toLocaleString('id-ID')}
                </td>
                {showActions && (
                  <td data-label="Action" className="text-center">
                    <div className="action-dropdown">
                      <button 
                        className="icon-btn" 
                        onClick={() => setOpenDropdownId(openDropdownId === txn.transaction_id ? null : txn.transaction_id)}
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                      {openDropdownId === txn.transaction_id && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => { onEdit(txn); setOpenDropdownId(null); }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                            Edit
                          </button>
                          <button className="dropdown-item danger" onClick={() => { onDelete(txn.transaction_id); setOpenDropdownId(null); }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
