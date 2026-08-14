# HSK Mind

HSK Mind is a Thai-first, gamified Chinese vocabulary learning application for HSK 1–4.

## Foundation status

Phase 1 currently contains the monorepo shell, Next.js web app, NestJS API, PostgreSQL Compose service, Prisma schema/seed workflow, shared packages, environment validation, health endpoint, Swagger, structured request logging, base design tokens, and test/tooling configuration.

Phase 2 (authentication/onboarding) is implemented and verified against PostgreSQL, production builds, and Chromium E2E coverage.

## Prerequisites

- Node.js 20+
- pnpm 11
- Docker Desktop

## Local setup

```powershell
pnpm install
Copy-Item .env.example .env
docker compose up -d postgres
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed
```

เปิด service ใน terminal แยกกัน:

```powershell
# Terminal 1 — PostgreSQL
docker compose up -d postgres

# Terminal 2 — NestJS API
pnpm --filter @hsk-mind/api dev

# Terminal 3 — Next.js web
pnpm --filter @hsk-mind/web dev
```

หรือใช้ `pnpm dev` เพื่อเปิด web และ API พร้อมกันหลัง PostgreSQL ทำงานแล้ว

URLs:

- Web: http://localhost:3000
- API health: http://localhost:3001/api/health
- API readiness: http://localhost:3001/api/health/ready
- Swagger: http://localhost:3001/docs

ตรวจฐานข้อมูลและ migration:

```powershell
docker compose ps
pnpm db:validate
pnpm db:migrate:deploy
pnpm db:seed
```

## Verification commands

```powershell
pnpm db:validate
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:auth-runtime
pnpm build
```

The original workbook at `D:\HSK Mind\HSK_3.0_1-4_Pinyin_Thai_A-Z.xlsx` is a read-only source and is intentionally not part of the application write path.

## Phase 2 Authentication & Onboarding

Authentication uses Argon2id password hashes and database-backed, rotating session cookies. The browser never receives password hashes or reset tokens, and forgot-password responses are intentionally generic.

### Local auth flow

1. Copy `.env.example` to `.env` and set a long `SESSION_SECRET`.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Apply migrations and seed: `pnpm db:migrate:deploy` then `pnpm db:seed`.
4. Start the API and web app together: `pnpm dev`.
5. Open [http://localhost:3000](http://localhost:3000). API health is at [http://localhost:3001/api/health/ready](http://localhost:3001/api/health/ready).

Routes implemented in this phase are `/register`, `/login`, `/forgot-password`, `/reset-password`, `/onboarding`, and the protected `/map` route. Reset-password delivery remains an email-provider adapter boundary; raw reset tokens are generated and stored hashed, never logged or returned by the API.

Landing Page exported references live under `docs/design-reference/auth/landing-page/`. The full-page `landing-page.png` is reference-only; runtime UI is implemented with React/CSS and loads only `logo.png` and `landing-features.png` from `apps/web/public/assets/landing/`.
