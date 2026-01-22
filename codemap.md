# MealPlanner Codemap

Quick reference for navigating the codebase.

## Project Structure

```
mealplanner/
├── convex/                    # Convex backend
│   ├── schema.ts              # Data models & indexes
│   ├── convex_rules.md        # Convex coding guidelines
│   └── _generated/            # Auto-generated types/API
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx     # shadcn Button component
│   ├── App.tsx                # Main app component (placeholder)
│   ├── main.tsx               # Entry point, Convex provider setup
│   └── index.css              # Global styles, Tailwind imports
├── tests/
│   ├── unit/                  # Vitest unit tests
│   ├── integration/           # Vitest integration tests
│   └── e2e/                   # Playwright E2E tests
├── docs/
│   └── REQUIREMENTS.md        # Full feature spec & phases
└── .github/
    └── workflows/
        └── ci.yml             # GitHub Actions CI pipeline
```

## Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build config, React plugin, path aliases |
| `tailwind.config.ts` | TailwindCSS configuration |
| `eslint.config.js` | ESLint rules (TS, React, Prettier) |
| `.prettierrc` | Prettier formatting (single quotes, trailing commas) |
| `vitest.config.ts` | Unit/integration test config (jsdom, coverage) |
| `playwright.config.ts` | E2E test config (multi-browser) |
| `tsconfig.json` | TypeScript strict mode config |
| `convex.json` | Convex project configuration |

## Data Schema (convex/schema.ts)

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Auth users | `email`, `passwordHash`, `currentFamilyId` |
| `families` | Family groups | `name`, `ownerId` |
| `profiles` | Family member profiles | `familyId`, `name`, `avatar`, `color`, `isOwner` |
| `recipes` | Recipe storage | `familyId`, `title`, `ingredients`, `instructions`, `sourceUrl` |
| `favorites` | Recipe favorites | `profileId`, `recipeId` |
| `ratings` | Recipe ratings | `profileId`, `recipeId`, `rating` |
| `mealPlans` | Scheduled meals | `familyId`, `recipeId`, `date`, `mealType`, `assignedProfileId` |
| `recurringMeals` | Recurring patterns | `familyId`, `recipeId`, `pattern`, `mealType` |
| `shoppingLists` | Shopping lists | `familyId`, `weekStart`, `items`, `checkedItems` |

### Key Indexes

- `recipes`: by_family, by_family_deleted, by_family_title
- `mealPlans`: by_family_date_range
- `favorites/ratings`: by_profile, by_recipe
- `profiles`: by_family

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Dev server (localhost:5173)
bun run build        # Production build
bun run test         # Vitest unit/integration tests
bun run test:e2e     # Playwright E2E tests
bun run lint         # ESLint check
bun run format       # Prettier format
npx convex dev       # Convex dev server
```

## Implementation Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | Project Setup | Complete |
| 2 | Authentication & Profiles | **Next** |
| 3 | Recipe Box - Core | Pending |
| 4 | Recipe Import | Pending |
| 5 | Recipe Box - Filtering | Pending |
| 6 | Meal Scheduling | Pending |
| 7 | Recurring Meals | Pending |
| 8 | Surprise Me | Pending |
| 9 | Shopping List | Pending |
| 10 | Shopping List Export | Pending |

## Phase 2 Scope (Authentication & Profiles)

**Backend (Convex):**
- Auth mutations (Convex Auth)
- Family CRUD operations
- Profile CRUD operations
- Profile switching logic

**Frontend:**
- Login/signup forms
- Netflix-style profile selector
- Profile management UI
- Auth guards for protected routes

## Tech Stack Quick Reference

| Category | Technology |
|----------|------------|
| Runtime | Bun |
| Frontend | React 19, React Router |
| Build | Vite |
| Backend | Convex |
| UI | shadcn/ui, TailwindCSS |
| Unit Tests | Vitest |
| E2E Tests | Playwright |
| CI/CD | GitHub Actions, Vercel |

## Path Aliases

- `@/` → `src/`

## Dev URLs

- Frontend: http://localhost:5173
- Convex Dashboard: https://dashboard.convex.dev
