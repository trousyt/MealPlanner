import { v } from 'convex/values'
import { query, internalMutation } from './_generated/server'
import { auth } from './auth'
import type { Doc } from './_generated/dataModel'
import { AVATAR_COLORS } from './profiles'

/**
 * Get the current authenticated user with family and profile data
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      image: v.optional(v.string()),
      isAnonymous: v.optional(v.boolean()),
      name: v.optional(v.string()),
      familyId: v.optional(v.id('families')),
      profileId: v.optional(v.id('profiles')),
    }),
    v.null()
  ),
  handler: async (ctx): Promise<Doc<'users'> | null> => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return null
    }

    return await ctx.db.get(userId)
  },
})

/**
 * Internal mutation to set up a new user with a family and default profile
 * Called after user creation in the auth flow
 */
export const setupNewUser = internalMutation({
  args: {
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      return null
    }

    // Skip if user already has a family
    if (user.familyId) {
      return null
    }

    // Create a family for the new user
    const familyName = user.email ? `${user.email.split('@')[0]}'s Family` : 'My Family'

    const familyId = await ctx.db.insert('families', {
      name: familyName,
      createdAt: Date.now(),
    })

    // Create a default profile
    const profileName = user.name || user.email?.split('@')[0] || 'Me'
    const profileId = await ctx.db.insert('profiles', {
      familyId,
      name: profileName,
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      createdAt: Date.now(),
    })

    // Update the user with family and profile
    await ctx.db.patch(args.userId, {
      familyId,
      profileId,
    })

    return null
  },
})

/**
 * Clear the user's profile selection (for switching profiles)
 */
export const clearProfileSelection = internalMutation({
  args: {
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await ctx.db.patch(args.userId, { profileId: undefined })
    return null
  },
})
