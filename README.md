# HSK Mind

HSK Mind is a Thai-first, gamified Chinese vocabulary learning application for HSK 1–4.

## Foundation status

Phase 1 currently contains the monorepo shell, Next.js web app, NestJS API, PostgreSQL Compose service, Prisma schema/seed workflow, shared packages, environment validation, health endpoint, Swagger, structured request logging, base design tokens, and test/tooling configuration.

Phase 2 (authentication/onboarding) has not started.

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
pnpm build
```

The original workbook at `D:\HSK Mind\HSK_3.0_1-4_Pinyin_Thai_A-Z.xlsx` is a read-only source and is intentionally not part of the application write path.
