import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker, AVATAR_COLORS } from '@/components/profiles/ColorPicker'

describe('ColorPicker', () => {
  it('renders all available colors', () => {
    render(<ColorPicker value={AVATAR_COLORS[0]} onChange={vi.fn()} />)

    AVATAR_COLORS.forEach((color) => {
      expect(screen.getByLabelText(`Select color ${color}`)).toBeInTheDocument()
    })
  })

  it('calls onChange when a color is clicked', async () => {
    const mockOnChange = vi.fn()
    render(<ColorPicker value={AVATAR_COLORS[0]} onChange={mockOnChange} />)

    await userEvent.click(screen.getByLabelText(`Select color ${AVATAR_COLORS[2]}`))

    expect(mockOnChange).toHaveBeenCalledWith(AVATAR_COLORS[2])
  })

  it('highlights the selected color', () => {
    const selectedColor = AVATAR_COLORS[3]
    render(<ColorPicker value={selectedColor} onChange={vi.fn()} />)

    const selectedButton = screen.getByLabelText(`Select color ${selectedColor}`)
    expect(selectedButton).toHaveClass('border-foreground')
  })

  it('disables all buttons when disabled is true', () => {
    render(<ColorPicker value={AVATAR_COLORS[0]} onChange={vi.fn()} disabled />)

    AVATAR_COLORS.forEach((color) => {
      expect(screen.getByLabelText(`Select color ${color}`)).toBeDisabled()
    })
  })
})
