import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileSelector } from '@/components/profiles/ProfileSelector'
import type { Id } from 'convex/_generated/dataModel'

// Mock the ProfileEditDialog
vi.mock('@/components/profiles/ProfileEditDialog', () => ({
  ProfileEditDialog: ({
    open,
    onOpenChange,
    profile,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile?: { name: string }
  }) =>
    open ? (
      <div data-testid="edit-dialog">
        <span>{profile ? `Editing: ${profile.name}` : 'Creating new profile'}</span>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}))

describe('ProfileSelector', () => {
  const mockOnSelectProfile = vi.fn()

  const mockProfiles = [
    {
      _id: 'profile1' as Id<'profiles'>,
      _creationTime: Date.now(),
      familyId: 'family1' as Id<'families'>,
      name: 'Mom',
      color: '#EF4444',
      createdAt: Date.now(),
    },
    {
      _id: 'profile2' as Id<'profiles'>,
      _creationTime: Date.now(),
      familyId: 'family1' as Id<'families'>,
      name: 'Dad',
      color: '#3B82F6',
      createdAt: Date.now(),
    },
    {
      _id: 'profile3' as Id<'profiles'>,
      _creationTime: Date.now(),
      familyId: 'family1' as Id<'families'>,
      name: 'Kid',
      color: '#22C55E',
      createdAt: Date.now(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('display mode', () => {
    it('renders all profiles', () => {
      render(<ProfileSelector profiles={mockProfiles} onSelectProfile={mockOnSelectProfile} />)

      expect(screen.getByText('Mom')).toBeInTheDocument()
      expect(screen.getByText('Dad')).toBeInTheDocument()
      expect(screen.getByText('Kid')).toBeInTheDocument()
    })

    it('calls onSelectProfile when profile is clicked', async () => {
      render(<ProfileSelector profiles={mockProfiles} onSelectProfile={mockOnSelectProfile} />)

      await userEvent.click(screen.getByText('Mom'))

      expect(mockOnSelectProfile).toHaveBeenCalledWith('profile1')
    })

    it('does not show add profile button without management mode', () => {
      render(<ProfileSelector profiles={mockProfiles} onSelectProfile={mockOnSelectProfile} />)

      expect(screen.queryByText('Add Profile')).not.toBeInTheDocument()
    })

    it('does not show edit buttons without management mode', () => {
      render(<ProfileSelector profiles={mockProfiles} onSelectProfile={mockOnSelectProfile} />)

      expect(screen.queryByLabelText(/edit.*profile/i)).not.toBeInTheDocument()
    })
  })

  describe('management mode', () => {
    it('shows add profile card in management mode', () => {
      render(
        <ProfileSelector
          profiles={mockProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      expect(screen.getByText('Add Profile')).toBeInTheDocument()
    })

    it('shows edit buttons in management mode', () => {
      render(
        <ProfileSelector
          profiles={mockProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      expect(screen.getByLabelText(/edit mom's profile/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/edit dad's profile/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/edit kid's profile/i)).toBeInTheDocument()
    })

    it('opens create dialog when add profile is clicked', async () => {
      render(
        <ProfileSelector
          profiles={mockProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      await userEvent.click(screen.getByText('Add Profile'))

      expect(screen.getByTestId('edit-dialog')).toBeInTheDocument()
      expect(screen.getByText('Creating new profile')).toBeInTheDocument()
    })

    it('opens edit dialog when edit button is clicked', async () => {
      render(
        <ProfileSelector
          profiles={mockProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      await userEvent.click(screen.getByLabelText(/edit mom's profile/i))

      expect(screen.getByTestId('edit-dialog')).toBeInTheDocument()
      expect(screen.getByText('Editing: Mom')).toBeInTheDocument()
    })

    it('closes edit dialog when close is clicked', async () => {
      render(
        <ProfileSelector
          profiles={mockProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      await userEvent.click(screen.getByLabelText(/edit mom's profile/i))
      expect(screen.getByTestId('edit-dialog')).toBeInTheDocument()

      await userEvent.click(screen.getByText('Close'))
      expect(screen.queryByTestId('edit-dialog')).not.toBeInTheDocument()
    })
  })

  describe('failure cases', () => {
    it('handles empty profiles array', () => {
      render(<ProfileSelector profiles={[]} onSelectProfile={mockOnSelectProfile} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('handles empty profiles array in management mode', () => {
      render(<ProfileSelector profiles={[]} onSelectProfile={mockOnSelectProfile} showManagement />)

      // Should still show add profile button
      expect(screen.getByText('Add Profile')).toBeInTheDocument()
    })

    it('still allows selection even if edit is available', async () => {
      render(
        <ProfileSelector
          profiles={mockProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      // Click on the profile name (not the edit button)
      await userEvent.click(screen.getByText('Dad'))

      expect(mockOnSelectProfile).toHaveBeenCalledWith('profile2')
    })

    it('handles profile with special characters in name', () => {
      const specialProfiles = [
        {
          _id: 'profile1' as Id<'profiles'>,
          _creationTime: Date.now(),
          familyId: 'family1' as Id<'families'>,
          name: "O'Brien & Co.",
          color: '#EF4444',
          createdAt: Date.now(),
        },
      ]

      render(
        <ProfileSelector
          profiles={specialProfiles}
          onSelectProfile={mockOnSelectProfile}
          showManagement
        />
      )

      expect(screen.getByText("O'Brien & Co.")).toBeInTheDocument()
    })

    it('handles profile with very long name', () => {
      const longNameProfiles = [
        {
          _id: 'profile1' as Id<'profiles'>,
          _creationTime: Date.now(),
          familyId: 'family1' as Id<'families'>,
          name: 'A'.repeat(50),
          color: '#EF4444',
          createdAt: Date.now(),
        },
      ]

      render(<ProfileSelector profiles={longNameProfiles} onSelectProfile={mockOnSelectProfile} />)

      expect(screen.getByText('A'.repeat(50))).toBeInTheDocument()
    })

    it('handles rapid profile selections', async () => {
      render(<ProfileSelector profiles={mockProfiles} onSelectProfile={mockOnSelectProfile} />)

      await userEvent.click(screen.getByText('Mom'))
      await userEvent.click(screen.getByText('Dad'))
      await userEvent.click(screen.getByText('Kid'))

      expect(mockOnSelectProfile).toHaveBeenCalledTimes(3)
      expect(mockOnSelectProfile).toHaveBeenNthCalledWith(1, 'profile1')
      expect(mockOnSelectProfile).toHaveBeenNthCalledWith(2, 'profile2')
      expect(mockOnSelectProfile).toHaveBeenNthCalledWith(3, 'profile3')
    })
  })
})
