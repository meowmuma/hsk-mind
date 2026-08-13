import { PrismaClient, HskCode } from "@prisma/client";
import { GAME_BALANCE } from "@hsk-mind/game-config";

const prisma = new PrismaClient();
const levels = [
  {
    id: 1,
    code: HskCode.HSK1,
    thaiName: "หมู่บ้านไผ่",
    order: 1,
    unlockLevel: 1,
  },
  {
    id: 2,
    code: HskCode.HSK2,
    thaiName: "เมืองโคมแดง",
    order: 2,
    unlockLevel: 8,
  },
  {
    id: 3,
    code: HskCode.HSK3,
    thaiName: "หุบเขาหมอก",
    order: 3,
    unlockLevel: 18,
  },
  {
    id: 4,
    code: HskCode.HSK4,
    thaiName: "ยอดเขาเซียน",
    order: 4,
    unlockLevel: 28,
  },
];

async function main(): Promise<void> {
  for (const level of levels)
    await prisma.hskLevel.upsert({
      where: { id: level.id },
      update: level,
      create: level,
    });
  await prisma.balanceConfig.upsert({
    where: { key_version: { key: "game-balance", version: 1 } },
    update: { valuesJson: GAME_BALANCE },
    create: { key: "game-balance", version: 1, valuesJson: GAME_BALANCE },
  });
  console.log(`Seeded ${levels.length} HSK levels and game balance version 1.`);
}

main().finally(() => prisma.$disconnect());
