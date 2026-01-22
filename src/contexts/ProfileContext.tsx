import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export type Profile = {
  _id: Id<'profiles'>
  _creationTime: number
  familyId: Id<'families'>
  name: string
  color: string
  createdAt: number
}

type ProfileContextType = {
  currentProfile: Profile | null | undefined
  profiles: Profile[] | undefined
  isLoading: boolean
  selectProfile: (profileId: Id<'profiles'>) => Promise<void>
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const currentProfile = useQuery(api.profiles.getCurrentProfile)
  const profiles = useQuery(api.profiles.getProfilesForFamily)
  const selectProfileMutation = useMutation(api.profiles.selectProfile)

  const isLoading = currentProfile === undefined || profiles === undefined

  const selectProfile = useCallback(
    async (profileId: Id<'profiles'>) => {
      await selectProfileMutation({ profileId })
    },
    [selectProfileMutation]
  )

  const clearProfile = useCallback(() => {
    // This is a no-op on the client side - the profile is cleared server-side
    // when needed (e.g., during logout or profile switch flow)
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        isLoading,
        selectProfile,
        clearProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfileContext() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider')
  }
  return context
}
