import { Avatar, AvatarFallback } from '../ui/avatar'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/initials'
import type { Profile } from '../../hooks/useProfile'

type ProfileCardProps = {
  profile: Profile
  isSelected?: boolean
  onClick?: () => void
  onEdit?: () => void
  showEditButton?: boolean
}

export function ProfileCard({
  profile,
  isSelected,
  onClick,
  onEdit,
  showEditButton,
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        'group hover:bg-accent relative flex cursor-pointer flex-col items-center gap-3 rounded-lg p-4 transition-all',
        isSelected && 'ring-primary ring-2 ring-offset-2',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <Avatar className="group-hover:border-foreground/20 h-24 w-24 border-4 border-transparent transition-all">
        <AvatarFallback
          className="text-2xl font-medium text-white"
          style={{ backgroundColor: profile.color }}
        >
          {getInitials(profile.name)}
        </AvatarFallback>
      </Avatar>

      <span className="text-center text-lg font-medium">{profile.name}</span>

      {showEditButton && onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="hover:bg-background absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Edit ${profile.name}'s profile`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      )}
    </div>
  )
}

type AddProfileCardProps = {
  onClick: () => void
}

export function AddProfileCard({ onClick }: AddProfileCardProps) {
  return (
    <div
      className="hover:bg-accent flex cursor-pointer flex-col items-center gap-3 rounded-lg p-4 transition-all"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="border-muted-foreground hover:border-foreground flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </div>
      <span className="text-muted-foreground text-center text-lg font-medium">Add Profile</span>
    </div>
  )
}
