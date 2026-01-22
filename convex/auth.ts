import { convexAuth } from '@convex-dev/auth/server'
import { Password } from '@convex-dev/auth/providers/Password'
import type { DataModel } from './_generated/dataModel'
import { internal } from './_generated/api'

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string | undefined,
    }
  },
})

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      // Only set up for newly created users (not updates)
      if (!existingUserId) {
        await ctx.scheduler.runAfter(0, internal.users.setupNewUser, { userId })
      }
    },
  },
})
