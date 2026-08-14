import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { AuthService, SESSION_COOKIE } from "./auth.service";
import type { AuthenticatedRequest } from "./auth.types";

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  const item = header
    .split(";")
    .find((part) => part.trim().startsWith(`${name}=`));
  return item
    ? decodeURIComponent(item.trim().slice(name.length + 1))
    : undefined;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = await this.auth.authenticate(
      readCookie(request, SESSION_COOKIE),
    );
    request.authUser = auth.user;
    request.authSessionId = auth.sessionId;
    return true;
  }
}

export { readCookie };
