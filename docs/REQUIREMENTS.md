# MealPlanner - Requirements Document

## Overview

A web-based meal planning application for households/families to manage recipes, plan weekly meals, and generate shopping lists.

---

## Authentication & User Management

### Authentication
- Simple email/password authentication
- No social login initially

### Family Profiles
- Netflix-style profile switching (no PIN required)
- Unlimited profiles per account
- All profiles have equal permissions
- Shared recipe box across all profiles
- Shared meal plan (one family schedule)
- Personal favorites per profile
- Attribution tracking: who selected each meal, who rated each recipe
- Dangerous operations require confirmation (delete recipe, clear week, etc.)

---

## Feature: Recipe Box

### Display
- **Grid layout** with infinite scroll
- **Card contents**: recipe name, photo thumbnail, tag count (hover reveals full list), favorite indicator, prep/cook time

### Organization
- Multi-select meal types per recipe (breakfast, lunch, dinner)
- Flexible tagging system
- Favorites (per profile)
- Thumbs up/down ratings (per profile, aggregated for popularity)

### Filtering & Sorting
- Filter by meal type + tags
- **AND logic by default**, explicit operators for OR
- Sort by: favorites/popularity, name, date added

### Management
- Trash functionality for unpopular recipes

---

## Feature: Recipe Import

### Generic Parser
- Parse recipes from any URL using schema.org/Recipe structured data
- Fallback heuristics for sites without schema

### Import Flow
1. Paste URL
2. Preview extracted data
3. Edit/confirm (including auto-suggested tags)
4. Save

### Extracted Data
- Title
- Photo (picker if multiple found)
- Ingredients
- Instructions
- Prep time / Cook time
- Servings (adjustable with automatic ingredient scaling)

### Auto-Tagging
- Suggest tags based on major ingredients (chicken, fish, beef, vegetarian, etc.)
- User can edit/confirm before saving

### Manual Entry
- Allow creating recipes from scratch (no URL required)

### Error Handling
- If scraping fails or is incomplete, allow manual completion

---

## Feature: Weekly Meal Scheduling

### Layout
- Days scroll **vertically**
- Three columns: Breakfast, Lunch, Dinner

### Assigning Recipes
- Drag-and-drop from recipe box
- Click to open a recipe picker
- Both methods supported

### Recurring Meals
- Set repeating patterns (e.g., "every Monday breakfast = oatmeal")
- Manual override on specific days

### History & Planning
- Keep **1 year** of history
- Hide anything older than 1 week by default (expandable)
- Plan ahead **unlimited** (as far as desired)

### Attribution
- Track which profile selected each meal
- Track which profiles rated each recipe

### Empty Slots
- Display tastefully (no nagging)
- Offer "Surprise Me" button

---

## Feature: "Surprise Me"

### Behavior
- Appears on empty meal slots in the schedule
- Single recipe suggestion with "try again" button

### Algorithm
- **Slight boost** toward favorites (not heavy bias)
- **Context-aware**: respects the meal type of the slot (breakfast/lunch/dinner)
- **Ignores active filters** - pulls from entire recipe box
- **Avoids repeats** from the same week's schedule

---

## Feature: Shopping List

### Generation
- **Explicit/manual trigger** (not automatic)
- Editable after generation (add/remove/modify items)

### Views
- **Consolidated view**: all ingredients combined
- **Separated by meal view**: ingredients grouped by recipe/meal

### Organization
- Group ingredients by grocery aisle (produce, dairy, meat, etc.)

### Export
- Select ONE target at a time:
  - Text message (SMS)
  - Email
  - Instacart API integration

### Architecture
- **Modular integration system** for easy addition of future targets (Walmart, etc.)

---

## Data Models (Convex Schema)

### `families`
- `name`: string
- `createdAt`: number

### `profiles`
- `familyId`: Id<"families">
- `name`: string
- `avatarUrl`: optional string
- `createdAt`: number

### `users`
- `email`: string
- `passwordHash`: string
- `familyId`: Id<"families">
- `profileId`: Id<"profiles">

### `recipes`
- `familyId`: Id<"families">
- `title`: string
- `photoUrl`: optional string
- `ingredients`: array of { name, quantity, unit }
- `instructions`: array of string
- `prepTime`: optional number (minutes)
- `cookTime`: optional number (minutes)
- `servings`: number
- `mealTypes`: array of ("breakfast" | "lunch" | "dinner")
- `tags`: array of string
- `sourceUrl`: optional string
- `trashedAt`: optional number
- `createdBy`: Id<"profiles">
- `createdAt`: number

### `favorites`
- `profileId`: Id<"profiles">
- `recipeId`: Id<"recipes">

### `ratings`
- `profileId`: Id<"profiles">
- `recipeId`: Id<"recipes">
- `rating`: "up" | "down"

### `mealPlans`
- `familyId`: Id<"families">
- `date`: string (ISO date)
- `mealType`: "breakfast" | "lunch" | "dinner"
- `recipeId`: optional Id<"recipes">
- `assignedBy`: Id<"profiles">
- `assignedAt`: number

### `recurringMeals`
- `familyId`: Id<"families">
- `dayOfWeek`: number (0-6)
- `mealType`: "breakfast" | "lunch" | "dinner"
- `recipeId`: Id<"recipes">

### `shoppingLists`
- `familyId`: Id<"families">
- `weekStartDate`: string (ISO date)
- `items`: array of { ingredient, quantity, unit, aisle, checked, recipeId }
- `createdBy`: Id<"profiles">
- `createdAt`: number

---

## Implementation Phases

### Phase 1: Project Setup
1. Initialize Bun + Vite + React project
2. Install agent skills: `npx add-skill vercel-labs/agent-skills`
3. Configure TailwindCSS + shadcn/ui
4. Set up Convex backend
5. Configure ESLint + Prettier
6. Set up Vitest + Playwright
7. Create GitHub repo + Vercel deployment
8. Implement basic CI pipeline

### Phase 2: Authentication & Profiles
1. Implement email/password auth
2. Create family/profile data models
3. Build profile selector UI (Netflix-style)
4. Profile CRUD operations

### Phase 3: Recipe Box - Core
1. Recipe data model + Convex functions
2. Manual recipe entry form
3. Recipe grid display with cards
4. Infinite scroll implementation
5. Favorites toggle (per profile)
6. Thumbs up/down ratings

### Phase 4: Recipe Import
1. URL input + generic recipe parser
2. Photo picker (when multiple found)
3. Auto-tag suggestion based on ingredients
4. Preview/edit/confirm flow
5. Servings adjustment with ingredient scaling

### Phase 5: Recipe Box - Filtering & Organization
1. Meal type filter (breakfast/lunch/dinner)
2. Tag filter with AND/OR logic
3. Sort options (popularity, name, date)
4. Trash functionality
5. Search functionality

### Phase 6: Meal Scheduling
1. Weekly calendar view (vertical days, 3 columns)
2. Drag-and-drop recipe assignment
3. Click-to-pick recipe selector
4. Attribution tracking
5. History view (1 year, collapsed by default)
6. Future planning (unlimited)

### Phase 7: Recurring Meals
1. Recurring meal pattern setup
2. Manual override capability
3. Recurring meal indicators in UI

### Phase 8: Surprise Me
1. Random selection algorithm with favorite weighting
2. Context-aware meal type filtering
3. Same-week repeat avoidance
4. "Try again" functionality
5. Empty slot integration

### Phase 9: Shopping List
1. List generation from meal plan
2. Ingredient consolidation logic
3. Aisle grouping
4. Consolidated vs. by-meal views
5. Edit capabilities (add/remove/modify)

### Phase 10: Shopping List Export
1. Modular export architecture
2. Text message (SMS) export
3. Email export
4. Instacart API integration

---

## Verification & Testing Strategy

### Unit Tests (Vitest)
- All Convex functions (queries, mutations, actions)
- React component logic
- Utility functions (ingredient parsing, scaling, etc.)
- Run after each small task

### Integration Tests (Vitest)
- API endpoint flows
- Authentication flows
- Data model relationships

### E2E Tests (Playwright)
- User registration + profile creation
- Recipe CRUD workflow
- Import recipe from URL
- Meal scheduling drag-and-drop
- Shopping list generation + export
- Profile switching

### Manual Verification
- Visual inspection of grid layout + infinite scroll
- Drag-and-drop responsiveness
- Mobile/responsive behavior
- Surprise Me randomness verification
