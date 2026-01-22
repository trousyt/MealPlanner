import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '@/components/profiles/ProfileForm'
import type { Id } from 'convex/_generated/dataModel'

describe('ProfileForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnDelete = vi.fn()

  const mockProfile = {
    _id: 'profile123' as Id<'profiles'>,
    _creationTime: Date.now(),
    familyId: 'family123' as Id<'families'>,
    name: 'Test User',
    color: '#EF4444',
    createdAt: Date.now(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create mode', () => {
    it('renders empty form for new profile', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/name/i)).toHaveValue('')
      expect(screen.getByRole('button', { name: /create profile/i })).toBeInTheDocument()
    })

    it('shows question mark for empty name in avatar preview', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('updates avatar preview as name is typed', async () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'John Doe')

      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('submits new profile data', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined)
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'New Profile')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'New Profile',
          color: expect.any(String),
        })
      })
    })
  })

  describe('edit mode', () => {
    it('renders form with existing profile data', () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByLabelText(/name/i)).toHaveValue('Test User')
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('shows delete button when editing', () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByRole('button', { name: /delete profile/i })).toBeInTheDocument()
    })

    it('does not show delete button without onDelete prop', () => {
      render(<ProfileForm profile={mockProfile} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      expect(screen.queryByRole('button', { name: /delete profile/i })).not.toBeInTheDocument()
    })
  })

  describe('failure cases', () => {
    it('requires name field (HTML5 validation)', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toBeRequired()
    })

    it('shows error for whitespace-only name', async () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // Type spaces then clear the required validation by adding a space
      const nameInput = screen.getByLabelText(/name/i)
      await userEvent.type(nameInput, '   ')

      // Manually trigger form submission by removing required temporarily
      // Since the input has whitespace, our validation should catch it
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('trims whitespace from name before submission', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined)
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), '  Trimmed Name  ')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Trimmed Name',
          color: expect.any(String),
        })
      })
    })

    it('displays server error on submit failure', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Server error'))
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test Profile')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })
    })

    it('displays generic error for non-Error exceptions', async () => {
      mockOnSubmit.mockRejectedValueOnce('Unknown error')
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test Profile')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to save profile/i)).toBeInTheDocument()
      })
    })

    it('re-enables inputs after failed submission', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Server error'))
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test Profile')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/name/i)).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /create profile/i })).not.toBeDisabled()
    })

    it('disables inputs while loading', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(() => {})) // Never resolves
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test Profile')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeDisabled()
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })
    })

    it('disables inputs when isDeleting is true', () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
          isDeleting={true}
        />
      )

      expect(screen.getByLabelText(/name/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
    })

    it('calls onCancel when cancel button is clicked', async () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('calls onDelete when delete button is clicked', async () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: /delete profile/i }))

      expect(mockOnDelete).toHaveBeenCalled()
    })

    it('clears error when retrying after server failure', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Server error'))
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      // First attempt - server error
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Name')
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })

      // Retry - should clear error on new submission
      mockOnSubmit.mockResolvedValueOnce(undefined)
      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(screen.queryByText(/server error/i)).not.toBeInTheDocument()
      })
    })

    it('enforces max length on name input', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('maxLength', '50')
    })
  })

  describe('color picker', () => {
    it('allows changing avatar color', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined)
      render(<ProfileForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

      await userEvent.type(screen.getByLabelText(/name/i), 'Test')

      // Click on a different color
      const colorButtons = screen.getAllByLabelText(/select color/i)
      await userEvent.click(colorButtons[2])

      await userEvent.click(screen.getByRole('button', { name: /create profile/i }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test',
          color: expect.any(String),
        })
      })
    })
  })
})
