import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthGuard, readCookie } from "./auth.guard";
import { AuthService, SESSION_COOKIE } from "./auth.service";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";
import type { AuthenticatedRequest } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setSession(response: Response, token: string): void {
    response.cookie(SESSION_COOKIE, token, this.auth.getCookieOptions());
  }

  private clearSession(response: Response): void {
    response.clearCookie(SESSION_COOKIE, this.auth.getCookieOptions());
  }

  @Post("register")
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.register(body.email, body.password, request);
    this.setSession(response, result.sessionToken);
    return { user: this.publicUser(result.user), next: "onboarding" };
  }

  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(body.email, body.password, request);
    this.setSession(response, result.sessionToken);
    return {
      user: this.publicUser(result.user),
      next: result.user.profile?.onboardingCompletedAt ? "map" : "onboarding",
    };
  }

  @Post("refresh")
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.rotate(
      readCookie(request, SESSION_COOKIE),
      request,
    );
    this.setSession(response, result.sessionToken);
    return { user: this.publicUser(result.user) };
  }

  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(readCookie(request, SESSION_COOKIE));
    this.clearSession(response);
    return { ok: true };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@Req() request: AuthenticatedRequest) {
    return { user: this.publicUser(request.authUser!) };
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Req() request: Request,
  ) {
    await this.auth.requestPasswordReset(body.email, request);
    return {
      message: "If the email is eligible, reset instructions will be sent.",
    };
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.auth.resetPassword(body.token, body.password);
    return { message: "Password reset successful" };
  }

  private publicUser(
    user: NonNullable<AuthenticatedRequest["authUser"]> | any,
  ) {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            avatarKey: user.profile.avatarKey,
            targetHsk: user.profile.targetHsk,
            level: user.profile.level,
            totalXp: user.profile.totalXp,
            onboardingCompleted: Boolean(user.profile.onboardingCompletedAt),
          }
        : null,
    };
  }
}
