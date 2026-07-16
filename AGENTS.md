# Filixer AI

AI chat application built with TanStack Start (SSR), React 19, tRPC, Drizzle ORM + PostgreSQL, and OpenAI.

## Project

- **Stack:** TanStack Start (React 19, SSR), TanStack Router, TanStack Query, tRPC v11, Drizzle ORM, PostgreSQL (pg), Tailwind CSS v4, better-auth, OpenAI
- **Package manager:** `bun` (bun.lock)
- **Entry point:** TanStack Start boots from `src/router.tsx` → `src/routes/__root.tsx`; file-based routing under `src/routes/`
- **Env:** `.env.local` loaded via `dotenv`; validated by `@t3-oss/env-core` in `src/env.ts`

## Commands

| Command | What |
|---------|------|
| `bun --bun run dev` | Dev server on port 3000 |
| `bun --bun run build` | Production build |
| `bun --bun run preview` | Preview production build |
| `bun --bun run test` | Run tests (Vitest, no test files exist yet) |
| `bun --bun run lint` | ESLint (tanstack/eslint-config) |
| `bun --bun run format` | Prettier write + ESLint fix |
| `bun --bun run check` | Prettier check only |
| `bun --bun run db:generate` | Drizzle Kit: generate migrations |
| `bun --bun run db:migrate` | Drizzle Kit: apply migrations |
| `bun --bun run db:push` | Drizzle Kit: push schema directly |
| `bun --bun run db:pull` | Drizzle Kit: introspect DB |
| `bun --bun run db:studio` | Drizzle Kit Studio |

## Architecture

```
src/
├── routes/              # TanStack file-based routing (React Router)
│   ├── __root.tsx       # Root layout, head, providers
│   ├── _auth/           # Authenticated routes (chat/*)
│   ├── _public/         # Public routes (sign-in, sign-up)
│   └── api/             # API endpoints
│       ├── auth/$.ts    # better-auth handler (GET/POST)
│       └── trpc.$.tsx   # tRPC fetch handler (GET/POST)
├── router.tsx           # Router creation with TanStack Query context
├── trpc/
│   ├── init.ts          # tRPC init, publicProcedure, protectedProcedure
│   ├── context.ts       # Request context (session + user from better-auth)
│   ├── react.ts         # TRPCProvider + useTRPC hook
│   └── router/          # tRPC routers (conversation, message)
├── db/
│   ├── index.ts         # Drizzle client (node-postgres)
│   ├── schema.ts        # Tables: user, session, account, verification, conversation, message
│   └── enum.ts          # PG enum (message_role)
├── features/
│   └── chat/            # Chat UI (container, input, message-list, room)
├── components/
│   ├── ui/              # shadcn-style UI primitives (button, dialog, sidebar, etc.)
│   └── layout/          # App sidebar, nav-user
├── lib/
│   ├── ai.ts            # OpenAI client init
│   ├── auth.ts          # better-auth server config (email/password, Drizzle adapter)
│   ├── auth-client.ts   # better-auth browser client
│   ├── auth.functions.ts# Auth server functions
│   └── utils.ts         # cn(), flattenInfiniteData(), getFallbackName()
├── hooks/
│   ├── use-stream.ts    # tRPC subscription hook for streaming AI responses
│   ├── use-mobile.ts    # Responsive breakpoint detection
│   └── use-scroll.ts    # Scroll-to-bottom utility
└── integrations/
    └── tanstack-query/  # TRPC client setup (splitLink: httpBatchStreamLink + httpSubscriptionLink)
```


## Conventions

- **TypeScript strict mode** — `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports
- **Path aliases:**  `@/` map to `src/` (e.g. `@/trpc/react`, `@/lib/utils`)
- **Prettier:** no semicolons, single quotes, trailing commas
- **ESLint:** `@tanstack/eslint-config` with relaxed import/sort rules
- **Validation:** Zod everywhere — tRPC input schemas, form validation with `react-hook-form` + `@hookform/resolvers`
- **CSS:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, `tw-animate-css`), `cn()` utility from clsx + tailwind-merge
  - **Theme:** DeepSeek-inspired: dark sidebar (`--sidebar: oklch 0.18`), light chat area (`--background: oklch 0.98`), blue primary (`oklch(0.55 0.2 260)`). Chat-specific CSS classes: `.chat-message-user`, `.chat-message-ai`, `.chat-input-wrapper`, `.sidebar-conversation-item`.
  - **Theme variables** in `:root` + `.dark` blocks in `src/styles.css`
- **UI components:** shadcn-style Radix primitives, Phosphor icons
- **Error handling:** tRPC `TRPCError` with `UNAUTHORIZED`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR` codes
- **File naming:** All files use `kebab-case` — no PascalCase filenames. The "main" component of a feature folder goes in `index.tsx` (not duplicating the folder name). Example: `features/sign-in/index.tsx` + `features/sign-in/sign-up.tsx` and `features/chat/room.tsx`. Extension is `.tsx` for components, `.ts` for non-component modules (hooks, lib, db, trpc).
- **Components:** Every component must be:
  - **Fully type-safe** — explicit props/return types via `interface`/`type` (not `React.FC`), no `any` or implicit `any`
  - **ES6 arrow function** — `export const MyComponent = ({ ... }: Props) => { ... }` style, **no `function` keyword**, **no `React.FC`**
  - Named export only, no default exports

## Notes

<!-- Quick-add section for future discoveries -->