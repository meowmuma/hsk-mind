# HSK Mind Implementation Plan

## Project Status

- Current phase: **Phase 1 — Foundation** (complete and verified)
- Last updated: **2026-08-14**
- Overall status: **Phase 1 complete. Phase 2 has not started.**
- Major blockers: None for Phase 1. Figma, mascot, avatar, character, and production audio assets remain non-blocking and use replaceable placeholders.

## Locked Product Decisions

These rules come from the user brief and the product specification. Implementation must preserve them unless a documented product decision changes them.

- [ ] HSK scope is HSK1–HSK4 only. New users always begin with HSK1 unlocked; onboarding target HSK is a preference and cannot skip cities.
- [ ] Each city has Flashcard, Quiz, Matching, Listening, and Review. Flashcard, Quiz, Matching, and Listening are staged; Review has no fixed stages.
- [ ] A stage contains at most 20 vocabulary entries. Stage count is dynamic: `ceil(activeVocabularyCount / 20)` per HSK level. The final stage may contain fewer entries.
- [ ] Vocabulary is sorted by a deterministic Pinyin A–Z sort key: normalize tone marks to base letters, lowercase, ignore whitespace/punctuation, then tie-break by normalized full Pinyin, source order, and stable vocabulary ID. The persistent `StageVocabulary` mapping is the source of truth after import; runtime queries must not regroup words dynamically.
- [ ] The same persistent vocabulary set for a stage is used by Flashcard, Quiz, Matching, and Listening.
- [ ] Flashcard grants no XP, no Stars, and no competitive ranking XP; viewing every word once completes the Flashcard stage.
- [ ] Quiz and Listening use four options, a default 15-second timer, and treat timeout as incorrect. Correct newly rewardable vocabulary grants +10 XP; previously claimed base XP cannot be farmed through replay.
- [ ] Quiz has combo milestones x5/x10/x15/x20 with +5/+10/+15/+20 XP. Combo rewards are incremental and protected against replay farming.
- [ ] Quiz and Listening Stars use 0/1/2/3 tiers at <60% / 60% / 75% / 90% accuracy boundaries. Best Stars never decrease.
- [ ] Listening auto-plays once and permits one additional replay only. Replay does not reset the question timer and the server enforces the limit.
- [ ] Listening has no Quiz-style combo.
- [ ] Matching Stars use average seconds per pair: 3 Stars <=3.0s, 2 Stars <=4.5s, 1 Star <=6.0s, otherwise 0. Matching XP for a full 20-item stage is 200/150/100/0 by tier and scales by `round(tierXpFor20 * itemCount / 20)` for remainder stages.
- [ ] Matching replay awards only the positive difference when the best reward tier improves. A faster time within the same tier gives no additional XP, but may improve best time.
- [ ] Review aggregates wrong vocabulary from Quiz, Matching, and Listening. Resolving a queued word gives +2 XP, clearing the current Review set gives +10 XP, and Review XP contributes to permanent XP but not Monthly Competitive XP.
- [ ] Review anti-farming includes a maximum of one XP claim per word per day and requires the word to be present before the Review session starts.
- [ ] Maximum level is 40. Titles are Lv1–10 ผู้ฝึกหัด, Lv11–20 จอมยุทธ์ฝึกหัด, Lv21–30 จอมยุทธ์, and Lv31–40 เซียนยุทธ์. Total XP is permanent and level stays at 40 after the cap.
- [ ] Initial next-level XP is `200 + ((currentLevel - 1) * 25)`. Balance values must live in versioned config/database data, not UI components or controllers.
- [ ] City unlock requires the configured level gate, at least 70% completion in each staged mode (Flashcard, Quiz, Matching, Listening), and at least 70% of the prerequisite city's available Stars from Quiz, Matching, and Listening. Review is excluded. Unlocks are permanent once granted.
- [ ] Maximum Stars for a city are `stageCount * 3 star-producing modes * 3`; use Best Stars only.
- [ ] Monthly ranking is a separate calendar season in Asia/Bangkok. An idempotent season service may lazy-create the season on first access. It never resets Total XP, Level, Stars, progress, unlocks, achievements, or lifetime bests.
- [ ] Monthly ranking categories are Monthly XP, Monthly Accuracy, Monthly Average Speed, and Monthly Best Combo. Review XP is not eligible for Monthly XP.
- [ ] The browser submits player actions, not authoritative XP, Stars, unlocks, completion, or ranking scores. Backend validation, database transactions, immutable answer facts, and idempotent reward claims are authoritative.
- [ ] Passwords use Argon2; auth uses secure HttpOnly/SameSite cookies, DTO validation, rate limiting, RBAC, and reset tokens stored hashed with expiry.
- [ ] Mascot MVP is deterministic/event-driven, with replaceable art and message templates. AI may be added later but can never decide rewards, unlocks, or ranking results.
- [ ] Figma exports, mascot, avatar, character, and production audio artwork are not final and must not block Phase 1. Use asset keys and replaceable placeholders; authentication and progression must not depend on image filenames.
- [ ] Quiz, Matching, and Listening mark Stage Complete only when the server accepts an attempt that processed every stage item successfully. Partial and abandoned attempts do not count.
- [ ] City completion uses the exact ratio `completedStages / totalStages >= 0.70`; do not floor or ceil the completed-stage count before comparison.
- [ ] Review snapshots the eligible queue at session start. The +10 clear bonus is claimable once only after every item in that snapshot is resolved.
- [ ] At most one active game attempt may exist per user + stage + mode. The existing attempt must complete, abandon, or expire before another can start.
- [ ] MVP Daily Mission rewards increase Permanent Total XP but use `rankEligible=false`; ranking eligibility remains a future-configurable value. The placeholder values 20/30/50/+50 are not final Product Decisions.
- [ ] Existing UX/UI references are the visual source of truth. Missing states may be added without changing the visual language; unnecessary redesign is out of scope.

## Open Questions / Balance Values

### Open questions requiring a decision or explicit default

- [x] Pinyin sorting is locked: normalize tone marks to base letters, lowercase, ignore whitespace/punctuation, then tie-break by normalized full Pinyin, source order, and stable vocabulary ID.
- [x] Quiz, Matching, and Listening Stage Completion requires a server-accepted attempt containing every stage item; partial/abandoned attempts do not count.
- [x] 70% completion uses exact ratio comparison: `completedStages / totalStages >= 0.70`.
- [x] Review clear bonus snapshots the eligible queue at session start and is claimable once after the complete snapshot is resolved.
- [x] One active game attempt is allowed per user + stage + mode; the prior attempt must complete, abandon, or expire.
- [x] MVP Daily Mission rewards are Permanent XP only with `rankEligible=false`; the reward amounts 20/30/50/+50 remain TBD placeholders and rank eligibility stays configurable.
- [ ] Confirm the product/source interpretation of the workbook labeled HSK 3.0 (2025/2026), including whether the current 2,000-entry dataset is the MVP content baseline and how future dataset versions are approved.
- [ ] Confirm the production audio source/provider and licensing. Missing `audioUrl` must remain a supported fallback state.
- [ ] Confirm how Matching wrong-pair history is displayed (attempt-only versus lifetime “frequent mistakes”); the backend will preserve both event facts and aggregate counters.
- [ ] Confirm final mobile design delivery. Desktop references remain the visual baseline; missing mobile assets do not block placeholder-backed product logic.

### Initial configurable/balance values

These are defaults, not scattered constants. Store them in a typed shared config first; expose admin/database overrides only with audit history and effective dates.

| Area | Initial value |
|---|---|
| Stage size | 20 words |
| Level cap | 40 |
| Level XP curve | 200 + 25 per current level |
| City level gates | HSK1 Lv1, HSK2 Lv8, HSK3 Lv18, HSK4 Lv28 |
| City completion/star rate | 70% |
| Quiz/Listening timer | 15 seconds per item |
| Quiz/Listening base XP | 10 XP per newly rewardable vocabulary item |
| Quiz/Listening star thresholds | 60%, 75%, 90% |
| Quiz combo milestones | x5/x10/x15/x20: 5/10/15/20 XP |
| Listening replay limit | 1 additional play |
| Matching time thresholds | 3.0s / 4.5s / 6.0s per pair |
| Matching XP for 20 items | 200 / 150 / 100 / 0 by tier |
| Review rewards | 2 XP per resolved word, 10 XP clear bonus, 1 claim/word/day |
| Monthly accuracy eligibility | 100 eligible answers |
| Monthly speed eligibility | 100 timed items and at least 70% Quiz+Listening accuracy |
| Ranking timezone | Asia/Bangkok |
| Daily missions | 3/day; reward amounts TBD placeholders; MVP `rankEligible=false`, configurable later |

## Architecture

### Proposed repository layout

```text
hsk-mind/
├─ apps/
│  ├─ web/                         # Next.js App Router, Tailwind, TanStack Query
│  │  ├─ app/
│  │  │  ├─ (auth)/               # register, login, forgot/reset
│  │  │  ├─ (onboarding)/
│  │  │  ├─ (app)/                # map, vocabulary, ranking, stats, profile
│  │  │  ├─ hsk/[hskCode]/        # city and stage selection
│  │  │  ├─ play/[attemptId]/      # server-created game attempt UI
│  │  │  └─ admin/
│  │  ├─ components/              # shared visual primitives
│  │  ├─ features/                # feature-specific UI/hooks/query keys
│  │  ├─ lib/                     # API client, auth, asset resolver
│  │  ├─ public/assets/            # placeholder-backed asset library
│  │  └─ styles/
│  └─ api/                         # NestJS REST API
│     ├─ src/modules/
│     │  ├─ auth users profile vocabulary stages game progress xp review
│     │  ├─ missions leaderboard mascot admin config
│     │  └─ common/                # guards, pipes, errors, request ID, logging
│     └─ test/
├─ packages/
│  ├─ shared-types/                # DTO response/enums, no server secrets
│  ├─ game-config/                 # typed defaults and balance schemas
│  └─ shared-utils/                # pinyin, date/season, pure formulas
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ scripts/
│  ├─ import-vocabulary.ts
│  ├─ validate-vocabulary.ts
│  └─ rebuild-monthly-stats.ts
├─ docs/
│  ├─ product-spec/
│  ├─ design-reference/
│  └─ decisions/
├─ docker-compose.yml
├─ pnpm-workspace.yaml
├─ .env.example
└─ README.md
```

- [ ] Keep the original workbook at `D:\HSK Mind\HSK_3.0_1-4_Pinyin_Thai_A-Z.xlsx` read-only. Import scripts receive an explicit source path and never overwrite, move, or rewrite it.
- [ ] Use pnpm workspaces without adding Turborepo unless build scale proves it necessary.
- [ ] Keep pure game formulas and balance parsing outside NestJS controllers and React components so they can be unit-tested independently.
- [ ] Keep REST/OpenAPI as the initial API boundary; use TanStack Query for server state and local reducer state for transient game interaction.

### Proposed database entities and relationships

```text
User 1─1 UserProfile 1─* UserSession
User 1─* UserHskUnlock *─1 HskLevel 1─* Stage 1─* StageVocabulary *─1 Vocabulary
User 1─* UserStageProgress (stage + mode)
User 1─* UserVocabularyModeProgress (vocabulary + mode)
User 1─* GameAttempt 1─* GameAnswer
User 1─* XpTransaction
User 1─* ReviewQueueItem 1─1 ReviewSession 1─* ReviewAnswer
User 1─* UserDailyMission *─1 DailyMissionDefinition
LeaderboardSeason 1─* MonthlyUserStat *─1 User
MascotEvent/Message is derived from authoritative domain events and is never a reward source.
```

Core entities:

- [ ] `User`: UUID, unique email, Argon2 password hash, role, status, timestamps.
- [ ] `UserSession`: hashed refresh/session token, expiry, rotation/revocation metadata, device/IP audit fields as appropriate; never store raw tokens.
- [ ] `UserProfile`: user PK/FK, display name, avatar key, target HSK, total XP, cached level, timestamps. Title is derived from level or stored only as a projection.
- [ ] `HskLevel`: stable code HSK1–HSK4, Thai name, order, unlock config, active flag.
- [ ] `Vocabulary`: UUID, HSK FK, Hanzi, Pinyin, normalized `pinyinSortKey`, Thai meaning, optional part of speech/source row/source version, nullable audio URL, active flag. No Hanzi uniqueness constraint.
- [ ] `VocabularyImport`: source filename/version, checksum, row counts, validation status, imported by, created timestamp; provides reproducible lineage without modifying the source file.
- [ ] `Stage`: HSK FK, stable stage number, generation/import version, active flag, created timestamp; unique `(hskLevelId, stageNo)`.
- [ ] `StageVocabulary`: Stage FK, Vocabulary FK, order number, generation version; unique `(stageId, vocabularyId)` and `(stageId, orderNo)`.
- [ ] `UserStageProgress`: user + stage + staged mode, completed flag/time, attempt count, best Stars, best accuracy, best time, best combo, claimed combo XP, claimed Matching reward tier/XP. Unique `(userId, stageId, mode)`.
- [ ] `UserVocabularyModeProgress`: user + vocabulary + mode, correct/wrong/timeout counts, needsReview, last timestamps, base XP claim state, last Review XP date. Use stage-aware reward claim keys where a vocabulary can occur in different HSK/stage contexts.
- [ ] `GameAttempt`: user, stage or Review session, mode, server start/completion timestamps, status, item counts, computed accuracy/Stars/time/combo, result snapshot/version, computed XP projection. Client values are never authoritative.
- [ ] `GameAnswer`: attempt, vocabulary, server-issued item sequence, selected option ID/value, correctness, timeout, server-validated response/effective time, replay count/state, option snapshot metadata. Enforce one accepted answer per item.
- [ ] `XpTransaction`: immutable ledger row with amount, source type, rank eligibility, source reference, unique `claimKey`, balance/config version, created timestamp. This is the reward audit source of truth.
- [ ] `UserHskUnlock`: user + HSK unique pair, unlocked timestamp, unlock decision/config snapshot; never delete or relock after grant.
- [ ] `ReviewQueueItem`, `ReviewSession`, and `ReviewAnswer`: queue provenance, wrong counters, session-start snapshot, resolution state, and idempotent clear-bonus claim.
- [ ] `DailyMissionDefinition` and `UserDailyMission`: typed mission, target/reward/rank eligibility, local date, progress, completion and claim timestamps; unique user/mission/local date.
- [ ] `LeaderboardSeason` and `MonthlyUserStat`: season boundaries/timezone, aggregate XP/accuracy/effective time/timed items/best combo, qualification flags, timestamps; unique season/user and rebuildable from immutable facts.
- [ ] `BalanceConfig`/`BalanceConfigVersion`: typed, auditable values with effective timestamps. Do not allow a balance change to rewrite historical results.
- [ ] `MascotEvent`/message template storage is optional for MVP but should consume domain events and remain non-authoritative.

## Phase 0 — Discovery & Project Setup

- [x] Inventory every relevant workspace file and confirm there is no existing application source tree or Git repository.
- [x] Read `HSK_Mind_Codex_Package/START_HERE.md`.
- [x] Read `HSK_Mind_Codex_Package/HSK_Mind_Codex_Spec.md` in full.
- [x] Inspect the parallel DOCX specification and confirm it is the formatted copy of the Markdown specification.
- [x] Inspect all four design references: register, onboarding, main map, and current ranking.
- [x] Inspect the original Excel workbook without modifying it.
- [x] Record workbook structure: `HSK1-4 A-Z` (A1:G2004, 2,000 data rows), `สรุประดับ`, and `แหล่งข้อมูล` sheets.
- [x] Record workbook counts: HSK1 300, HSK2 200, HSK3 500, HSK4 1,000; expected initial stage counts are 15, 10, 25, and 50 at size 20.
- [x] Record data risks: 21 duplicated Hanzi values, no audio column, no dedicated sort-key column, and optional part-of-speech/source-note fields beyond the minimum product schema.
- [x] Identify contradictions, missing requirements, technical risks, and missing UI states in this plan.
- [x] Propose the monorepo, schema, import, authority, anti-farming, unlock, ranking, auth, frontend, asset, and test strategies.
- [x] Create this master checklist.
- [x] Obtain approval to begin Phase 1.

## Phase 1 — Foundation

- [x] Scaffold the pnpm workspace and package scripts.
- [x] Create `apps/web` with Next.js App Router, TypeScript, Tailwind, base CSS variables, and TanStack Query.
- [x] Create `apps/api` with NestJS, TypeScript, REST bootstrap, validation pipe, Swagger/OpenAPI, and central error shape.
- [x] Add PostgreSQL Docker Compose with persistent local volume and health check configuration.
- [x] Add Prisma, the initial schema, migration workflow, and isolated seed command.
- [x] Add `packages/shared-types`, `packages/game-config`, and `packages/shared-utils`.
- [x] Add `.env.example`, local environment validation, and documented local commands.
- [x] Add ESLint, Prettier, TypeScript checks, unit test runner, API integration test setup notes, and Playwright-ready project structure.
- [x] Add request IDs, structured logging, safe production error handling, Swagger, and health endpoints.
- [x] Add initial design tokens and asset-key resolver without inventing final artwork.
- [x] Verify Prisma schema validation, Prisma Client generation, TypeScript, lint, formatting, unit tests, and web/API production builds.
- [x] Start Docker PostgreSQL, execute the initial migration and seed, and verify API readiness against the database.
- [x] Verify web, API, and database can start together and document the command in README.

## Phase 2 — Authentication & Onboarding

- [ ] Implement Landing Page according to the Design Reference/Figma.
- [ ] Route the “เริ่มการฝึก” button to Register.
- [ ] Route the “เข้าสู่ระบบ” button to Login.
- [ ] Show HSK 1–4 scope and the current vocabulary dataset information on the Landing Page.
- [ ] Do not present features outside the MVP as already available.
- [ ] Implement register with email validation, minimum eight-character password, duplicate-email handling, confirm-password UI, and loading/error states.
- [ ] Implement Argon2 hashing and never log passwords or tokens.
- [ ] Implement login, logout, refresh/session rotation, suspension handling, and secure HttpOnly/Secure/SameSite cookies.
- [ ] Implement forgot-password and reset-password tokens as random, hashed, expiring database records.
- [ ] Add rate limiting and abuse-safe error responses to auth endpoints.
- [ ] Implement onboarding avatar placeholder selection with clear selected/disabled states.
- [ ] Persist player display name and target HSK 1–4; target does not bypass HSK1.
- [ ] Create the initial HSK1 unlock transactionally when onboarding completes; make it idempotent.
- [ ] Redirect completed users to the main map and incomplete users back to onboarding.
- [ ] Match the register/onboarding references while covering validation, loading, empty, error, success, and responsive states.

## Phase 3 — Vocabulary & Stage Engine

- [ ] Inspect and document the Excel source schema in the import README.
- [ ] Build a reproducible import command with explicit source path, dry-run, validation report, checksum, and import version.
- [ ] Preserve original workbook immutability and record source row/source version for auditability.
- [ ] Validate HSK1–HSK4, required Hanzi/Pinyin/Thai meaning fields, duplicate identifiers, and malformed rows.
- [ ] Preserve duplicate Hanzi as separate Vocabulary rows; use stable IDs and Pinyin/meaning/source context.
- [ ] Generate normalized Pinyin sort keys deterministically and document the tone/tie-break rule.
- [ ] Sort independently inside each HSK level by the persisted sort key and stable tie-breakers.
- [ ] Generate persistent stages with 20 words per stage and a final remainder stage.
- [ ] Use the same `StageVocabulary` set for Flashcard, Quiz, Matching, and Listening.
- [ ] Prevent automatic stage regrouping after production; require controlled rebuild/append migration.
- [ ] Support nullable audio references and a non-crashing missing-audio fallback.
- [ ] Add vocabulary API with HSK filtering and search across Hanzi/Pinyin/Thai meaning.
- [ ] Build Vocabulary page cards showing Hanzi, Pinyin, and Thai meaning; card click plays audio, with no permanent speaker icon.
- [ ] Add card hover/pressed/focus feedback and learned/needs-review projection hooks.
- [ ] Add import/stage-generation unit and integration tests, including duplicate Hanzi and final remainder stages.

## Phase 4 — Progression Engine

- [ ] Implement typed balance loading/versioning for level, title, stars, city gates, and completion thresholds.
- [ ] Implement permanent XP ledger application and transactional UserProfile total XP/level updates.
- [ ] Implement XP curve, level cap 40, and four title bands.
- [ ] Implement per-user/per-stage/per-mode completion and best-stat projections.
- [ ] Implement Quiz/Matching/Listening Best Stars that never decrease.
- [ ] Implement exact per-mode completion rates for the four staged modes; exclude Review.
- [ ] Implement city Star maximum as `stageCount * 9` and Best Stars aggregation across the three star-producing modes.
- [ ] Implement configurable level gates HSK1=1, HSK2=8, HSK3=18, HSK4=28.
- [ ] Implement candidate-city unlock evaluation against the prerequisite city and all gates.
- [ ] Persist unlock decisions once and never relock after later config changes.
- [ ] Add boundary tests for levels, 70% completion, 70% Stars, dynamic stage counts, and unlock idempotency.

## Phase 5 — Flashcard

- [ ] Create server-backed Flashcard stage attempt/session state.
- [ ] Load the exact persistent stage vocabulary in order.
- [ ] Track every word viewed at least once for the user/stage/mode.
- [ ] Mark completion only after all stage words are viewed and the server accepts completion.
- [ ] Keep Flashcard at 0 XP, 0 Stars, and no competitive ranking contribution.
- [ ] Support card click-to-audio, missing-audio fallback, replay-safe navigation, and progress indicator.
- [ ] Implement loading, empty, locked, active, success, error, and completed states.
- [ ] Add integration and E2E coverage for partial view, refresh/retry, and duplicate completion.

## Phase 6 — Quiz

- [ ] Create a server-authoritative Quiz attempt with a server-issued item sequence and question snapshot.
- [ ] Generate four unique options, preferring the same stage and falling back to the same HSK level.
- [ ] Store option/order snapshots sufficient to reproduce what the player saw.
- [ ] Implement the 15-second configurable timer and server-side timeout validation.
- [ ] Accept one answer per item; reject stale, duplicate, out-of-order, unauthorized, and completed-attempt submissions.
- [ ] Record correct, wrong, timeout, selected option, and server-validated response time.
- [ ] Reset combo on wrong/timeout and increment on correct answers.
- [ ] Claim +10 base XP only once per user/stage/Quiz/vocabulary reward key.
- [ ] Claim combo milestones incrementally beyond the best previously rewarded milestone.
- [ ] Calculate attempt Stars from accuracy and update Best Stars only upward.
- [ ] Record wrong vocabulary and preserve historical counts while maintaining active Review state.
- [ ] Make replay improve accuracy, Stars, and combo without farming previously claimed rewards.
- [ ] Build result screen for accuracy, correct/wrong, combo, XP this attempt, Stars/Best Stars, mistakes, replay, Review, and navigation.
- [ ] Add unit tests for thresholds, timeout, base claim, combo increments, and idempotent completion.
- [ ] Add integration tests for duplicate requests, replay improvement, unauthorized answer submission, and transaction rollback.

## Phase 7 — Matching

- [ ] Create a server-authoritative Matching attempt using the exact stage vocabulary.
- [ ] Implement Chinese-to-Thai pair layout with randomized presentation and a server-validatable pair identity.
- [ ] Track server start/completion time and accepted pair actions; do not trust arbitrary client total time.
- [ ] Compute normalized average seconds per pair so remainder stages are comparable.
- [ ] Calculate Stars at <=3.0, <=4.5, <=6.0 seconds/pair boundaries.
- [ ] Calculate scaled XP for the actual item count.
- [ ] Award only positive reward-tier differences on replay; preserve best tier and best time.
- [ ] Record incorrect pair events and aggregate frequent mistakes.
- [ ] Build result screen with total time, seconds/pair, Stars, XP this attempt, Best Time, and mistakes.
- [ ] Add tests for threshold boundaries, one-item/remainder scaling, tier deltas, duplicate completion, and timing validation.

## Phase 8 — Listening

- [ ] Create a server-authoritative Listening attempt with four Hanzi options and an audio reference snapshot.
- [ ] Auto-play once after the server-issued question is ready; handle missing audio without crashing the stage.
- [ ] Enforce one additional replay per item on the backend and expose remaining replay state to the UI.
- [ ] Keep the timer running across replay; timeout is wrong and receives zero base XP.
- [ ] Record replay usage, selected option, timing, correctness, timeout, and wrong vocabulary.
- [ ] Claim newly rewardable +10 base XP once per user/stage/Listening/vocabulary reward key.
- [ ] Calculate and persist Best Stars using the Quiz/Listening thresholds; do not implement combo.
- [ ] Build result screen with accuracy, correct/wrong, XP this attempt, Stars/Best Stars, mistakes, and optional replay statistic.
- [ ] Add tests for autoplay fallback, replay limit, timer continuity, duplicate reward, timeout, and replay improvement.

## Phase 9 — Review

- [ ] Aggregate active wrong vocabulary from Quiz, Matching, and Listening with source-mode filters.
- [ ] Preserve lifetime wrong counts separately from the active `needsReview` queue.
- [ ] Snapshot eligible queue items at Review session start.
- [ ] Implement Review answer validation and resolution of one queued word.
- [ ] Award +2 XP only once per word per configured local day and only for a pre-existing queue item.
- [ ] Award +10 clear bonus once when the session-start snapshot is fully resolved.
- [ ] Ensure Review XP raises permanent XP/level but has `rankEligible=false`.
- [ ] Prevent intentional wrong-answer loops from producing infinite Review rewards.
- [ ] Build active problems, source filters, empty, loading, and cleared states.
- [ ] Add tests for aggregation, daily limits, queue snapshots, clear bonus idempotency, and ranking exclusion.

## Phase 10 — Main Map & City UX

- [ ] Build HSK1–HSK4 map using the supplied visual direction and asset keys.
- [ ] Show locked/unlocked city states without changing the unlock authority to the client.
- [ ] Show level requirement, per-mode completion progress, Star progress, and remaining unlock gaps.
- [ ] Build city view with five mode houses and staged-mode versus Review navigation.
- [ ] Build stage selector with locked, available, in-progress, completed, and improved-result states.
- [ ] Handle loading, empty, error, disabled, and responsive map/city states without distorting artwork.
- [ ] Add progression queries/mutations with TanStack Query invalidation after accepted game results.
- [ ] Add E2E coverage for HSK1 access, HSK2 lock, and unlock display after server-side completion.

## Phase 11 — Daily Missions

- [ ] Create database-backed mission definitions and typed progress event handlers.
- [ ] Use Asia/Bangkok local dates with UTC timestamps in storage.
- [ ] Seed three conservative MVP missions: learn words, answer timed questions, and complete a scored stage.
- [ ] Track progress from accepted server domain events, not client counters.
- [ ] Make mission completion and claim idempotent per mission/user/day.
- [ ] Keep mission reward ranking eligibility configurable and visible in balance/config data.
- [ ] Add optional all-missions bonus with a unique claim key.
- [ ] Add Main Map mission panel states and tests for date rollover and duplicate claim.

## Phase 12 — Ranking

- [ ] Create idempotent monthly seasons with Asia/Bangkok boundaries and historical retention.
- [ ] Aggregate Monthly XP from rank-eligible XpTransactions only; exclude Review and Flashcard.
- [ ] Implement Monthly Accuracy from eligible Quiz + Listening answers with the minimum-answer threshold.
- [ ] Implement Monthly Average Speed using effective per-item time: actual correct time, max timer for wrong/timeout, and Matching stage time/item count.
- [ ] Enforce speed eligibility minimum timed items and minimum accuracy; do not reward random fast wrong submissions.
- [ ] Implement Monthly Best Combo from legitimate Quiz combos occurring within the season.
- [ ] Store/rebuild MonthlyUserStat from immutable answer/XP facts; never mutate lifetime stats during rollover.
- [ ] Implement deterministic tie-breaks for all four metrics and document them in API contracts.
- [ ] Build current month header, four tabs, Top 3 podium, rows 4+, current-user position, nearby competitors, and gap-to-next-rank.
- [ ] Display lifetime Level, Title, Total Stars, and highest city as informational fields only.
- [ ] Add tests for season boundaries, rank eligibility, thresholds, effective speed, tie-breaks, rebuilds, and month rollover.

## Phase 13 — Profile & Statistics

- [ ] Build profile page with avatar key, display name, email, level, title, Total XP, target HSK, highest city, and logout.
- [ ] Add profile edits for avatar/name/password with validation and authorization.
- [ ] Build lifetime statistics and HSK-specific statistics with clear labels.
- [ ] Show learned vocabulary count, per-mode completion, Stars earned/max, Quiz/Listening accuracy, speed, best Matching time, best Quiz combo, Review count, top mistakes, and stage attempts.
- [ ] Keep Monthly ranking metrics visibly separate from lifetime metrics.
- [ ] Add loading, empty, error, and responsive states.

## Phase 14 — Mascot Assistant

- [ ] Build a replaceable placeholder Mascot component keyed by asset manifest IDs.
- [ ] Define deterministic domain events: first login, stage complete, wrong streak, timeout, combo milestones, level up, Star improvement, near unlock, unlock, mission progress/completion, ranking opportunity, and Review recommendation.
- [ ] Add localized Thai message templates with safe variable interpolation.
- [ ] Deliver progression hints, Review recommendations, and ranking encouragement without authoritative calculations in the Mascot layer.
- [ ] Store display/dismissal history only if needed for UX; never treat messages as reward claims.
- [ ] Add tests that event payloads produce deterministic messages and that replacing artwork requires no business-logic changes.

## Phase 15 — Admin / Content Management

- [ ] Add Admin RBAC guard and audit logging.
- [ ] Add user search, profile/progress view, suspend/activate, and basic XpTransaction inspection.
- [ ] Add Vocabulary CRUD/import with validation, source version, active status, Pinyin sort key, audio URL, and duplicate-Hanzi support.
- [ ] Add Stage preview and controlled generate/rebuild/append workflow with explicit confirmation and migration record.
- [ ] Prevent accidental production stage remapping and provide a diff preview before changes.
- [ ] Add balance/config management with effective versions and audit history.
- [ ] Add Daily Mission definition management and active/inactive/reward controls.
- [ ] Add basic monitoring views for users, attempts/day, XP/day, and error logs.

## Phase 16 — Responsive / UX States / Accessibility

- [ ] Audit every interactive route for default, hover, focus, selected, disabled, locked, loading, empty, error, success, timeout, completed, and improved-result states.
- [ ] Preserve the reference visual language on desktop.
- [ ] Add mobile/tablet fallback: collapsible navigation, card/list ranking, touch-sized game interactions, and aspect-ratio-safe map/city art.
- [ ] Add keyboard navigation and visible focus states.
- [ ] Add semantic labels, form errors, live timer/answer feedback, reduced-motion consideration, and sufficient contrast.
- [ ] Verify audio controls and autoplay/replay behavior are understandable and accessible.
- [ ] Run visual QA against all supplied references before finalizing decorative styles.

## Phase 17 — Testing & Security

- [ ] Unit-test XP formula, level cap/title, Star boundaries, Matching thresholds/scaling, reward claims, combo deltas, Review limits, city gates, and ranking calculations.
- [ ] Integration-test register/login/onboarding, initial unlock, vocabulary/stage import, game result transactions, replay rules, and monthly rebuild.
- [ ] Add Playwright critical flow: register → onboarding → HSK1 → Flashcard → Quiz → wrong word → Review → XP/level → Ranking.
- [ ] Test duplicate Quiz/Listening/Matching/Review completion requests and repeated network retries.
- [ ] Test replay exploits, combo/base XP farming, Matching tier farming, Review self-generation loops, mission claim duplication, and Listening replay bypass.
- [ ] Test ranking exploits: wrong-answer speed manipulation, timeout accounting, Review XP exclusion, season boundary, and unauthorized result submission.
- [ ] Test transaction/idempotency behavior under concurrent reward claims.
- [ ] Test authorization, suspended users, Admin-only routes, DTO validation, rate limiting, cookie flags, CORS, CSRF posture, and reset-token expiry.
- [ ] Add database fixtures and isolated test database lifecycle.
- [ ] Add observability checks for request IDs, safe errors, attempt failures, and XP claim conflicts.

## Phase 18 — Deployment

- [ ] Containerize the NestJS API and define production environment variables.
- [ ] Deploy Next.js web and API with explicit CORS/cookie configuration.
- [ ] Provision managed PostgreSQL and run versioned Prisma migrations.
- [ ] Configure CDN/object storage for backgrounds, characters, avatars, mascot art, and audio.
- [ ] Add secure secret management, database backups, restore rehearsal, and migration rollback guidance.
- [ ] Add structured logs, health checks, metrics/error reporting, and alerting for API/game completion failures.
- [ ] Run production smoke tests and Playwright against the deployed environment.
- [ ] Document release, stage-mapping, balance-config, and content-import procedures.

## Deferred / Future Features

- [ ] Speaking and pronunciation assessment.
- [ ] Writing and Chinese-character stroke assessment.
- [ ] Real-time PvP, player chat, and social features.
- [ ] Free-form AI chatbot, mnemonic generation, explanations, and example sentences.
- [ ] HSK5–HSK6 or non-HSK content.
- [ ] Shop, real-money purchases, cosmetics, and seasonal rewards.
- [ ] Production TTS generation service and audio batch pipeline.
- [ ] Redis or a separate leaderboard service if measured scale requires it.
- [ ] Advanced anti-cheat/e-sport telemetry.
- [ ] Mobile-native applications.

## Definition of MVP

HSK Mind is a playable MVP only when all of the following are true:

- [ ] Register, login, logout, onboarding, avatar placeholder, player name, and target HSK work against the database.
- [ ] HSK1 is unlocked for a new player and HSK2–HSK4 are server-locked until their gates are met.
- [ ] The vocabulary import is reproducible, validates the workbook, preserves duplicate Hanzi, and creates persistent Pinyin-sorted stages of up to 20 words.
- [ ] Vocabulary cards and Flashcard work with click-to-audio and safe missing-audio fallback, with no permanent speaker icon.
- [ ] Quiz works end-to-end with timer, timeout, answer validation, base XP once per rewardable word, incremental combo, Stars, replay improvement, result screen, and wrong vocabulary.
- [ ] Listening works end-to-end with audio, one replay maximum, timer continuity, XP anti-farming, Stars, result screen, and wrong vocabulary.
- [ ] Matching works end-to-end with normalized seconds/pair, Stars, scaled tier XP, replay tier differences, best time, and mistakes.
- [ ] Review aggregates wrong vocabulary and awards +2/+10 with anti-farming and no competitive ranking XP.
- [ ] Level/title, permanent XP, per-mode completion, 70% Stars, configured level gates, and permanent city unlocks work from server-calculated data.
- [ ] Daily Missions work with Asia/Bangkok dates and idempotent claims, with ranking eligibility configurable.
- [ ] Monthly XP, Accuracy, Speed, and Best Combo ranking work without resetting lifetime data and include eligibility/anti-exploit rules.
- [ ] Profile and statistics distinguish lifetime from monthly values.
- [ ] Deterministic Mascot events work with replaceable placeholder artwork.
- [ ] Admin can inspect users/rewards and manage vocabulary/import/stage/config content sufficiently for MVP operations.
- [ ] Backend unit/integration tests and the critical Playwright flow pass; desktop UI matches the references without major layout breaks.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-08-14 | Created discovery-based master implementation checklist. | Greenfield workspace contains specifications, design references, and the original vocabulary workbook but no application source. |
| 2026-08-14 | Recorded workbook structure and data risks: 2,000 rows; HSK counts 300/200/500/1,000; 21 duplicate Hanzi values; no audio or dedicated Pinyin sort-key column. | Drives stable UUID vocabulary entities, import validation, audio fallback, and deterministic stage generation. |
| 2026-08-14 | Chose server-authoritative, ledger-based, idempotent reward processing as the architecture baseline. | Prevents client tampering and duplicate XP from retries/replays while preserving monthly/lifetime separation. |
| 2026-08-14 | Approved and locked Pinyin sorting, full-item staged completion, exact-ratio completion, Review queue snapshots, one active attempt, lazy idempotent seasons, MVP mission ranking exclusion, and Matching 0-Star XP of 0. | Product decisions supplied before Phase 1 implementation. |
| 2026-08-14 | Confirmed Figma, mascot, avatar, character, and production audio assets are non-blocking for Phase 1. | Foundation uses replaceable asset keys and placeholders. |
| 2026-08-14 | Implemented Phase 1 Foundation: pnpm workspace, Next.js web, NestJS API, PostgreSQL Compose, Prisma schema/migration/seed, shared packages, environment validation, Swagger/health/logging, design tokens, and test tooling. | Approved Architecture and Phase 1 scope. |
| 2026-08-14 | Verified schema, generated Prisma Client, type checks, lint, formatting, unit tests, and production builds. | Evidence-based Phase 1 verification. |
| 2026-08-14 | Added Playwright configuration and a skipped Phase 2 placeholder test; test discovery now lists the configured Chromium project. | Establishes the E2E skeleton without starting authentication/onboarding work. |
| 2026-08-14 | Corrected `BalanceConfig` to use composite identity `(key, version)` so future audited balance versions can coexist. | Required for versioned configuration without overwriting prior values. |
| 2026-08-14 | PostgreSQL runtime verification remains open because Docker Desktop's engine is unavailable in the current environment. | Migration, seed, readiness, and combined local startup cannot be truthfully marked complete yet. |
| 2026-08-14 | Started PostgreSQL successfully, applied the initial migration, seeded 4 HSK levels and game-balance version 1, verified API readiness, and verified web/API/DB running together. | Docker Desktop became available; all remaining Phase 1 runtime checks passed. |
| 2026-08-14 | Prepared repository hygiene and Design Source documentation before Phase 2; no Phase 2 implementation was started. | Keep secrets/runtime artifacts out of Git and establish UX/UI source-of-truth rules. |
