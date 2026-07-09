import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Landing from './landing/Landing'
import { FriendsPage, LeaderboardPage, TournamentsPage } from './pages'
import { AuthProvider } from './context/AuthContext'
import './landing/landing.css' // Tailwind (landing) — loaded first so app CSS wins conflicts
import './index.css' // app styles

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<App />} />
          <Route path="/app/friends" element={<FriendsPage />} />
          <Route path="/app/leaderboard" element={<LeaderboardPage />} />
          <Route path="/app/tournaments" element={<TournamentsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
