import type { ReactNode } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { ProfileSelectorPage } from '../profiles/ProfileSelectorPage'

type ProfileGuardProps = {
  children: ReactNode
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const { currentProfile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return <ProfileSelectorPage />
  }

  return <>{children}</>
}
