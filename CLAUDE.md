# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIPlayground is a training portal for teams learning AI-assisted development. It is a Next.js 14 App Router application located entirely in the `aiplayground-portal/` subdirectory. All commands below should be run from `aiplayground-portal/`.

## Commands

```bash
cd aiplayground-portal

# Development
npm run dev          # Start dev server on port 5013

# Build & production
npm run build
npm run start

# Linting
npm run lint

# Database
npm run db:push      # Push Prisma schema changes (npx prisma db push)
npm run db:seed      # Seed admin user and all modules (tsx prisma/seed.ts)
npm run db:reset     # Force-reset DB and re-seed
```

There are no automated tests in this project.

## Architecture

### Routing & Layout Groups

Next.js App Router with three route groups:
- `(auth)/` — Login page, no persistent nav
- `(main)/` — Dashboard, modules, forum, leaderboard; requires authenticated session
- `(admin)/` — Admin panel; requires `role === "ADMIN"`

All pages use `auth()` from `@/lib/auth` at the top to guard access, redirecting to `/login` when unauthenticated.

### Base Path

The app is served under `/aiplayground` by default (`NEXT_PUBLIC_BASE_PATH` env var, set in `next.config.mjs`). Navigation links must use `withBasePath()` / `stripBasePath()` from `src/lib/paths.ts` rather than hardcoded paths.

### Data Layer

- **Prisma** with PostgreSQL. Client singleton in `src/lib/prisma.ts`.
- Schema models: `User`, `Module`, `ModuleResource`, `UserProgress`, `ForumThread`, `ForumPost`, `PostUpvote`, `Team`, `Round`, `TeamMembership`, `Poll`, `Vote`.
- All DB access happens in Server Components or API Route Handlers — never in Client Components.

### Module Content System

Training modules are markdown files in `content/modules/`. The `Module` DB record stores a `contentFilePath` (e.g. `content/modules/01-foo.md`) pointing to the file. Content is loaded at request time via `getModuleContent()` in `src/lib/markdown.ts`. Modules split on `## Exercise` headings to separate main content from the exercise tab.

Admin can scan for unregistered markdown files (`/api/admin/modules/scan`) and ingest them (`/api/admin/modules/ingest`) without a deploy.

### Authentication

NextAuth v5 (beta) with credentials provider and JWT sessions. The JWT carries `id` and `role`. Role values are `"ADMIN"` and `"MEMBER"` (stored as strings in DB).

### Component Conventions

- UI primitives: shadcn/ui components in `src/components/ui/` (Radix-based, do not modify directly)
- Feature components grouped by domain: `modules/`, `forum/`, `admin/`, `layout/`, `common/`
- Input validation: Zod schemas in `src/lib/validations/`

### API Routes

All routes live under `src/app/api/`. Admin-only routes are under `src/app/api/admin/` and verify `role === "ADMIN"` via the session. Public-facing routes check authentication but not role.

## Environment Variables

Required in `aiplayground-portal/.env`:
```
DATABASE_URL=postgresql://aiplayground:aiplayground@localhost:5432/aiplayground
NEXTAUTH_URL=http://localhost:5013/aiplayground
NEXTAUTH_SECRET=<random base64>
NEXT_PUBLIC_BASE_PATH=/aiplayground
```
