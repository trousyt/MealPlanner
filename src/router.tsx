import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { AuthPage } from './components/auth/AuthPage'
import { ProfileSelectorPage } from './components/profiles/ProfileSelectorPage'
import { AuthGuard } from './components/guards/AuthGuard'
import { RootLayout, MainApp } from './routes/layouts'

// Define the root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Auth route - public
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
})

// Profiles route - requires authentication
const profilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profiles',
  component: function ProfilesPage() {
    return (
      <AuthGuard>
        <ProfileSelectorPage />
      </AuthGuard>
    )
  },
})

// Index route - requires auth + profile
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainApp,
})

// Create the route tree
const routeTree = rootRoute.addChildren([authRoute, profilesRoute, indexRoute])

// Create and export the router
export const router = createRouter({ routeTree })

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
