import { createHash, randomBytes } from "node:crypto";
import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();
const apiBase = process.env.API_BASE_URL ?? "http://localhost:3001/api";

type ApiResult = {
  status: number;
  body: Record<string, unknown>;
  cookie?: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function callApi(
  path: string,
  init: RequestInit = {},
  cookie?: string,
): Promise<ApiResult> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...(init.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const setCookie =
    response.headers.getSetCookie?.()[0] ??
    response.headers.get("set-cookie") ??
    undefined;
  return {
    status: response.status,
    body,
    cookie: setCookie?.split(";", 1)[0],
  };
}

async function main(): Promise<void> {
  const email = `phase2-${Date.now()}@example.test`;
  const originalPassword = "runtime-password-123";
  const newPassword = "runtime-password-456";
  const results: Record<string, string> = {};

  try {
    const register = await callApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password: originalPassword }),
    });
    assert(register.status === 201 && register.cookie, "Register failed");
    results.register = "passed";

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { profile: true },
    });
    assert(
      user.passwordHash.startsWith("$argon2id$"),
      "Password is not Argon2id",
    );

    const duplicate = await callApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password: originalPassword }),
    });
    assert(duplicate.status === 409, "Duplicate email was not rejected");
    results.duplicateEmail = "passed";

    const meBefore = await callApi("/auth/me", {}, register.cookie);
    assert(meBefore.status === 200, "Registered session is invalid");

    const onboarding = await callApi(
      "/onboarding/complete",
      {
        method: "POST",
        body: JSON.stringify({
          displayName: "Runtime Learner",
          avatarKey: "avatar_01",
          targetHsk: "HSK4",
        }),
      },
      register.cookie,
    );
    assert(onboarding.status === 201, "Onboarding completion failed");
    const duplicateOnboarding = await callApi(
      "/onboarding/complete",
      {
        method: "POST",
        body: JSON.stringify({
          displayName: "Should Not Replace",
          avatarKey: "avatar_04",
          targetHsk: "HSK2",
        }),
      },
      register.cookie,
    );
    assert(duplicateOnboarding.status === 201, "Duplicate onboarding failed");

    const persisted = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { profile: true, unlocks: true },
    });
    assert(
      persisted.profile?.displayName === "Runtime Learner",
      "Onboarding is not idempotent",
    );
    assert(
      persisted.profile?.targetHsk === "HSK4",
      "Target HSK was not persisted",
    );
    assert(
      persisted.unlocks.length === 1 && persisted.unlocks[0]?.hskLevelId === 1,
      "Initial HSK1 unlock is invalid",
    );
    results.onboardingPersistence = "passed";
    results.initialHsk1Unlock = "passed";
    results.duplicateOnboarding = "passed";

    const refresh = await callApi(
      "/auth/refresh",
      { method: "POST" },
      register.cookie,
    );
    assert(refresh.status === 201 && refresh.cookie, "Session rotation failed");
    const oldSession = await callApi("/auth/me", {}, register.cookie);
    const rotatedSession = await callApi("/auth/me", {}, refresh.cookie);
    assert(
      oldSession.status === 401 && rotatedSession.status === 200,
      "Old session was not revoked during rotation",
    );
    results.refreshRotation = "passed";

    const logout = await callApi(
      "/auth/logout",
      { method: "POST" },
      refresh.cookie,
    );
    const afterLogout = await callApi("/auth/me", {}, refresh.cookie);
    assert(
      logout.status === 201 && afterLogout.status === 401,
      "Logout did not revoke session",
    );
    results.logout = "passed";

    const login = await callApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: originalPassword }),
    });
    assert(login.status === 201 && login.cookie, "Valid login failed");
    results.login = "passed";

    const invalidLogin = await callApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: "incorrect-password" }),
    });
    assert(invalidLogin.status === 401, "Invalid login was accepted");
    results.invalidLogin = "passed";

    const forgot = await callApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    assert(forgot.status === 201, "Forgot-password request failed");
    const issuedReset = await prisma.passwordResetToken.findFirstOrThrow({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    assert(
      /^[a-f0-9]{64}$/.test(issuedReset.tokenHash),
      "Reset token is not hashed",
    );
    assert(
      issuedReset.expiresAt > new Date(),
      "Reset token does not have a future expiry",
    );
    results.forgotPassword = "passed";

    const validRawToken = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(validRawToken),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const reset = await callApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: validRawToken, password: newPassword }),
    });
    assert(reset.status === 201, "Valid reset token was rejected");
    const oldPasswordLogin = await callApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: originalPassword }),
    });
    const newPasswordLogin = await callApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: newPassword }),
    });
    assert(
      oldPasswordLogin.status === 401 && newPasswordLogin.status === 201,
      "Password reset was not applied",
    );
    results.resetPassword = "passed";

    const expiredRawToken = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(expiredRawToken),
        expiresAt: new Date(Date.now() - 1_000),
      },
    });
    const expiredReset = await callApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: expiredRawToken,
        password: originalPassword,
      }),
    });
    const invalidReset = await callApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: randomBytes(32).toString("base64url"),
        password: originalPassword,
      }),
    });
    assert(
      expiredReset.status === 401 && invalidReset.status === 401,
      "Expired/invalid reset token was accepted",
    );
    results.resetTokenExpiryAndInvalid = "passed";

    const noCookieProtected = await callApi("/onboarding");
    assert(
      noCookieProtected.status === 401,
      "Protected API route allowed unauthenticated access",
    );
    results.protectedRoute = "passed";

    await prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.SUSPENDED },
    });
    const suspendedLogin = await callApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: newPassword }),
    });
    assert(
      suspendedLogin.status === 401,
      "Suspended account was allowed to log in",
    );
    results.suspensionHandling = "passed";

    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});
