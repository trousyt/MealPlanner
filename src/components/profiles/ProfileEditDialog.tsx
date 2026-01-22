import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { ProfileForm } from './ProfileForm'
import type { Profile } from '../../hooks/useProfile'

type ProfileEditDialogProps = {
  profile?: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ProfileEditDialog({
  profile,
  open,
  onOpenChange,
  onSuccess,
}: ProfileEditDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const createProfile = useMutation(api.profiles.createProfile)
  const updateProfile = useMutation(api.profiles.updateProfile)
  const deleteProfile = useMutation(api.profiles.deleteProfile)

  const handleSubmit = async (data: { name: string; color: string }) => {
    if (profile) {
      await updateProfile({
        profileId: profile._id,
        name: data.name,
        color: data.color,
      })
    } else {
      await createProfile(data)
    }

    onOpenChange(false)
    onSuccess?.()
  }

  const handleDelete = async () => {
    if (!profile) return

    setIsDeleting(true)
    try {
      await deleteProfile({ profileId: profile._id })
      setShowDeleteConfirm(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error will be shown in the form
      console.error('Failed to delete profile:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{profile ? 'Edit Profile' : 'Create Profile'}</DialogTitle>
            <DialogDescription>
              {profile
                ? 'Update the profile name and avatar color.'
                : 'Create a new profile for a family member.'}
            </DialogDescription>
          </DialogHeader>

          <ProfileForm
            profile={profile}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            onDelete={profile ? () => setShowDeleteConfirm(true) : undefined}
            isDeleting={isDeleting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{profile?.name}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
