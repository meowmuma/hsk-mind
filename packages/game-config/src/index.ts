import type { HskCode } from "@hsk-mind/shared-types";

export const GAME_BALANCE = {
  maxLevel: 40,
  stageSize: 20,
  xpLevel: { baseNextLevelXp: 200, increasePerLevel: 25 },
  cityUnlock: {
    HSK1: { level: 1 },
    HSK2: { level: 8 },
    HSK3: { level: 18 },
    HSK4: { level: 28 },
    completionRequired: 0.7,
    starRateRequired: 0.7,
  },
  quiz: {
    timerSeconds: 15,
    correctBaseXp: 10,
    stars: { three: 0.9, two: 0.75, one: 0.6 },
    comboBonus: { 5: 5, 10: 10, 15: 15, 20: 20 },
  },
  listening: {
    timerSeconds: 15,
    replayLimit: 1,
    correctBaseXp: 10,
    stars: { three: 0.9, two: 0.75, one: 0.6 },
  },
  matching: {
    secondsPerItem: { three: 3, two: 4.5, one: 6 },
    xpFor20Items: { three: 200, two: 150, one: 100, zero: 0 },
  },
  review: {
    xpPerResolvedWord: 2,
    clearQueueBonusXp: 10,
    maxXpClaimsPerWordPerDay: 1,
    rankEligible: false,
  },
  dailyMissions: { rewardValuesFinal: false, rankEligible: false },
  leaderboard: {
    accuracyMinAnswers: 100,
    speedMinTimedItems: 100,
    speedMinAccuracy: 0.7,
    timezone: "Asia/Bangkok",
  },
} as const;

export function unlockLevelFor(hskCode: HskCode): number {
  return GAME_BALANCE.cityUnlock[hskCode].level;
}
