CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "HskCode" AS ENUM ('HSK1', 'HSK2', 'HSK3', 'HSK4');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER', "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "UserProfile" (
  "userId" UUID NOT NULL, "displayName" TEXT, "avatarKey" TEXT, "targetHsk" "HskCode",
  "level" INTEGER NOT NULL DEFAULT 1, "totalXp" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);
CREATE TABLE "UserSession" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "userId" UUID NOT NULL, "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userId_expiresAt_idx" ON "UserSession"("userId", "expiresAt");

CREATE TABLE "HskLevel" (
  "id" INTEGER NOT NULL, "code" "HskCode" NOT NULL, "thaiName" TEXT NOT NULL,
  "order" INTEGER NOT NULL, "unlockLevel" INTEGER NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "HskLevel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HskLevel_code_key" ON "HskLevel"("code");
CREATE UNIQUE INDEX "HskLevel_order_key" ON "HskLevel"("order");

CREATE TABLE "Vocabulary" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "hskLevelId" INTEGER NOT NULL, "hanzi" TEXT NOT NULL,
  "pinyin" TEXT NOT NULL, "pinyinSortKey" TEXT NOT NULL, "thaiMeaning" TEXT NOT NULL, "audioUrl" TEXT,
  "sourceRow" INTEGER, "sourceVersion" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Vocabulary_hskLevelId_pinyinSortKey_idx" ON "Vocabulary"("hskLevelId", "pinyinSortKey");

CREATE TABLE "Stage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "hskLevelId" INTEGER NOT NULL, "stageNo" INTEGER NOT NULL,
  "generation" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Stage_hskLevelId_stageNo_key" ON "Stage"("hskLevelId", "stageNo");
CREATE TABLE "StageVocabulary" (
  "stageId" UUID NOT NULL, "vocabularyId" UUID NOT NULL, "orderNo" INTEGER NOT NULL,
  CONSTRAINT "StageVocabulary_pkey" PRIMARY KEY ("stageId", "vocabularyId")
);
CREATE UNIQUE INDEX "StageVocabulary_stageId_orderNo_key" ON "StageVocabulary"("stageId", "orderNo");

CREATE TABLE "UserHskUnlock" (
  "userId" UUID NOT NULL, "hskLevelId" INTEGER NOT NULL, "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserHskUnlock_pkey" PRIMARY KEY ("userId", "hskLevelId")
);
CREATE TABLE "BalanceConfig" (
  "key" TEXT NOT NULL, "version" INTEGER NOT NULL, "valuesJson" JSONB NOT NULL,
  "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BalanceConfig_pkey" PRIMARY KEY ("key", "version")
);

ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_hskLevelId_fkey" FOREIGN KEY ("hskLevelId") REFERENCES "HskLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_hskLevelId_fkey" FOREIGN KEY ("hskLevelId") REFERENCES "HskLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StageVocabulary" ADD CONSTRAINT "StageVocabulary_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StageVocabulary" ADD CONSTRAINT "StageVocabulary_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserHskUnlock" ADD CONSTRAINT "UserHskUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserHskUnlock" ADD CONSTRAINT "UserHskUnlock_hskLevelId_fkey" FOREIGN KEY ("hskLevelId") REFERENCES "HskLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
