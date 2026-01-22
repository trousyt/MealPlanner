import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from '@/routes/layouts'

// Mock the useAuth hook
const mockSignOut = vi.fn()
const mockUseAuth = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      signOut: mockSignOut,
    })
  })

  it('renders welcome message', () => {
    render(<Dashboard />)

    expect(screen.getByText('Welcome to MealPlanner!')).toBeInTheDocument()
    expect(screen.getByText('Your meal planning dashboard will be here.')).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<Dashboard />)

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls signOut when sign out button is clicked', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
