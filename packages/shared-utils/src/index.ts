export function normalizePinyinSortKey(pinyin: string): string {
  return pinyin
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function normalizePinyinFull(pinyin: string): string {
  return pinyin.toLowerCase().replace(/[^\p{L}\p{N}\u0300-\u036f]/gu, "");
}

export function stageCount(itemCount: number, stageSize = 20): number {
  if (!Number.isInteger(itemCount) || itemCount < 0)
    throw new Error("itemCount must be a non-negative integer");
  if (!Number.isInteger(stageSize) || stageSize <= 0)
    throw new Error("stageSize must be a positive integer");
  return Math.ceil(itemCount / stageSize);
}

export function exactCompletionRatio(
  completedStages: number,
  totalStages: number,
): number {
  if (totalStages <= 0) return 0;
  return completedStages / totalStages;
}

export function meetsCompletionThreshold(
  completedStages: number,
  totalStages: number,
  threshold = 0.7,
): boolean {
  return exactCompletionRatio(completedStages, totalStages) >= threshold;
}
