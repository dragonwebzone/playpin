import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useFriends } from './hooks/useFriends'
import Topbar from './components/Topbar'
import FriendsPanel from './components/FriendsPanel'
import Leaderboard from './components/Leaderboard'
import TournamentsPanel from './components/TournamentsPanel'

// Full-page wrapper: shared topbar + a scrollable body that hosts a section
// panel. Each panel's own close (✕) returns to the map via onClose.
function Page({ incomingCount, children }) {
  return (
    <div className="app">
      <Topbar incomingCount={incomingCount} />
      <main className="page-body">{children}</main>
    </div>
  )
}

export function FriendsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const friendsApi = useFriends(user?.id)
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return (
    <Page incomingCount={friendsApi.incoming.length}>
      <FriendsPanel friendsApi={friendsApi} onClose={() => navigate('/app')} />
    </Page>
  )
}

export function LeaderboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return (
    <Page>
      <Leaderboard onClose={() => navigate('/app')} />
    </Page>
  )
}

export function TournamentsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return (
    <Page>
      <TournamentsPanel onClose={() => navigate('/app')} />
    </Page>
  )
}
