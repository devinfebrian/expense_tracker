import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import HistoryExpense from './pages/History-expense'
import Budgets from './pages/Budgets'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('duidku_user')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = (userData) => {
    localStorage.setItem('duidku_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('duidku_user')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/" element={
          user ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/history-expense" element={
          user ? <HistoryExpense onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/budgets" element={
          user ? <Budgets onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  )
}
