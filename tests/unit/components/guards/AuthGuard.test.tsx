import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from '@/components/guards/AuthGuard'

// Mock the useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock the AuthPage component
vi.mock('@/components/auth/AuthPage', () => ({
  AuthPage: () => <div data-testid="auth-page">Auth Page</div>,
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows loading spinner when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      })

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('auth-page')).not.toBeInTheDocument()
    })

    it('shows loading spinner even if authenticated during load', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
      })

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('unauthenticated state', () => {
    it('shows auth page when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByTestId('auth-page')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('authenticated state', () => {
    it('shows children when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByTestId('auth-page')).not.toBeInTheDocument()
    })

    it('renders multiple children when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <AuthGuard>
          <div>First Child</div>
          <div>Second Child</div>
        </AuthGuard>
      )

      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
    })

    it('renders complex children when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      })

      render(
        <AuthGuard>
          <div>
            <h1>Header</h1>
            <nav>Navigation</nav>
            <main>Main Content</main>
          </div>
        </AuthGuard>
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
    })
  })

  describe('state transitions', () => {
    it('transitions from loading to authenticated', () => {
      // Start loading
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      })

      const { rerender } = render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Finish loading, authenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      })

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('transitions from loading to unauthenticated', () => {
      // Start loading
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      })

      const { rerender } = render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Finish loading, not authenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      })

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByTestId('auth-page')).toBeInTheDocument()
    })

    it('transitions from authenticated to unauthenticated (logout)', () => {
      // Start authenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      })

      const { rerender } = render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()

      // User logs out
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      })

      rerender(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByTestId('auth-page')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })
})
