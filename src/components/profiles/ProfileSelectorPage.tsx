import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { ProfileSelector } from './ProfileSelector'
import { Button } from '../ui/button'

export function ProfileSelectorPage() {
  const { signOut } = useAuth()
  const { profiles, selectProfile, isLoading } = useProfile()
  const [isManaging, setIsManaging] = useState(false)

  const handleSelectProfile = async (profileId: Parameters<typeof selectProfile>[0]) => {
    await selectProfile(profileId)
  }

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground mt-4">Loading profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="mb-2 text-center text-3xl font-bold">
          {isManaging ? 'Manage Profiles' : "Who's using MealPlanner?"}
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          {isManaging
            ? 'Edit or add profiles for your family members'
            : 'Select your profile to continue'}
        </p>

        <ProfileSelector
          profiles={profiles ?? []}
          onSelectProfile={handleSelectProfile}
          showManagement={isManaging}
        />

        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant={isManaging ? 'default' : 'outline'}
            onClick={() => setIsManaging(!isManaging)}
          >
            {isManaging ? 'Done' : 'Manage Profiles'}
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
