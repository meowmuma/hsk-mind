import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma, UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import type { Request } from "express";
import { PrismaService } from "../common/prisma.service";
import { RateLimitService } from "./rate-limit.service";
import type { AuthenticatedUser } from "./auth.types";

export const SESSION_COOKIE = "hsk_mind_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const RESET_TTL_MS = 1000 * 60 * 30;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function clientIp(request: Request): string {
  return request.ip || request.socket.remoteAddress || "unknown";
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly rateLimit: RateLimitService,
  ) {}

  private enforceRateLimit(request: Request, action: string): void {
    this.rateLimit.consume(`${action}:${clientIp(request)}`, 10, 60_000);
  }

  async register(
    email: string,
    password: string,
    request: Request,
  ): Promise<{ user: AuthenticatedUser; sessionToken: string }> {
    this.enforceRateLimit(request, "register");
    const normalizedEmail = normalizeEmail(email);
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    try {
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          profile: { create: {} },
        },
        include: { profile: true },
      });
      return { user, sessionToken: await this.issueSession(user.id, request) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException("Email is already registered");
      throw error;
    }
  }

  async login(
    email: string,
    password: string,
    request: Request,
  ): Promise<{ user: AuthenticatedUser; sessionToken: string }> {
    this.enforceRateLimit(request, "login");
    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      include: { profile: true },
    });
    if (!user || user.status !== UserStatus.ACTIVE)
      throw new UnauthorizedException("Invalid email or password");
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException("Invalid email or password");
    return { user, sessionToken: await this.issueSession(user.id, request) };
  }

  async issueSession(userId: string, request: Request): Promise<string> {
    this.enforceRateLimit(request, "session");
    const rawToken = randomBytes(32).toString("base64url");
    await this.prisma.userSession.create({
      data: {
        userId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    return rawToken;
  }

  async authenticate(
    rawToken: string | undefined,
  ): Promise<{ user: AuthenticatedUser; sessionId: string }> {
    if (!rawToken) throw new UnauthorizedException("Authentication required");
    const session = await this.prisma.userSession.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: { include: { profile: true } } },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== UserStatus.ACTIVE
    )
      throw new UnauthorizedException("Authentication required");
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });
    return { user: session.user, sessionId: session.id };
  }

  async rotate(
    rawToken: string | undefined,
    request: Request,
  ): Promise<{
    user: AuthenticatedUser;
    sessionToken: string;
  }> {
    const current = await this.authenticate(rawToken);
    const sessionToken = randomBytes(32).toString("base64url");
    await this.prisma.$transaction([
      this.prisma.userSession.update({
        where: { id: current.sessionId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.userSession.create({
        data: {
          userId: current.user.id,
          tokenHash: hashToken(sessionToken),
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        },
      }),
    ]);
    void request;
    return { user: current.user, sessionToken };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await this.prisma.userSession.updateMany({
      where: { tokenHash: hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async requestPasswordReset(email: string, request: Request): Promise<void> {
    this.enforceRateLimit(request, "forgot-password");
    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (!user || user.status !== UserStatus.ACTIVE) return;
    const rawToken = randomBytes(32).toString("base64url");
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    // Delivery is intentionally an adapter boundary. Never log or return rawToken.
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date())
      throw new UnauthorizedException("Reset token is invalid or expired");
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.userSession.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  getCookieOptions(): {
    httpOnly: true;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  } {
    return {
      httpOnly: true,
      secure: this.config.get<boolean>("AUTH_COOKIE_SECURE") ?? false,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_MS,
    };
  }
}
