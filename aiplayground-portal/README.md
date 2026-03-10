# AIPlayground Training Portal

A training portal for teams to learn AI-assisted development — covering Claude Code, GitHub Copilot, prompt engineering, agentic workflows, testing, security, and more.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials, JWT sessions)
- **Charts**: Recharts
- **Content**: Markdown files rendered as HTML

## Features

- 18 training modules with rich markdown content and hands-on exercises
- Module progress tracking per user
- Discussion forum with threads, posts, replies, and upvotes
- Admin panel: user management, content/resource management, forum moderation
- Analytics dashboard with completion rates, user progress, and engagement trends
- Role-based access control (admin / member / guest)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/beedev/aiplayground.git
cd aiplayground/aiplayground-portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

Create the database and user:

```sql
-- Connect as postgres superuser
psql -U postgres

-- Run these commands
CREATE USER aiplayground WITH PASSWORD 'aiplayground' CREATEDB;
CREATE DATABASE aiplayground OWNER aiplayground;
\q
```

### 4. Configure environment

Copy the example env file and update if needed:

```bash
cp .env.example .env
```

Default `.env` values:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=aiplayground
POSTGRES_USER=aiplayground
POSTGRES_PASSWORD=aiplayground
DATABASE_URL=postgresql://aiplayground:aiplayground@localhost:5432/aiplayground

NEXTAUTH_URL=http://localhost:5013/aiplayground
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
PORT=5013
NEXT_PUBLIC_BASE_PATH=/aiplayground
```

### 5. Push database schema

```bash
npx prisma db push
```

### 6. Seed the database

This creates the admin user and all 18 training modules:

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

Open **http://localhost:5013/aiplayground** in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 5013 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed admin user and modules |
| `npm run db:reset` | Reset database and re-seed |

## Project Structure

```
aiplayground-portal/
├── content/modules/          # 18 training MD files
├── prisma/
│   ├── schema.prisma         # Database schema (12 models)
│   └── seed.ts               # Seed script
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login page
│   │   ├── (main)/           # Dashboard, modules, forum
│   │   ├── (admin)/          # Admin panel pages
│   │   └── api/              # 16 API routes
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Sidebar, header
│   │   ├── modules/          # Module card, content renderer, progress
│   │   ├── forum/            # Thread list, post card, upvote
│   │   ├── admin/            # User table, analytics charts
│   │   └── common/           # Empty state, spinner, confirm dialog
│   └── lib/
│       ├── auth.ts           # NextAuth configuration
│       ├── prisma.ts         # Prisma client singleton
│       ├── markdown.ts       # MD file reading utilities
│       └── validations/      # Zod schemas
└── .env.example              # Environment template
```

## Training Modules

1. AI-Assisted Dev Foundations
2. GitHub Copilot Essentials
3. Claude Code Essentials
4. Copilot vs Claude Code
5. Prompt Engineering for Developers
6. Agentic Workflows & Orchestration
7. Multi-User AI Collaboration
8. Requirement Traceability & Preventing Hallucination
9. AI-Assisted Testing
10. Secure Code Generation
11. AI-Assisted Dev Best Practices & Governance
12. AI Boundary Enforcement
13. AI-Enabled Development Lifecycle
14. AI + Manual Hybrid Workflow
15. Git Multi-User Playbook
16. HTC AI-Assisted Development POV
17. Setting Up Claude Code for Your Project
18. Claude Cowork & Agent Teams

## Adding Content

- **Edit module text**: Edit markdown files in `content/modules/`
- **Add video/link resources**: Admin > Modules > expand a module > Add Resource
- **Add team members**: Admin > Users > Create User

## License

Internal use only.
