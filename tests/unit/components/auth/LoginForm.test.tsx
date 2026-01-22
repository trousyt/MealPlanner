import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'

// Mock posthog-js
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
  },
}))

// Mock the useAuth hook
const mockSignIn = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signOut: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
  }),
}))

describe('LoginForm', () => {
  const mockSwitchToSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password inputs', () => {
    render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onSwitchToSignUp when sign up link is clicked', async () => {
    render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

    const signUpLink = screen.getByRole('button', { name: /sign up/i })
    await userEvent.click(signUpLink)

    expect(mockSwitchToSignUp).toHaveBeenCalled()
  })

  it('submits form with email and password', async () => {
    mockSignIn.mockResolvedValueOnce(undefined)
    render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('password', expect.any(FormData))
    })
  })

  it('displays sanitized error message on failed sign in', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'))
    render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('disables inputs while loading', async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })
  })

  describe('failure cases', () => {
    it('displays generic sanitized error for non-Error exceptions', async () => {
      mockSignIn.mockRejectedValueOnce('Some string error')
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Unable to sign in. Please try again.')).toBeInTheDocument()
      })
    })

    it('displays sanitized network error message', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('network error'))
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Unable to connect. Please check your internet connection.')
        ).toBeInTheDocument()
      })
    })

    it('sanitizes user not found to prevent enumeration', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('User not found'))
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      await userEvent.type(screen.getByLabelText(/email/i), 'nonexistent@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        // Should show same message as wrong password to prevent user enumeration
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })
    })

    it('clears error when retrying after failure', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'))
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      })

      // Now retry - error should clear when form is submitted again
      mockSignIn.mockResolvedValueOnce(undefined)
      await userEvent.clear(screen.getByLabelText(/password/i))
      await userEvent.type(screen.getByLabelText(/password/i), 'correctpassword')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument()
      })
    })

    it('re-enables inputs after failed submission', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Server error'))
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        // Server error is unknown, so gets generic message
        expect(screen.getByText('Unable to sign in. Please try again.')).toBeInTheDocument()
      })

      // Inputs should be re-enabled after error
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/password/i)).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled()
    })

    it('requires email field', async () => {
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toBeRequired()
    })

    it('requires password field', async () => {
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeRequired()
    })

    it('validates email format', async () => {
      render(<LoginForm onSwitchToSignUp={mockSwitchToSignUp} />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })
})
