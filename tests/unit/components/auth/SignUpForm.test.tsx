import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '@/components/auth/SignUpForm'

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

describe('SignUpForm', () => {
  const mockSwitchToLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all input fields', () => {
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders create account button', () => {
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('calls onSwitchToLogin when sign in link is clicked', async () => {
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    const signInLink = screen.getByRole('button', { name: /sign in/i })
    await userEvent.click(signInLink)

    expect(mockSwitchToLogin).toHaveBeenCalled()
  })

  it('shows error when passwords do not match', async () => {
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'short')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'short')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    mockSignIn.mockResolvedValueOnce(undefined)
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('password', expect.any(FormData))
    })
  })

  it('displays sanitized error message on failed sign up', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Email already exists'))
    render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('An account with this email already exists')).toBeInTheDocument()
    })
  })

  describe('failure cases', () => {
    it('shows error for password exactly 7 characters', async () => {
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), '1234567') // 7 chars
      await userEvent.type(screen.getByLabelText(/confirm password/i), '1234567')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })

      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('accepts password exactly 8 characters', async () => {
      mockSignIn.mockResolvedValueOnce(undefined)
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), '12345678') // 8 chars
      await userEvent.type(screen.getByLabelText(/confirm password/i), '12345678')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    it('displays generic sanitized error for non-Error exceptions', async () => {
      mockSignIn.mockRejectedValueOnce({ code: 'UNKNOWN' })
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('Unable to create account. Please try again.')).toBeInTheDocument()
      })
    })

    it('displays sanitized network error message', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Network error'))
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Unable to connect. Please check your internet connection.')
        ).toBeInTheDocument()
      })
    })

    it('sanitizes unknown server errors', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Invalid email format'))
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        // Unknown error gets generic message
        expect(screen.getByText('Unable to create account. Please try again.')).toBeInTheDocument()
      })
    })

    it('clears error when fixing password mismatch', async () => {
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'different123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })

      // Fix the password mismatch and retry
      mockSignIn.mockResolvedValueOnce(undefined)
      await userEvent.clear(screen.getByLabelText(/confirm password/i))
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument()
      })
    })

    it('re-enables inputs after failed submission', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Server error'))
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        // Server error is unknown, so gets generic message
        expect(screen.getByText('Unable to create account. Please try again.')).toBeInTheDocument()
      })

      // Inputs should be re-enabled after error
      expect(screen.getByLabelText(/name/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/email/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/^password$/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/confirm password/i)).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
    })

    it('disables inputs while loading', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test User')
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeDisabled()
        expect(screen.getByLabelText(/email/i)).toBeDisabled()
        expect(screen.getByLabelText(/^password$/i)).toBeDisabled()
        expect(screen.getByLabelText(/confirm password/i)).toBeDisabled()
        expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
      })
    })

    it('requires all fields', () => {
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      expect(screen.getByLabelText(/name/i)).toBeRequired()
      expect(screen.getByLabelText(/email/i)).toBeRequired()
      expect(screen.getByLabelText(/^password$/i)).toBeRequired()
      expect(screen.getByLabelText(/confirm password/i)).toBeRequired()
    })

    it('validates email format with type attribute', () => {
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')
    })

    it('has password type on password fields', () => {
      render(<SignUpForm onSwitchToLogin={mockSwitchToLogin} />)

      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password')
    })
  })
})
