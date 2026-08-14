import type { User, UserProfile } from "@prisma/client";
import type { Request } from "express";

export type AuthenticatedUser = User & { profile: UserProfile | null };

export type AuthenticatedRequest = Request & {
  authUser?: AuthenticatedUser;
  authSessionId?: string;
};
