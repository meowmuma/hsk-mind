import { Injectable } from "@nestjs/common";
import { HskCode } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import type { CompleteOnboardingDto } from "./onboarding.dto";

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getState(userId: string) {
    const [profile, unlocks] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.userHskUnlock.findMany({
        where: { userId },
        include: { hskLevel: true },
        orderBy: { hskLevelId: "asc" },
      }),
    ]);
    return {
      profile,
      unlockedHsk: unlocks.map((item) => item.hskLevel.code),
      avatarOptions: ["avatar_01", "avatar_02", "avatar_03", "avatar_04"],
      targetOptions: Object.values(HskCode),
    };
  }

  async complete(userId: string, input: CompleteOnboardingDto) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.userProfile.findUnique({ where: { userId } });
      const profile = current?.onboardingCompletedAt
        ? current
        : await tx.userProfile.update({
            where: { userId },
            data: {
              displayName: input.displayName.trim(),
              avatarKey: input.avatarKey,
              targetHsk: input.targetHsk,
              onboardingCompletedAt: new Date(),
            },
          });
      await tx.userHskUnlock.upsert({
        where: { userId_hskLevelId: { userId, hskLevelId: 1 } },
        update: {},
        create: { userId, hskLevelId: 1 },
      });
      return {
        profile,
        unlockedHsk: [HskCode.HSK1],
      };
    });
  }
}
