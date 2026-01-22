import { useProfileContext, type Profile } from '../contexts/ProfileContext'
import type { Id } from '../../convex/_generated/dataModel'

export function useProfile() {
  const { currentProfile, profiles, isLoading, selectProfile } = useProfileContext()

  return {
    currentProfile,
    profiles,
    isLoading,
    selectProfile,
    hasProfile: !!currentProfile,
  }
}

export function useCurrentProfile(): Profile | null {
  const { currentProfile, isLoading } = useProfileContext()

  if (isLoading) {
    return null
  }

  return currentProfile ?? null
}

export function useFamilyProfiles(): Profile[] {
  const { profiles } = useProfileContext()
  return profiles ?? []
}

export function useSelectProfile() {
  const { selectProfile } = useProfileContext()
  return selectProfile
}

export type { Profile }
export type { Id }
