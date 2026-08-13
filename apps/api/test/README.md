# API integration test setup

API integration tests will use Vitest plus `@nestjs/testing` and Supertest against an isolated PostgreSQL database. Phase 1 provides the runner and a controller-level readiness smoke test; feature integration tests begin with authentication and onboarding in Phase 2.
