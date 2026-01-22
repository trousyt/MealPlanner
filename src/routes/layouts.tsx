import { Outlet } from '@tanstack/react-router'
import { ProfileProvider } from '../contexts/ProfileContext'
import { AuthGuard } from '../components/guards/AuthGuard'
import { ProfileGuard } from '../components/guards/ProfileGuard'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'

export function RootLayout() {
  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  )
}

export function Dashboard() {
  const { signOut } = useAuth()

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold">Welcome to MealPlanner!</h1>
      <p className="text-muted-foreground mt-2">Your meal planning dashboard will be here.</p>
      <Button variant="ghost" onClick={() => signOut()} className="mt-8">
        Sign Out
      </Button>
    </div>
  )
}

export function MainApp() {
  return (
    <AuthGuard>
      <ProfileGuard>
        <Dashboard />
      </ProfileGuard>
    </AuthGuard>
  )
}

export function AuthenticatedLayout() {
  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  )
}

export function ProtectedApp() {
  return (
    <AuthGuard>
      <ProfileGuard>
        <MainApp />
      </ProfileGuard>
    </AuthGuard>
  )
}
