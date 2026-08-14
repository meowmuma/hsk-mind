import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { validateEnv } from "./config/env";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { PrismaService } from "./common/prisma.service";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { HealthController } from "./health.controller";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { AuthGuard } from "./auth/auth.guard";
import { RateLimitService } from "./auth/rate-limit.service";
import { OnboardingController } from "./onboarding/onboarding.controller";
import { OnboardingService } from "./onboarding/onboarding.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })],
  controllers: [HealthController, AuthController, OnboardingController],
  providers: [
    PrismaService,
    AuthService,
    AuthGuard,
    RateLimitService,
    OnboardingService,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes(HealthController);
  }
}
