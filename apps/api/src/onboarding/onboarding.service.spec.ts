import { HskCode } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { OnboardingService } from "./onboarding.service";

describe("OnboardingService", () => {
  it("persists preferences and creates HSK1 unlock transactionally", async () => {
    const profile = {
      userId: "user-1",
      displayName: "Meow",
      avatarKey: "avatar_01",
      targetHsk: HskCode.HSK3,
    };
    const tx = {
      userProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(profile),
      },
      userHskUnlock: { upsert: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as never;
    const service = new OnboardingService(prisma);
    const result = await service.complete("user-1", {
      displayName: "Meow",
      avatarKey: "avatar_01",
      targetHsk: HskCode.HSK3,
    });
    expect(result.unlockedHsk).toEqual([HskCode.HSK1]);
    expect(tx.userHskUnlock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_hskLevelId: { userId: "user-1", hskLevelId: 1 } },
      }),
    );
  });

  it("makes repeated completion idempotent through the same upsert key", async () => {
    const tx = {
      userProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      userHskUnlock: { upsert: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as never;
    const service = new OnboardingService(prisma);
    await service.complete("user-1", {
      displayName: "Meow",
      avatarKey: "avatar_01",
      targetHsk: HskCode.HSK1,
    });
    await service.complete("user-1", {
      displayName: "Meow",
      avatarKey: "avatar_01",
      targetHsk: HskCode.HSK1,
    });
    expect(tx.userHskUnlock.upsert).toHaveBeenCalledTimes(2);
  });

  it("does not rewrite a completed onboarding timestamp", async () => {
    const completed = {
      userId: "user-1",
      onboardingCompletedAt: new Date("2026-01-01T00:00:00Z"),
    };
    const tx = {
      userProfile: {
        findUnique: vi.fn().mockResolvedValue(completed),
        update: vi.fn(),
      },
      userHskUnlock: { upsert: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as never;
    await new OnboardingService(prisma).complete("user-1", {
      displayName: "Changed",
      avatarKey: "avatar_02",
      targetHsk: HskCode.HSK4,
    });
    expect(tx.userProfile.update).not.toHaveBeenCalled();
  });
});
