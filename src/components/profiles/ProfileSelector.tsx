import { useState } from 'react'
import { ProfileCard, AddProfileCard } from './ProfileCard'
import { ProfileEditDialog } from './ProfileEditDialog'
import type { Profile } from '../../hooks/useProfile'

type ProfileSelectorProps = {
  profiles: Profile[]
  onSelectProfile: (profileId: Profile['_id']) => void
  showManagement?: boolean
}

export function ProfileSelector({
  profiles,
  onSelectProfile,
  showManagement,
}: ProfileSelectorProps) {
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(undefined)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile._id}
            profile={profile}
            onClick={() => onSelectProfile(profile._id)}
            onEdit={showManagement ? () => setEditingProfile(profile) : undefined}
            showEditButton={showManagement}
          />
        ))}
        {showManagement && <AddProfileCard onClick={() => setIsCreateDialogOpen(true)} />}
      </div>

      {/* Edit Dialog */}
      <ProfileEditDialog
        profile={editingProfile}
        open={!!editingProfile}
        onOpenChange={(open) => {
          if (!open) setEditingProfile(undefined)
        }}
      />

      {/* Create Dialog */}
      <ProfileEditDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </>
  )
}
