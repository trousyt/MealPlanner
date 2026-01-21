# MealPlanner - Claude Code Instructions

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime/Package Manager | Bun |
| Frontend Framework | React |
| Build Tool | Vite |
| Backend/Database | Convex |
| UI Components | shadcn/ui |
| Styling | TailwindCSS |
| State Management | Convex (server) + React Query (client cache) |
| Unit/Integration Tests | Vitest |
| E2E Tests | Playwright |
| Linting | ESLint |
| Formatting | Prettier |
| Hosting | Vercel (auto-deploy from GitHub) |
| AI Agent Skills | vercel-labs/agent-skills |

## Development Methodology

- **Test-Driven Development (TDD)**: Write tests before implementation
- **Small units**: Break tasks into small, testable pieces
- **Run tests after each task completion**
- Follow Convex guidelines from `convex_rules.md`

## Commands

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Run unit/integration tests
bun run test

# Run E2E tests
bun run test:e2e

# Lint
bun run lint

# Format
bun run format
```

## Agent Skills

Install via: `npx add-skill vercel-labs/agent-skills`

Provides:
- **react-best-practices**: React and Next.js performance optimization rules
- **web-design-guidelines**: Accessibility and UX checks
- **vercel-deploy-claimable**: Claimable Vercel deployments

## Project Structure

```
mealplanner/
├── convex/           # Convex backend functions and schema
├── src/
│   ├── components/   # React components
│   │   ├── ui/       # shadcn components
│   │   ├── recipes/
│   │   ├── scheduling/
│   │   ├── shopping/
│   │   └── profiles/
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   └── pages/        # Page components
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/             # Documentation and requirements
```

## Coding Conventions

- Use TypeScript strict mode
- All Convex functions must have argument and return validators
- Prefer functional components with hooks
- Use React Query for client-side caching alongside Convex subscriptions
- Follow ESLint + Prettier rules
- All features require tests before implementation (TDD)
