export const HSK_CODES = ["HSK1", "HSK2", "HSK3", "HSK4"] as const;
export type HskCode = (typeof HSK_CODES)[number];
export const GAME_MODES = [
  "FLASHCARD",
  "QUIZ",
  "MATCHING",
  "LISTENING",
  "REVIEW",
] as const;
export type GameMode = (typeof GAME_MODES)[number];
export const STAGED_GAME_MODES = [
  "FLASHCARD",
  "QUIZ",
  "MATCHING",
  "LISTENING",
] as const;
export type StagedGameMode = (typeof STAGED_GAME_MODES)[number];
export type ApiError = {
  error: {
    code: string;
    message: string | string[];
    requestId: string;
    statusCode: number;
  };
};
export type HealthResponse = {
  status: "ok";
  service: string;
  uptimeSeconds: number;
};
