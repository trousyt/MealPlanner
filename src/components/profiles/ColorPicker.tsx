import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
] as const

type ColorPickerProps = {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVATAR_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={disabled}
          onClick={() => onChange(color)}
          className={cn(
            'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
            value === color
              ? 'border-foreground ring-foreground ring-2 ring-offset-2'
              : 'border-transparent',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  )
}

export { AVATAR_COLORS }
