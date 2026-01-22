import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,

  families: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),

  profiles: defineTable({
    familyId: v.id('families'),
    name: v.string(),
    color: v.string(), // Hex color for avatar background
    createdAt: v.number(),
  }).index('by_family', ['familyId']),

  users: defineTable({
    // Convex Auth fields
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    // Custom fields
    familyId: v.optional(v.id('families')),
    profileId: v.optional(v.id('profiles')),
  }).index('by_email', ['email']),

  recipes: defineTable({
    familyId: v.id('families'),
    title: v.string(),
    photoUrl: v.optional(v.string()),
    ingredients: v.array(
      v.object({
        name: v.string(),
        quantity: v.string(),
        unit: v.string(),
      })
    ),
    instructions: v.array(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.number(),
    mealTypes: v.array(v.union(v.literal('breakfast'), v.literal('lunch'), v.literal('dinner'))),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    trashedAt: v.optional(v.number()),
    createdBy: v.id('profiles'),
    createdAt: v.number(),
  })
    .index('by_family', ['familyId'])
    .index('by_family_and_trashed', ['familyId', 'trashedAt']),

  favorites: defineTable({
    profileId: v.id('profiles'),
    recipeId: v.id('recipes'),
  })
    .index('by_profile', ['profileId'])
    .index('by_recipe', ['recipeId'])
    .index('by_profile_and_recipe', ['profileId', 'recipeId']),

  ratings: defineTable({
    profileId: v.id('profiles'),
    recipeId: v.id('recipes'),
    rating: v.union(v.literal('up'), v.literal('down')),
  })
    .index('by_profile', ['profileId'])
    .index('by_recipe', ['recipeId'])
    .index('by_profile_and_recipe', ['profileId', 'recipeId']),

  mealPlans: defineTable({
    familyId: v.id('families'),
    date: v.string(),
    mealType: v.union(v.literal('breakfast'), v.literal('lunch'), v.literal('dinner')),
    recipeId: v.optional(v.id('recipes')),
    assignedBy: v.id('profiles'),
    assignedAt: v.number(),
  })
    .index('by_family', ['familyId'])
    .index('by_family_and_date', ['familyId', 'date']),

  recurringMeals: defineTable({
    familyId: v.id('families'),
    dayOfWeek: v.number(),
    mealType: v.union(v.literal('breakfast'), v.literal('lunch'), v.literal('dinner')),
    recipeId: v.id('recipes'),
  })
    .index('by_family', ['familyId'])
    .index('by_family_and_day', ['familyId', 'dayOfWeek']),

  shoppingLists: defineTable({
    familyId: v.id('families'),
    weekStartDate: v.string(),
    items: v.array(
      v.object({
        ingredient: v.string(),
        quantity: v.string(),
        unit: v.string(),
        aisle: v.string(),
        checked: v.boolean(),
        recipeId: v.optional(v.id('recipes')),
      })
    ),
    createdBy: v.id('profiles'),
    createdAt: v.number(),
  })
    .index('by_family', ['familyId'])
    .index('by_family_and_week', ['familyId', 'weekStartDate']),
})
