import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthenticatedRequest } from "../auth/auth.types";
import { CompleteOnboardingDto } from "./onboarding.dto";
import { OnboardingService } from "./onboarding.service";

@Controller("onboarding")
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get()
  getState(@Req() request: AuthenticatedRequest) {
    return this.onboarding.getState(request.authUser!.id);
  }

  @Post("complete")
  complete(
    @Req() request: AuthenticatedRequest,
    @Body() body: CompleteOnboardingDto,
  ) {
    return this.onboarding.complete(request.authUser!.id, body);
  }
}
