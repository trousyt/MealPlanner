---
name: convex-guidelines
description: Guidelines for writing Convex backend functions, schemas, and queries. Use when writing or modifying any code in the convex/ directory, creating Convex functions (queries, mutations, actions), defining schemas, or working with Convex validators and database operations.
---

# Convex Guidelines

Follow these guidelines when writing Convex backend code.

## Quick Reference

### Function Syntax (Always Use)

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myFunction = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});
```

### Key Rules

1. **Always include validators** for both `args` and `returns` on all functions
2. **Use `v.null()`** when a function returns null or nothing
3. **Use indexes instead of `.filter()`** - define indexes in schema, use `.withIndex()`
4. **Use internal functions** (`internalQuery`, `internalMutation`, `internalAction`) for private functions
5. **Use public functions** (`query`, `mutation`, `action`) only for API endpoints

### Common Validators

| Type | Validator | Example |
|------|-----------|---------|
| String | `v.string()` | `"hello"` |
| Number | `v.number()` | `3.14` |
| Boolean | `v.boolean()` | `true` |
| Null | `v.null()` | `null` |
| ID | `v.id("tableName")` | `doc._id` |
| Array | `v.array(v.string())` | `["a", "b"]` |
| Object | `v.object({ key: v.string() })` | `{ key: "value" }` |
| Optional | `v.optional(v.string())` | `"value"` or `undefined` |
| Union | `v.union(v.string(), v.number())` | `"text"` or `42` |

### Schema Definition

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),
});
```

### Function Calling

- `ctx.runQuery(api.file.fn, args)` - Call query from query/mutation/action
- `ctx.runMutation(api.file.fn, args)` - Call mutation from mutation/action
- `ctx.runAction(internal.file.fn, args)` - Call action from action (rare)

## Detailed Reference

For comprehensive guidelines including:
- HTTP endpoints
- Pagination
- Full text search
- File storage
- Cron jobs
- TypeScript patterns
- Complete examples

See [references/full-guidelines.md](references/full-guidelines.md)
