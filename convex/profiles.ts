import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { auth } from './auth'
import type { Doc, Id } from './_generated/dataModel'

// Default avatar colors for profile selection
export const AVATAR_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
] as const

/**
 * Get all profiles for the current user's family
 */
export const getProfilesForFamily = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('profiles'),
      _creationTime: v.number(),
      familyId: v.id('families'),
      name: v.string(),
      color: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx): Promise<Doc<'profiles'>[]> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return []
    }

    const user = await ctx.db.get(userId)
    if (!user?.familyId) {
      return []
    }

    return await ctx.db
      .query('profiles')
      .withIndex('by_family', (q) => q.eq('familyId', user.familyId!))
      .collect()
  },
})

/**
 * Get the current user's selected profile
 */
export const getCurrentProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('profiles'),
      _creationTime: v.number(),
      familyId: v.id('families'),
      name: v.string(),
      color: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx): Promise<Doc<'profiles'> | null> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return null
    }

    const user = await ctx.db.get(userId)
    if (!user?.profileId) {
      return null
    }

    return await ctx.db.get(user.profileId)
  },
})

/**
 * Select a profile for the current user
 */
export const selectProfile = mutation({
  args: {
    profileId: v.id('profiles'),
  },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db.get(userId)
    if (!user?.familyId) {
      throw new Error('User has no family')
    }

    // Verify the profile belongs to the user's family
    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.familyId !== user.familyId) {
      throw new Error('Profile not found in your family')
    }

    await ctx.db.patch(userId, { profileId: args.profileId })
    return true
  },
})

/**
 * Create a new profile in the current user's family
 */
export const createProfile = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  returns: v.id('profiles'),
  handler: async (ctx, args): Promise<Id<'profiles'>> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db.get(userId)
    if (!user?.familyId) {
      throw new Error('User has no family')
    }

    const profileId = await ctx.db.insert('profiles', {
      familyId: user.familyId,
      name: args.name,
      color: args.color,
      createdAt: Date.now(),
    })

    return profileId
  },
})

/**
 * Update a profile's name or color
 */
export const updateProfile = mutation({
  args: {
    profileId: v.id('profiles'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db.get(userId)
    if (!user?.familyId) {
      throw new Error('User has no family')
    }

    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.familyId !== user.familyId) {
      throw new Error('Profile not found in your family')
    }

    const updates: Partial<{ name: string; color: string }> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.color !== undefined) updates.color = args.color

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.profileId, updates)
    }

    return true
  },
})

/**
 * Delete a profile (cannot delete the last profile in a family)
 */
export const deleteProfile = mutation({
  args: {
    profileId: v.id('profiles'),
  },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db.get(userId)
    if (!user?.familyId) {
      throw new Error('User has no family')
    }

    const profile = await ctx.db.get(args.profileId)
    if (!profile || profile.familyId !== user.familyId) {
      throw new Error('Profile not found in your family')
    }

    // Check if this is the last profile in the family
    const familyProfiles = await ctx.db
      .query('profiles')
      .withIndex('by_family', (q) => q.eq('familyId', user.familyId!))
      .collect()

    if (familyProfiles.length <= 1) {
      throw new Error('Cannot delete the last profile in a family')
    }

    // If the user's current profile is being deleted, switch to another
    if (user.profileId === args.profileId) {
      const otherProfile = familyProfiles.find((p) => p._id !== args.profileId)
      if (otherProfile) {
        await ctx.db.patch(userId, { profileId: otherProfile._id })
      }
    }

    await ctx.db.delete(args.profileId)
    return true
  },
})
