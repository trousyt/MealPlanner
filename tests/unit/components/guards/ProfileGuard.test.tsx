import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileGuard } from '@/components/guards/ProfileGuard'
import type { Id } from 'convex/_generated/dataModel'

// Mock the useProfile hook
const mockUseProfile = vi.fn()
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}))

// Mock the ProfileSelectorPage component
vi.mock('@/components/profiles/ProfileSelectorPage', () => ({
  ProfileSelectorPage: () => <div data-testid="profile-selector-page">Profile Selector Page</div>,
}))

describe('ProfileGuard', () => {
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

  describe('loading state', () => {
    it('shows loading spinner when profile is loading', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: undefined,
        isLoading: true,
      })

      render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText(/loading profile/i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('profile-selector-page')).not.toBeInTheDocument()
    })

    it('shows loading even if profile exists during load', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: true,
      })

      render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText(/loading profile/i)).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('no profile selected state', () => {
    it('shows profile selector when no profile is selected', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: null,
        isLoading: false,
      })

      render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByTestId('profile-selector-page')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('shows profile selector when currentProfile is undefined', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: undefined,
        isLoading: false,
      })

      render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByTestId('profile-selector-page')).toBeInTheDocument()
    })
  })

  describe('profile selected state', () => {
    it('shows children when profile is selected', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: false,
      })

      render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByTestId('profile-selector-page')).not.toBeInTheDocument()
    })

    it('renders multiple children when profile is selected', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: false,
      })

      render(
        <ProfileGuard>
          <div>First Child</div>
          <div>Second Child</div>
        </ProfileGuard>
      )

      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
    })

    it('renders complex nested children when profile is selected', () => {
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: false,
      })

      render(
        <ProfileGuard>
          <div>
            <header>App Header</header>
            <main>
              <section>Section 1</section>
              <section>Section 2</section>
            </main>
            <footer>App Footer</footer>
          </div>
        </ProfileGuard>
      )

      expect(screen.getByText('App Header')).toBeInTheDocument()
      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Section 2')).toBeInTheDocument()
      expect(screen.getByText('App Footer')).toBeInTheDocument()
    })
  })

  describe('state transitions', () => {
    it('transitions from loading to profile selected', () => {
      // Start loading
      mockUseProfile.mockReturnValue({
        currentProfile: undefined,
        isLoading: true,
      })

      const { rerender } = render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText(/loading profile/i)).toBeInTheDocument()

      // Finish loading with profile
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: false,
      })

      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('transitions from loading to no profile', () => {
      // Start loading
      mockUseProfile.mockReturnValue({
        currentProfile: undefined,
        isLoading: true,
      })

      const { rerender } = render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText(/loading profile/i)).toBeInTheDocument()

      // Finish loading without profile
      mockUseProfile.mockReturnValue({
        currentProfile: null,
        isLoading: false,
      })

      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByTestId('profile-selector-page')).toBeInTheDocument()
    })

    it('transitions from profile selected to no profile (profile switch)', () => {
      // Start with profile
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: false,
      })

      const { rerender } = render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()

      // User switches profile (clears selection)
      mockUseProfile.mockReturnValue({
        currentProfile: null,
        isLoading: false,
      })

      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByTestId('profile-selector-page')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('transitions from one profile to another', () => {
      const anotherProfile = {
        ...mockProfile,
        _id: 'profile456' as Id<'profiles'>,
        name: 'Another User',
      }

      // Start with first profile
      mockUseProfile.mockReturnValue({
        currentProfile: mockProfile,
        isLoading: false,
      })

      const { rerender } = render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()

      // Switch to another profile
      mockUseProfile.mockReturnValue({
        currentProfile: anotherProfile,
        isLoading: false,
      })

      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      // Content should still be visible
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles rapid profile changes', () => {
      const { rerender } = render(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      // Rapid state changes
      mockUseProfile.mockReturnValue({ currentProfile: null, isLoading: false })
      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      mockUseProfile.mockReturnValue({ currentProfile: mockProfile, isLoading: false })
      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      mockUseProfile.mockReturnValue({ currentProfile: null, isLoading: false })
      rerender(
        <ProfileGuard>
          <div>Protected Content</div>
        </ProfileGuard>
      )

      expect(screen.getByTestId('profile-selector-page')).toBeInTheDocument()
    })
  })
})
