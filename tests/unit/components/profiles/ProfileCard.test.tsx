import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileCard, AddProfileCard } from '@/components/profiles/ProfileCard'
import { getInitials } from '@/lib/initials'
import { Id } from 'convex/_generated/dataModel'

describe('getInitials', () => {
  it('returns first two characters for single word', () => {
    expect(getInitials('John')).toBe('JO')
  })

  it('returns first letter of first and last word for multiple words', () => {
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('John Middle Doe')).toBe('JD')
  })

  it('handles whitespace', () => {
    expect(getInitials('  John  ')).toBe('JO')
    expect(getInitials('John   Doe')).toBe('JD')
  })
})

describe('ProfileCard', () => {
  const mockProfile = {
    _id: 'profile123' as Id<'profiles'>,
    _creationTime: Date.now(),
    familyId: 'family123' as Id<'families'>,
    name: 'Test User',
    color: '#EF4444',
    createdAt: Date.now(),
  }

  it('renders profile name', () => {
    render(<ProfileCard profile={mockProfile} />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('renders initials in avatar', () => {
    render(<ProfileCard profile={mockProfile} />)

    expect(screen.getByText('TU')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const mockClick = vi.fn()
    render(<ProfileCard profile={mockProfile} onClick={mockClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(mockClick).toHaveBeenCalled()
  })

  it('shows edit button when showEditButton is true', () => {
    const mockEdit = vi.fn()
    render(<ProfileCard profile={mockProfile} showEditButton onEdit={mockEdit} />)

    expect(screen.getByLabelText(/edit test user's profile/i)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const mockClick = vi.fn()
    const mockEdit = vi.fn()
    render(
      <ProfileCard profile={mockProfile} onClick={mockClick} showEditButton onEdit={mockEdit} />
    )

    await userEvent.click(screen.getByLabelText(/edit test user's profile/i))

    expect(mockEdit).toHaveBeenCalled()
    expect(mockClick).not.toHaveBeenCalled() // Should not bubble up
  })

  it('applies selected styling when isSelected is true', () => {
    render(<ProfileCard profile={mockProfile} isSelected />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('ring-2')
  })
})

describe('AddProfileCard', () => {
  it('renders Add Profile text', () => {
    render(<AddProfileCard onClick={vi.fn()} />)

    expect(screen.getByText('Add Profile')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const mockClick = vi.fn()
    render(<AddProfileCard onClick={mockClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(mockClick).toHaveBeenCalled()
  })
})
