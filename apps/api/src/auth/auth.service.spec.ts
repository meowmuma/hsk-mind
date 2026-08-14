import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import { RateLimitService } from "./rate-limit.service";

const request = {
  ip: "127.0.0.1",
  socket: { remoteAddress: "127.0.0.1" },
} as never;
const activeUser = {
  id: "user-1",
  email: "learner@example.com",
  passwordHash: "",
  role: "USER",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: { userId: "user-1", onboardingCompletedAt: null },
};

function createService(overrides: Record<string, unknown> = {}) {
  const prisma = {
    user: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    userSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
    ...overrides,
  } as never;
  const service = new AuthService(
    prisma,
    { get: vi.fn(() => false) } as never,
    new RateLimitService(),
  );
  return {
    service,
    prisma: prisma as {
      user: Record<string, ReturnType<typeof vi.fn>>;
      userSession: Record<string, ReturnType<typeof vi.fn>>;
      passwordResetToken: Record<string, ReturnType<typeof vi.fn>>;
    },
  };
}

describe("AuthService", () => {
  it("registers with an Argon2 hash and creates a session", async () => {
    const { service, prisma } = createService();
    prisma.user.create.mockImplementation(
      async ({ data }: { data: { passwordHash: string } }) => ({
        ...activeUser,
        passwordHash: data.passwordHash,
      }),
    );
    prisma.userSession.create.mockResolvedValue({});
    const result = await service.register(
      " Learner@Example.com ",
      "password123",
      request,
    );
    expect(result.user.email).toBe("learner@example.com");
    expect(result.sessionToken).toHaveLength(43);
    expect(prisma.user.create.mock.calls[0][0].data.passwordHash).not.toBe(
      "password123",
    );
    expect(prisma.user.create.mock.calls[0][0].data.passwordHash).toMatch(
      /^\$argon2id\$/,
    );
  });

  it("returns a conflict for duplicate email", async () => {
    const { service, prisma } = createService();
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    await expect(
      service.register("learner@example.com", "password123", request),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("uses one abuse-safe login error for unknown users", async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login("missing@example.com", "wrong", request),
    ).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });

  it("logs in with a valid password and never returns the password hash as a token", async () => {
    const { service, prisma } = createService();
    prisma.user.create.mockImplementation(
      async ({ data }: { data: { passwordHash: string } }) => ({
        ...activeUser,
        passwordHash: data.passwordHash,
      }),
    );
    const registered = await service.register(
      "learner@example.com",
      "password123",
      request,
    );
    const user = { ...activeUser, passwordHash: registered.user.passwordHash };
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.userSession.create.mockResolvedValue({});
    const result = await service.login(
      "learner@example.com",
      "password123",
      request,
    );
    expect(result.sessionToken).not.toContain(user.passwordHash);
    expect(prisma.userSession.create).toHaveBeenCalled();
  });

  it("returns a generic forgot-password response for unknown email without creating a token", async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.requestPasswordReset("unknown@example.com", request),
    ).resolves.toBeUndefined();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("rejects expired reset tokens", async () => {
    const { service, prisma } = createService();
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      usedAt: null,
      expiresAt: new Date(Date.now() - 1),
      userId: "user-1",
    });
    await expect(
      service.resetPassword("a".repeat(43), "password123"),
    ).rejects.toMatchObject({ status: 401 });
  });
});
