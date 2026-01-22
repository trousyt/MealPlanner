import { useState, type FormEvent } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ColorPicker, AVATAR_COLORS } from './ColorPicker'
import { getInitials } from '@/lib/initials'
import type { Profile } from '../../hooks/useProfile'

type ProfileFormProps = {
  profile?: Profile
  onSubmit: (data: { name: string; color: string }) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function ProfileForm({
  profile,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting,
}: ProfileFormProps) {
  const [name, setName] = useState(profile?.name ?? '')
  const [color, setColor] = useState(profile?.color ?? AVATAR_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }

    setIsLoading(true)

    try {
      await onSubmit({ name: trimmedName, color })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <Avatar className="h-24 w-24">
          <AvatarFallback
            className="text-2xl font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {name ? getInitials(name) : '?'}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileName">Name</Label>
        <Input
          id="profileName"
          type="text"
          placeholder="Profile name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading || isDeleting}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label>Avatar Color</Label>
        <ColorPicker value={color} onChange={setColor} disabled={isLoading || isDeleting} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isDeleting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isDeleting} className="flex-1">
          {isLoading ? 'Saving...' : profile ? 'Save Changes' : 'Create Profile'}
        </Button>
      </div>

      {profile && onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isLoading || isDeleting}
          className="w-full"
        >
          {isDeleting ? 'Deleting...' : 'Delete Profile'}
        </Button>
      )}
    </form>
  )
}
